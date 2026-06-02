"""News service for Market Intelligence — Google News RSS aggregator with classification.

Design goals:
- Multi-tag classification (an article can be Infrastructure + Investment + Commercial).
- Rolling archive: never wipe cached articles on a bad/empty fetch — merge new + old,
  dedupe by link, keep newest N items.
- Smart cache TTL (3h) with graceful fallback to last-known-good when feed is empty.
- Frontend-friendly payload: provides both `category` (primary, legacy) and `categories` (list).
"""
import asyncio
import logging
import re
from datetime import datetime, timezone, timedelta
from urllib.parse import quote
from typing import List, Dict

import feedparser
import requests

logger = logging.getLogger("astitva.news")

CACHE_TTL_HOURS = 3
ROLLING_ARCHIVE_LIMIT = 100  # per topic — never let cache fall below this
ALL_FEED_LIMIT = 100

# Topic queries
TOPICS = {
    "trending": "Kolkata real estate India property market",
    # LEVEL 1 — LOCAL
    "new_town": "New Town Kolkata real estate",
    "rajarhat": "Rajarhat Kolkata property",
    "kolkata": "Kolkata real estate",
    "greater_kolkata": "Greater Kolkata property market",
    "west_bengal": "West Bengal real estate",
    # LEVEL 2 — INDIA
    "india_real_estate": "India real estate market",
    "residential": "India residential housing market",
    "commercial": "India commercial real estate",
    "luxury": "India luxury housing",
    "policy": "India housing policy government",
    "infrastructure": "India infrastructure development",
    "metro": "India metro project",
    "smart_cities": "India smart cities mission",
    "reit": "India REIT real estate investment trust",
    "rbi": "RBI interest rate housing India",
    "economy": "India economy GDP inflation property",
    "technology": "India proptech AI data center real estate",
    # LEVEL 3 — GLOBAL
    "global": "global real estate market",
    "uae": "UAE Dubai property market",
    "singapore": "Singapore property market",
    "london": "London real estate market",
    "us": "US real estate market",
    "wealth_migration": "wealth migration HNI international investment",
}

GROUPS = {
    "local": ["new_town", "rajarhat", "kolkata", "greater_kolkata", "west_bengal"],
    "india": ["india_real_estate", "residential", "commercial", "luxury", "policy",
              "infrastructure", "metro", "smart_cities", "reit", "rbi", "economy", "technology"],
    "global": ["global", "uae", "singapore", "london", "us", "wealth_migration"],
}

# State / country lookup
STATE_BY_CITY = {
    "New Town": "West Bengal", "Rajarhat": "West Bengal", "Kolkata": "West Bengal",
    "Mumbai": "Maharashtra", "Pune": "Maharashtra",
    "Delhi": "Delhi NCR", "Bengaluru": "Karnataka",
    "Hyderabad": "Telangana", "Chennai": "Tamil Nadu",
    "Ahmedabad": "Gujarat",
    "Dubai": "Dubai", "Abu Dhabi": "Abu Dhabi",
    "Singapore": "Singapore", "London": "Greater London",
    "New York": "New York", "Hong Kong": "Hong Kong",
}

CITY_PATTERNS = [
    ("New Town", r"\bnew\s*town\b"),
    ("Rajarhat", r"\brajarhat\b"),
    ("Kolkata", r"\b(kolkata|calcutta)\b"),
    ("Mumbai", r"\b(mumbai|bombay)\b"),
    ("Delhi", r"\b(delhi|ncr|gurgaon|gurugram|noida)\b"),
    ("Bengaluru", r"\b(bengaluru|bangalore)\b"),
    ("Hyderabad", r"\bhyderabad\b"),
    ("Pune", r"\bpune\b"),
    ("Chennai", r"\b(chennai|madras)\b"),
    ("Ahmedabad", r"\bahmedabad\b"),
    ("Dubai", r"\bdubai\b"),
    ("Abu Dhabi", r"\babu\s*dhabi\b"),
    ("Singapore", r"\bsingapore\b"),
    ("London", r"\blondon\b"),
    ("New York", r"\b(new\s*york|manhattan)\b"),
    ("Hong Kong", r"\bhong\s*kong\b"),
]

