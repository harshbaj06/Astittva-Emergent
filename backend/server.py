"""Astitva Real Estate - FastAPI Backend
Premium luxury real estate platform.
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated
from bson import ObjectId

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Header, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict

import io

from news_service import (
    fetch_topic, fetch_group, fetch_all_classified, latest_fetched_at,
    TOPICS, GROUPS, CACHE_TTL_HOURS, ROLLING_ARCHIVE_LIMIT,
)
from crm_service import forward_lead

# ---------------------------------------------------------------------------
# Config & Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("astitva")

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']
ACCESS_EXPIRES_MIN = 60 * 12  # 12 hours for admin convenience
REFRESH_EXPIRES_DAYS = 7

APP_NAME = os.environ.get("APP_NAME", "astitva-realestate")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
_storage_key: Optional[str] = None

VALID_ROLES = {"admin", "sales", "marketing"}

# ---------------------------------------------------------------------------
# Object Storage Helpers
# ---------------------------------------------------------------------------
def init_storage() -> Optional[str]:
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY missing - object storage disabled")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        logger.info("Object storage initialized")
        return _storage_key
    except Exception as e:  # noqa: BLE001
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 403:
        # Refresh key once
        global _storage_key
        _storage_key = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Mongo helpers
# ---------------------------------------------------------------------------
def _validate_objectid(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        return v
    raise ValueError("Invalid ObjectId")

PyObjectId = Annotated[str, BeforeValidator(_validate_objectid)]


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRES_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRES_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, httponly=True, secure=True,
                        samesite="none", max_age=ACCESS_EXPIRES_MIN * 60, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True,
                        samesite="none", max_age=REFRESH_EXPIRES_DAYS * 86400, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user.pop("_id"))
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(*roles):
    async def checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return user
    return checker


require_admin = require_role("admin")
require_staff = require_role("admin", "sales", "marketing")


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegisterUserIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # admin, sales, marketing


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: Optional[str] = None


class PropertyIn(BaseModel):
    project_name: str
    builder: Optional[str] = ""
    location: str
    city: str
    starting_price: Optional[float] = None
    price_label: Optional[str] = ""
    property_type: str  # Residential / Commercial / Retail / Office Space / Villa / Apartment / Penthouse / Plot
    property_category: Optional[str] = ""  # Luxury / Ultra Luxury / Investment / Commercial / Waterfront / Golf Facing / Smart Home
    description: str
    images: List[str] = Field(default_factory=list)  # storage paths
    rera_number: Optional[str] = ""
    possession_date: Optional[str] = ""
    google_maps_url: Optional[str] = ""
    bedrooms: Optional[str] = ""
    area_sqft: Optional[str] = ""
    amenities: List[str] = Field(default_factory=list)
    status: str = "draft"  # draft / published / unpublished (publication state)
    availability: Optional[str] = "Under Construction"  # Ready To Move / Under Construction / New Launch / Sold Out
    is_featured: bool = False


class PropertyOut(PropertyIn):
    id: str
    created_at: str
    updated_at: str


class LeadIn(BaseModel):
    # New CRM-aligned identity fields
    prefix: Optional[str] = "Mr"
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    phone_code: Optional[str] = "+91"
    # Legacy compatibility — accept `name` and we'll split it into first/last
    name: Optional[str] = None
    email: EmailStr
    phone: str
    interest: Optional[str] = ""
    budget: Optional[str] = ""
    message: Optional[str] = ""
    source: Optional[str] = "homepage"
    preferred_city: Optional[str] = "Kolkata"
    preferred_locality: Optional[str] = ""
    investment_purpose: Optional[str] = ""
    property_type: Optional[str] = ""
    timeline: Optional[str] = ""
    # Property tracking — populated by Property Detail / Site Visit forms
    project: Optional[str] = ""
    property_location: Optional[str] = ""
    preferred_date: Optional[str] = ""


class LeadOut(LeadIn):
    id: str
    created_at: str
    status: str = "new"


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Astitva Real Estate API")
api_router = APIRouter(prefix="/api")


# ---------------------- Auth Routes ----------------------
@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response, request: Request):
    email = payload.email.lower().strip()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"

    # Brute force check
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await db.login_attempts.delete_one({"identifier": identifier})
    uid = str(user["_id"])
    access = create_access_token(uid, user["email"], user["role"])
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {
        "user": {
            "id": uid,
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
        },
        "access_token": access,
    }


@api_router.post("/auth/logout")
async def logout(response: Response, _user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
    }


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"], user["role"])
        response.set_cookie("access_token", access, httponly=True, secure=True,
                            samesite="none", max_age=ACCESS_EXPIRES_MIN * 60, path="/")
        return {"access_token": access}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------------------- User Management (admin only) ----------------------
@api_router.get("/users", response_model=List[UserOut])
async def list_users(_admin: dict = Depends(require_admin)):
    users = await db.users.find().sort("created_at", -1).to_list(500)
    return [
        UserOut(
            id=str(u["_id"]), email=u["email"], name=u["name"], role=u["role"],
            created_at=u.get("created_at"),
        ) for u in users
    ]


@api_router.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: RegisterUserIn, _admin: dict = Depends(require_admin)):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already in use")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "role": payload.role,
        "created_at": now_utc_iso(),
    }
    res = await db.users.insert_one(doc)
    return UserOut(id=str(res.inserted_id), email=email, name=payload.name,
                   role=payload.role, created_at=doc["created_at"])


@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete self")
    res = await db.users.delete_one({"_id": ObjectId(user_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


# ---------------------- Properties (public + admin) ----------------------
def serialize_property(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "project_name": doc.get("project_name", ""),
        "builder": doc.get("builder", ""),
        "location": doc.get("location", ""),
        "city": doc.get("city", ""),
        "starting_price": doc.get("starting_price"),
        "price_label": doc.get("price_label", ""),
        "property_type": doc.get("property_type", ""),
        "property_category": doc.get("property_category", ""),
        "description": doc.get("description", ""),
        "images": doc.get("images", []),
        "rera_number": doc.get("rera_number", ""),
        "possession_date": doc.get("possession_date", ""),
        "google_maps_url": doc.get("google_maps_url", ""),
        "bedrooms": doc.get("bedrooms", ""),
        "area_sqft": doc.get("area_sqft", ""),
        "amenities": doc.get("amenities", []),
        "status": doc.get("status", "draft"),
        "is_featured": doc.get("is_featured", False),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@api_router.get("/properties")
async def list_properties(
    city: Optional[str] = None,
    location: Optional[str] = None,
    property_type: Optional[str] = None,
    category: Optional[str] = None,
    builder: Optional[str] = None,
    availability: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    limit: int = 100,
):
    """Public endpoint - only returns published properties. All filters AND-combined."""
    query: dict = {"status": "published"}
    if city:
        query["city"] = city
    if location:
        # Match against the location field OR the city field — luxury micro-markets
        # like "New Town" / "Action Area II" can live in either column historically.
        query["$or"] = [{"location": location}, {"city": location}]
    if property_type:
        query["property_type"] = property_type
    if category:
        query["property_category"] = category
    if builder:
        query["builder"] = builder
    if availability:
        query["availability"] = availability
    if min_price is not None or max_price is not None:
        price_q: dict = {}
        if min_price is not None:
            price_q["$gte"] = float(min_price)
        if max_price is not None:
            price_q["$lte"] = float(max_price)
        query["starting_price"] = price_q
    if featured is not None:
        query["is_featured"] = featured
    docs = await db.properties.find(query).sort("created_at", -1).to_list(limit)
    return [serialize_property(d) for d in docs]


@api_router.get("/properties/{prop_id}")
async def get_property(prop_id: str):
    try:
        doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc or doc.get("status") != "published":
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize_property(doc)


@api_router.get("/admin/properties")
async def admin_list_properties(_user: dict = Depends(require_staff)):
    docs = await db.properties.find().sort("created_at", -1).to_list(500)
    return [serialize_property(d) for d in docs]


@api_router.get("/admin/properties/{prop_id}")
async def admin_get_property(prop_id: str, _user: dict = Depends(require_staff)):
    try:
        doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize_property(doc)


@api_router.post("/admin/properties", status_code=201)
async def create_property(payload: PropertyIn, _user: dict = Depends(require_staff)):
    doc = payload.model_dump()
    doc["created_at"] = now_utc_iso()
    doc["updated_at"] = doc["created_at"]
    res = await db.properties.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_property(doc)


@api_router.put("/admin/properties/{prop_id}")
async def update_property(prop_id: str, payload: PropertyIn, _user: dict = Depends(require_staff)):
    update = payload.model_dump()
    update["updated_at"] = now_utc_iso()
    res = await db.properties.update_one({"_id": ObjectId(prop_id)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    return serialize_property(doc)


@api_router.patch("/admin/properties/{prop_id}/status")
async def set_property_status(prop_id: str, body: dict, _user: dict = Depends(require_staff)):
    status = body.get("status")
    if status not in {"draft", "published", "unpublished"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.properties.update_one(
        {"_id": ObjectId(prop_id)},
        {"$set": {"status": status, "updated_at": now_utc_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"ok": True, "status": status}


@api_router.delete("/admin/properties/{prop_id}")
async def delete_property(prop_id: str, _user: dict = Depends(require_admin)):
    res = await db.properties.delete_one({"_id": ObjectId(prop_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"ok": True}


# ---------------------- Leads ----------------------
@api_router.post("/leads", status_code=201)
async def create_lead(payload: LeadIn):
    doc = payload.model_dump()
    # Legacy compat: if frontend still posts "name", split into first/last for CRM
    if doc.get("name") and not (doc.get("first_name") or doc.get("last_name")):
        parts = (doc["name"] or "").strip().split(None, 1)
        doc["first_name"] = parts[0] if parts else ""
        doc["last_name"] = parts[1] if len(parts) > 1 else ""
    doc["created_at"] = now_utc_iso()
    doc["status"] = "new"
    # 1. Save locally FIRST so a CRM outage never loses the lead.
    res = await db.leads.insert_one(doc)
    lead_id = str(res.inserted_id)
    # 2. Best-effort forward to CRM. Logged + stamped, never raises.
    crm_result = await forward_lead(doc)
    await db.leads.update_one(
        {"_id": res.inserted_id},
        {"$set": {
            "crm_status": crm_result["status"],
            "crm_http_status": crm_result.get("http_status"),
            "crm_error": crm_result.get("error"),
            "crm_response": crm_result.get("response"),
            "crm_attempted_at": now_utc_iso(),
        }},
    )
    return {"id": lead_id, "ok": True, "crm": {"status": crm_result["status"]}}


@api_router.get("/admin/leads")
async def list_leads(_user: dict = Depends(require_staff)):
    docs = await db.leads.find().sort("created_at", -1).to_list(1000)
    return [
        {
            "id": str(d["_id"]),
            "name": d.get("name"),
            "email": d.get("email"),
            "phone": d.get("phone"),
            "interest": d.get("interest", ""),
            "budget": d.get("budget", ""),
            "preferred_locality": d.get("preferred_locality", ""),
            "investment_purpose": d.get("investment_purpose", ""),
            "property_type": d.get("property_type", ""),
            "timeline": d.get("timeline", ""),
            "message": d.get("message", ""),
            "source": d.get("source", ""),
            "status": d.get("status", "new"),
            "crm_status": d.get("crm_status", "skipped"),
            "crm_http_status": d.get("crm_http_status"),
            "crm_error": d.get("crm_error"),
            "created_at": d.get("created_at"),
        }
        for d in docs
    ]


@api_router.patch("/admin/leads/{lead_id}")
async def update_lead_status(lead_id: str, body: dict, _user: dict = Depends(require_staff)):
    status = body.get("status")
    if status not in {"new", "contacted", "qualified", "closed"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True}


@api_router.post("/admin/leads/{lead_id}/crm-retry")
async def retry_crm(lead_id: str, _user: dict = Depends(require_staff)):
    """Manually re-forward a stored lead to the CRM (for ops recovery)."""
    doc = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Lead not found")
    crm_result = await forward_lead(doc)
    await db.leads.update_one(
        {"_id": ObjectId(lead_id)},
        {"$set": {
            "crm_status": crm_result["status"],
            "crm_http_status": crm_result.get("http_status"),
            "crm_error": crm_result.get("error"),
            "crm_response": crm_result.get("response"),
            "crm_attempted_at": now_utc_iso(),
        }},
    )
    return {"ok": crm_result["ok"], "crm": crm_result}


@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, _user: dict = Depends(require_admin)):
    res = await db.leads.delete_one({"_id": ObjectId(lead_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True}


# ---------------------- File Upload ----------------------
MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "webp": "image/webp", "gif": "image/gif",
}


@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(require_staff)):
    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    path = f"{APP_NAME}/properties/{user['id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")
    content_type = file.content_type or MIME_TYPES[ext]
    result = put_object(path, data, content_type)
    stored_path = result["path"]
    await db.files.insert_one({
        "storage_path": stored_path,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "uploaded_by": user["id"],
        "is_deleted": False,
        "created_at": now_utc_iso(),
    })
    return {"path": stored_path}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    """Publicly serve property images (storage paths are unguessable UUIDs)."""
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return StreamingResponse(io.BytesIO(data), media_type=record.get("content_type", content_type))


# ---------------------- Stats ----------------------
@api_router.get("/admin/stats")
async def stats(_user: dict = Depends(require_staff)):
    return {
        "properties_total": await db.properties.count_documents({}),
        "properties_published": await db.properties.count_documents({"status": "published"}),
        "leads_total": await db.leads.count_documents({}),
        "leads_new": await db.leads.count_documents({"status": "new"}),
        "users_total": await db.users.count_documents({}),
    }


# ---------------------- Root ----------------------
@api_router.get("/")
async def root():
    return {"service": "Astitva Real Estate API", "ok": True}


# ---------------------- Market Intelligence (Google News RSS) ----------------------
@api_router.get("/news/trending")
async def news_trending():
    articles = await fetch_topic(db, "trending")
    return {"articles": articles[:12]}


@api_router.get("/news/all")
async def news_all():
    """Unified classified feed across all topics — for Market Intelligence filterable view."""
    articles = await fetch_all_classified(db)
    last_updated = await latest_fetched_at(db)
    return {"articles": articles, "last_updated": last_updated, "count": len(articles)}


@api_router.get("/news/group/{group}")
async def news_group(group: str):
    if group not in GROUPS:
        raise HTTPException(status_code=400, detail="Invalid group")
    articles = await fetch_group(db, group)
    return {"group": group, "articles": articles}


@api_router.get("/news/topics")
async def news_topics():
    return {"topics": list(TOPICS.keys()), "groups": GROUPS}


@api_router.get("/news/debug")
async def news_debug():
    """Public diagnostic endpoint — pipeline state for Market Intelligence.
    Returns per-topic article counts + last fetched_at + total served by /news/all.
    """
    from datetime import datetime as _dt, timezone as _tz
    now = _dt.now(_tz.utc)
    pipeline = []
    for topic in TOPICS.keys():
        cache = await db.news_cache.find_one({"topic": topic})
        if cache:
            arr = cache.get("articles", [])
            fetched_at = cache.get("fetched_at")
            try:
                age_min = int((now - _dt.fromisoformat(fetched_at)).total_seconds() / 60) if fetched_at else None
            except Exception:
                age_min = None
            pipeline.append({
                "topic": topic,
                "count": len(arr),
                "fetched_at": fetched_at,
                "age_minutes": age_min,
            })
        else:
            pipeline.append({"topic": topic, "count": 0, "fetched_at": None, "age_minutes": None})
    total_articles = await fetch_all_classified(db)
    return {
        "ok": True,
        "timestamp": now.isoformat(),
        "cache_ttl_hours": CACHE_TTL_HOURS,
        "rolling_archive_limit": ROLLING_ARCHIVE_LIMIT,
        "all_feed_total": len(total_articles),
        "topics": pipeline,
    }


@api_router.post("/admin/news/refresh")
async def news_refresh(_user: dict = Depends(require_staff)):
    """Force refresh trending + groups (admin)."""
    await fetch_topic(db, "trending", force=True)
    for g in GROUPS:
        await fetch_group(db, g)
    return {"ok": True, "refreshed_at": now_utc_iso()}


app.include_router(api_router)


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
frontend_url = os.environ.get("FRONTEND_URL", "")
allowed = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
if frontend_url and frontend_url not in allowed:
    allowed.append(frontend_url)
# Always allow local dev
for o in ["http://localhost:3000", "http://localhost:5173"]:
    if o not in allowed:
        allowed.append(o)

# Wildcard with credentials is rejected by browsers. If "*" is in the configured list,
# echo the request Origin back via regex (this satisfies credentialed requests from any origin).
if "*" in allowed:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@astitva.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "Astitva@2026")
    name = os.environ.get("ADMIN_NAME", "Astitva Admin")
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "email": email,
            "password_hash": hash_password(password),
            "name": name,
            "role": "admin",
            "created_at": now_utc_iso(),
        })
        logger.info(f"Seeded admin user: {email}")
    else:
        if not verify_password(password, existing["password_hash"]):
            await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})
            logger.info(f"Updated admin password: {email}")


@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.properties.create_index([("status", 1), ("created_at", -1)])
        await db.properties.create_index("is_featured")
        await db.leads.create_index("created_at")
        await db.login_attempts.create_index("identifier")
        await seed_admin()
        init_storage()
        logger.info("Astitva backend started")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Startup error: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
