from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.session import Base, engine
from app.api.foods import router as foods_router
from app.models import food  # noqa: F401

settings=get_settings()
app=FastAPI(title="FitOS Food API",version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
app.include_router(foods_router)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status":"ok","service":"fitos-food-api","version":"0.4.0"}