COUNTRY_BY_CITY = {
    "New Town": "India", "Rajarhat": "India", "Kolkata": "India", "Mumbai": "India",
    "Delhi": "India", "Bengaluru": "India", "Hyderabad": "India", "Pune": "India",
    "Chennai": "India", "Ahmedabad": "India",
    "Dubai": "UAE", "Abu Dhabi": "UAE",
    "Singapore": "Singapore", "London": "UK", "New York": "USA", "Hong Kong": "Hong Kong",
}

# Default country/city by topic prefix. (city, country)
TOPIC_DEFAULTS = {
    "new_town": ("New Town", "India"), "rajarhat": ("Rajarhat", "India"),
    "kolkata": ("Kolkata", "India"), "greater_kolkata": ("Kolkata", "India"),
    "west_bengal": ("West Bengal", "India"),
    # India-themed topics: empty city until detected, but default country = India
    "trending": ("", "India"),
    "india_real_estate": ("", "India"), "residential": ("", "India"),
    "commercial": ("", "India"), "luxury": ("", "India"),
    "policy": ("", "India"), "infrastructure": ("", "India"),
    "metro": ("", "India"), "smart_cities": ("", "India"),
    "reit": ("", "India"), "rbi": ("", "India"),
    "economy": ("", "India"), "technology": ("", "India"),
    # Global
    "uae": ("Dubai", "UAE"), "singapore": ("Singapore", "Singapore"),
    "london": ("London", "UK"), "us": ("New York", "USA"),
    "wealth_migration": ("Global", "Global"), "global": ("Global", "Global"),
}

# Multi-tag category patterns. ALL matching categories are applied (no early exit).
CATEGORY_PATTERNS = [
    ("Infrastructure", r"\b(metro|rail(?:way)?|highway|road|airport|infrastructure|connectivity|corridor|bridge|expressway|port)\b"),
    ("Technology", r"\b(proptech|fintech|\bai\b|technology|digital|blockchain|smart\s*home|data\s*cent(?:er|re)|semiconductor|saas|startup)\b"),
    ("Economy", r"\b(gdp|economy|economic|inflation|rate\s*cut|interest\s*rate|rbi|fiscal|monetary|recession)\b"),
    ("Luxury Property", r"\b(luxury|premium|ultra[-\s]*luxury|hni|branded\s*residence|penthouse|villa|mansion|high[-\s]*end)\b"),
    ("Commercial Real Estate", r"\b(commercial|office|business\s*park|retail|warehouse|logistics|coworking|grade\s*a|mall|workspace)\b"),
    ("Policy", r"\b(policy|government|rera|regulation|gst|stamp\s*duty|approval|legislat|tax|budget|reform|scheme)\b"),
    ("Investment", r"\b(reit|invest(?:or|ment|ing|ed|s)?|yield|appreciation|portfolio|fund|capital|fdi|institutional|equity|ipo)\b"),
    ("Residential", r"\b(residential|housing|apartment|villa|home|flat|property|condominium|condo|society)\b"),
]

IMPACT_HIGH = re.compile(
    r"\b(approved|approval|launch(?:ed|es)?|breakthrough|landmark|record|"
    r"announc(?:ed|es|ement)|surge|jump(?:s|ed)?|rally|rallies|expand(?:s|ed|sion)|"
    r"foreign\s+investment|fdi|policy\s+change|infrastructure\s+investment|"
    r"billion|crore|all-time|new\s+high|reform)\b",
    re.IGNORECASE,
)
IMPACT_MED = re.compile(
    r"\b(growth|rise(?:s|n)?|increase(?:s|d)?|demand|invest|gain(?:s)?|momentum|expansion|outlook)\b",
    re.IGNORECASE,
)

