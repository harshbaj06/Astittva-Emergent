"""News service for Market Intelligence — Google News RSS aggregator with MongoDB cache."""
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from urllib.parse import quote
from typing import List, Dict, Optional

import feedparser
import requests

logger = logging.getLogger("astitva.news")

CACHE_TTL_HOURS = 6

# Topic queries grouped by level
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
    "india": [
        "india_real_estate", "residential", "commercial", "luxury",
        "policy", "infrastructure", "metro", "smart_cities", "reit", "rbi",
    ],
    "global": ["global", "uae", "singapore", "london", "us", "wealth_migration"],
}


def google_news_url(query: str) -> str:
    return f"https://news.google.com/rss/search?q={quote(query)}&hl=en-IN&gl=IN&ceid=IN:en"


def _parse_entries(feed_url: str, topic: str, limit: int = 15) -> List[Dict]:
    try:
        # Use requests w/ timeout then feed to feedparser (avoids hangs)
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
            # Google News RSS source typically inside <source> tag
            source = ""
            if "source" in e:
                source = getattr(e.source, "title", "") or ""
            elif "tags" in e and e.tags:
                source = e.tags[0].get("term", "") or ""
            # Strip Google News redirect details — keep title
            title = (e.title or "").strip()
            summary = (getattr(e, "summary", "") or "").strip()
            # Many GNews summaries contain HTML/anchors — keep raw, frontend will sanitize/strip
            out.append({
                "topic": topic,
                "title": title,
                "summary": summary,
                "link": e.link,
                "source": source,
                "published": published,
            })
        except Exception as inner:  # noqa: BLE001
            logger.debug(f"Skip malformed entry: {inner}")
    return out


async def fetch_topic(db, topic: str, force: bool = False) -> List[Dict]:
    """Fetch a single topic with cache."""
    cache = await db.news_cache.find_one({"topic": topic})
    now = datetime.now(timezone.utc)
    if cache and not force:
        last = cache.get("fetched_at")
        if last and (now - datetime.fromisoformat(last)) < timedelta(hours=CACHE_TTL_HOURS):
            arr = cache.get("articles", [])
            arr = sorted(arr, key=lambda x: x.get("published") or "", reverse=True)
            return arr
    # refresh
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
    """Fetch combined news for a group (local/india/global) — interleaved, deduped."""
    topics = GROUPS.get(group, [])
    results: List[Dict] = []
    seen = set()
    # parallel
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
    # sort by published desc
    results.sort(key=lambda x: x.get("published") or "", reverse=True)
    return results[:24]
