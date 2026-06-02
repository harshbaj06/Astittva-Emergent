"""News service for Market Intelligence — Google News RSS aggregator with classification."""
import asyncio
import logging
import re
from datetime import datetime, timezone, timedelta
from urllib.parse import quote
from typing import List, Dict

import feedparser
import requests

logger = logging.getLogger("astitva.news")

CACHE_TTL_HOURS = 6

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
    "india": ["india_real_estate", "residential", "commercial", "luxury", "policy", "infrastructure", "metro", "smart_cities", "reit", "rbi", "economy", "technology"],
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

# Classification dictionaries
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

# Default country/city by topic prefix
TOPIC_DEFAULTS = {
    "new_town": ("New Town", "India"), "rajarhat": ("Rajarhat", "India"),
    "kolkata": ("Kolkata", "India"), "greater_kolkata": ("Kolkata", "India"),
    "west_bengal": ("West Bengal", "India"),
    "uae": ("Dubai", "UAE"), "singapore": ("Singapore", "Singapore"),
    "london": ("London", "UK"), "us": ("New York", "USA"),
    "wealth_migration": ("Global", "Global"), "global": ("Global", "Global"),
}

CATEGORY_PATTERNS = [
    ("Infrastructure", r"\b(metro|rail|highway|airport|infrastructure|connectivity|corridor|bridge)\b"),
    ("Technology", r"\b(proptech|fintech|ai|technology|digital|blockchain|smart\s*home)\b"),
    ("Economy", r"\b(gdp|economy|inflation|rate\s*cut|economic\s*growth|fiscal)\b"),
    ("Luxury Property", r"\b(luxury|premium|ultra-luxury|hni|branded\s*residence|penthouse)\b"),
    ("Commercial Real Estate", r"\b(commercial|office|retail|warehouse|logistics|coworking|grade\s*a)\b"),
    ("Policy", r"\b(policy|government|rera|regulation|gst|stamp\s*duty|approval|legislat)\b"),
    ("Investment", r"\b(reit|invest|yield|appreciation|portfolio|fund|capital|fdi)\b"),
    ("Residential", r"\b(residential|housing|apartment|villa|home|flat|property)\b"),
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
    # special-case West Bengal topic
    if topic == "west_bengal" and not state:
        state = "West Bengal"

    # Category
    category = ""
    for cat, pat in CATEGORY_PATTERNS:
        if re.search(pat, text):
            category = cat
            break
    if not category:
        if topic in {"infrastructure", "metro", "smart_cities"}: category = "Infrastructure"
        elif topic == "commercial": category = "Commercial Real Estate"
        elif topic == "luxury": category = "Luxury Property"
        elif topic == "policy": category = "Policy"
        elif topic in {"reit", "rbi"}: category = "Investment"
        elif topic == "economy": category = "Economy"
        elif topic == "technology": category = "Technology"
        else: category = "Residential"

    # Impact
    if IMPACT_HIGH.search(text):
        impact = "High"
    elif IMPACT_MED.search(text):
        impact = "Medium"
    else:
        impact = "Low"

    why = WHY_IT_MATTERS_BY_CAT.get(category, "") if impact == "High" else ""

    return {
        "city": city or "—",
        "state": state or "—",
        "country": country or "—",
        "category": category,
        "impact": impact,
        "why_it_matters": why,
    }


def google_news_url(query: str) -> str:
    return f"https://news.google.com/rss/search?q={quote(query)}&hl=en-IN&gl=IN&ceid=IN:en"


def _parse_entries(feed_url: str, topic: str, limit: int = 15) -> List[Dict]:
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
    return out


async def fetch_topic(db, topic: str, force: bool = False) -> List[Dict]:
    cache = await db.news_cache.find_one({"topic": topic})
    now = datetime.now(timezone.utc)
    if cache and not force:
        last = cache.get("fetched_at")
        if last and (now - datetime.fromisoformat(last)) < timedelta(hours=CACHE_TTL_HOURS):
            arr = cache.get("articles", [])
            return sorted(arr, key=lambda x: x.get("published") or "", reverse=True)
    url = google_news_url(TOPICS.get(topic, topic))
    articles = await asyncio.to_thread(_parse_entries, url, topic)
    articles = sorted(articles, key=lambda x: x.get("published") or "", reverse=True)
    if articles:
        await db.news_cache.update_one(
            {"topic": topic},
            {"$set": {"topic": topic, "articles": articles, "fetched_at": now.isoformat()}},
            upsert=True,
        )
    elif cache:
        return cache.get("articles", [])
    return articles


async def fetch_group(db, group: str, per_topic: int = 4) -> List[Dict]:
    topics = GROUPS.get(group, [])
    results: List[Dict] = []
    seen = set()
    fetched = await asyncio.gather(*[fetch_topic(db, t) for t in topics], return_exceptions=True)
    for arr in fetched:
        if isinstance(arr, Exception):
            continue
        for a in arr[:per_topic]:
            key = a.get("title", "").lower()[:80]
            if key in seen:
                continue
            seen.add(key)
            results.append(a)
    results.sort(key=lambda x: x.get("published") or "", reverse=True)
    return results[:24]


async def fetch_all_classified(db) -> List[Dict]:
    """Combined feed across all topics with filter metadata for the unified Market Intelligence feed."""
    all_topics = list(TOPICS.keys())
    fetched = await asyncio.gather(*[fetch_topic(db, t) for t in all_topics], return_exceptions=True)
    seen = set()
    results: List[Dict] = []
    for arr in fetched:
        if isinstance(arr, Exception): continue
        for a in arr[:3]:
            key = a.get("title", "").lower()[:80]
            if key in seen: continue
            seen.add(key)
            results.append(a)
    results.sort(key=lambda x: x.get("published") or "", reverse=True)
    return results[:48]