WHY_IT_MATTERS_BY_CAT = {
    "Infrastructure": "Improved connectivity historically lifts property values and rental demand in surrounding micro-markets.",
    "Luxury Property": "Strong luxury transaction volume signals enduring HNI confidence and price stability at the premium tier.",
    "Commercial Real Estate": "Commercial expansion drives nearby residential demand and rental yields through workforce relocation.",
    "Policy": "Policy clarity reduces investor risk and unlocks fresh institutional capital flow into the sector.",
    "Investment": "Capital flow trends reveal where smart money is allocating — a leading indicator of the next 12-24 months.",
    "Residential": "Residential demand shifts reflect underlying employment and migration patterns — core to long-term appreciation.",
    "Economy": "Macro-economic shifts directly influence interest rates, affordability and investor sentiment in real estate.",
    "Technology": "PropTech adoption and digital infrastructure reshape pricing transparency and attract a new class of investor.",
}

# Topic → implicit category fallback (when text has no clear keyword)
TOPIC_CATEGORY_FALLBACK = {
    "infrastructure": "Infrastructure", "metro": "Infrastructure", "smart_cities": "Infrastructure",
    "commercial": "Commercial Real Estate",
    "luxury": "Luxury Property",
    "policy": "Policy",
    "reit": "Investment", "rbi": "Investment", "wealth_migration": "Investment",
    "economy": "Economy",
    "technology": "Technology",
}


def classify(title: str, summary: str, topic: str) -> Dict:
    text = f"{title} {summary}".lower()

    # City + country
    city, country = TOPIC_DEFAULTS.get(topic, ("", ""))
    for tag, pat in CITY_PATTERNS:
        if re.search(pat, text):
            city = tag
            country = COUNTRY_BY_CITY.get(tag, country)
            break

    state = STATE_BY_CITY.get(city, "")
    if topic == "west_bengal" and not state:
        state = "West Bengal"

    # Multi-tag categories (all matching patterns)
    categories: List[str] = []
    for cat, pat in CATEGORY_PATTERNS:
        if re.search(pat, text):
            categories.append(cat)

    # Topic-implicit fallback if nothing matched
    if not categories:
        fallback = TOPIC_CATEGORY_FALLBACK.get(topic, "Residential")
        categories = [fallback]

    primary = categories[0]

    if IMPACT_HIGH.search(text):
        impact = "High"
    elif IMPACT_MED.search(text):
        impact = "Medium"
    else:
        impact = "Low"

    why = WHY_IT_MATTERS_BY_CAT.get(primary, "") if impact == "High" else ""

    return {
        "city": city or "—",
        "state": state or "—",
        "country": country or "—",
        "category": primary,        # legacy single-category
        "categories": categories,   # multi-tag
        "impact": impact,
        "why_it_matters": why,
    }


def google_news_url(query: str) -> str:
    return f"https://news.google.com/rss/search?q={quote(query)}&hl=en-IN&gl=IN&ceid=IN:en"


def _parse_entries(feed_url: str, topic: str, limit: int = 25) -> List[Dict]:
    try:
        r = requests.get(feed_url, timeout=10, headers={"User-Agent": "AstitvaBot/1.0"})
        feed = feedparser.parse(r.content)
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Feed fetch failed for {topic}: {e}")
        return []
    out = []
    for e in feed.entries[:limit]:
        try:
            published = ""
            if getattr(e, "published_parsed", None):
                published = datetime(*e.published_parsed[:6], tzinfo=timezone.utc).isoformat()
            source = ""
            if "source" in e:
                source = getattr(e.source, "title", "") or ""
            title = (e.title or "").strip()
            summary = (getattr(e, "summary", "") or "").strip()
            classification = classify(title, summary, topic)
            out.append({
                "topic": topic,
                "title": title,
                "summary": summary,
                "link": e.link,
                "source": source,
                "published": published,
                **classification,
            })
        except Exception as inner:  # noqa: BLE001
            logger.debug(f"Skip malformed entry: {inner}")
    logger.info(f"[news] topic={topic} parsed={len(out)} from feed")
    return out


