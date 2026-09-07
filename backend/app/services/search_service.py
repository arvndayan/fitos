import asyncio
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.services.repository import search_db, upsert_external, get_by_barcode as db_barcode
from app.services.providers.usda import search_usda
from app.services.providers.open_food_facts import legacy_text_search, get_by_barcode as off_barcode

def _dedupe(items: list[dict]) -> list[dict]:
    seen=set(); out=[]
    for x in items:
        key=(x.get("barcode") or "", (x.get("name") or "").lower(), (x.get("brand") or "").lower())
        if key in seen: continue
        seen.add(key); out.append(x)
    return out

async def search_foods(db: Session, query: str, limit: int = 20) -> list[dict]:
    local = search_db(db, query, limit)
    if len(local) >= min(limit, 8):
        return local[:limit]

    usda_task = search_usda(query, limit)
    off_task = legacy_text_search(query, min(limit, 10))
    usda, off = await asyncio.gather(usda_task, off_task, return_exceptions=True)
    usda = [] if isinstance(usda, Exception) else usda
    off = [] if isinstance(off, Exception) else off
    merged = _dedupe(local + usda + off)[:limit]

    settings=get_settings()
    if settings.cache_external_results:
        existing_sources={(x["source"], str(x["sourceId"])) for x in local}
        for x in merged:
            if (x["source"], str(x["sourceId"])) in existing_sources:
                continue
            try:
                upsert_external(db, x)
            except Exception:
                db.rollback()
    return merged

async def barcode_lookup(db: Session, code: str):
    local=db_barcode(db,code)
    if local:return local
    external=await off_barcode(code)
    if external and get_settings().cache_external_results:
        try:return upsert_external(db,external)
        except Exception:db.rollback()
    return external