def _merge_articles(old: List[Dict], new: List[Dict], limit: int = ROLLING_ARCHIVE_LIMIT) -> List[Dict]:
    """Merge old + new articles, dedupe by link, return latest `limit` by published date."""
    seen = set()
    merged: List[Dict] = []
    for src in (new, old):  # new first so its classification wins
        for a in src:
            key = a.get("link") or a.get("title", "")[:120]
            if not key or key in seen:
                continue
            seen.add(key)
            merged.append(a)
    merged.sort(key=lambda x: x.get("published") or "", reverse=True)
    return merged[:limit]


async def fetch_topic(db, topic: str, force: bool = False) -> List[Dict]:
    cache = await db.news_cache.find_one({"topic": topic})
    now = datetime.now(timezone.utc)
    cached_articles = (cache or {}).get("articles", []) if cache else []

    # Serve from cache if fresh enough
    if cache and not force:
        last = cache.get("fetched_at")
        if last and (now - datetime.fromisoformat(last)) < timedelta(hours=CACHE_TTL_HOURS):
            logger.info(f"[news] topic={topic} served from cache count={len(cached_articles)}")
            return sorted(cached_articles, key=lambda x: x.get("published") or "", reverse=True)

    # Try a fresh fetch
    url = google_news_url(TOPICS.get(topic, topic))
    fresh = await asyncio.to_thread(_parse_entries, url, topic)

    if fresh:
        merged = _merge_articles(cached_articles, fresh)
        await db.news_cache.update_one(
            {"topic": topic},
            {"$set": {"topic": topic, "articles": merged, "fetched_at": now.isoformat()}},
            upsert=True,
        )
        logger.info(f"[news] topic={topic} refreshed fresh={len(fresh)} merged={len(merged)}")
        return merged

    # Fresh fetch failed → keep serving stale cache (rolling archive)
    if cached_articles:
        logger.warning(f"[news] topic={topic} fresh fetch empty; serving stale cache n={len(cached_articles)}")
        # bump fetched_at slightly so we don't hammer; but only by 30 min so retry happens soon
        retry_at = (now - timedelta(hours=CACHE_TTL_HOURS - 0.5)).isoformat()
        await db.news_cache.update_one(
            {"topic": topic},
            {"$set": {"fetched_at": retry_at}},
            upsert=True,
        )
        return cached_articles

    logger.warning(f"[news] topic={topic} no fresh and no cache")
    return []


async def fetch_group(db, group: str, per_topic: int = 6) -> List[Dict]:
    topics = GROUPS.get(group, [])
    results: List[Dict] = []
    seen = set()
    fetched = await asyncio.gather(*[fetch_topic(db, t) for t in topics], return_exceptions=True)
    for arr in fetched:
        if isinstance(arr, Exception):
            continue
        for a in arr[:per_topic]:
            key = (a.get("link") or a.get("title", "")[:120])
            if key in seen:
                continue
            seen.add(key)
            results.append(a)
    results.sort(key=lambda x: x.get("published") or "", reverse=True)
    return results[:36]


async def fetch_all_classified(db) -> List[Dict]:
    """Combined feed across all topics with filter metadata for the unified Market Intelligence feed."""
    all_topics = list(TOPICS.keys())
    fetched = await asyncio.gather(*[fetch_topic(db, t) for t in all_topics], return_exceptions=True)
    seen = set()
    results: List[Dict] = []
    total_parsed = 0
    for arr in fetched:
        if isinstance(arr, Exception):
            continue
        total_parsed += len(arr)
        for a in arr[:6]:
            key = (a.get("link") or a.get("title", "")[:120])
            if key in seen:
                continue
            seen.add(key)
            results.append(a)
    results.sort(key=lambda x: x.get("published") or "", reverse=True)
    logger.info(f"[news] /all parsed_total={total_parsed} returned={min(len(results), ALL_FEED_LIMIT)}")
    return results[:ALL_FEED_LIMIT]
