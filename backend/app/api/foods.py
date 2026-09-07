from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.food import FoodOut
from app.services.search_service import search_foods, barcode_lookup

router=APIRouter(prefix="/api/v1/foods",tags=["foods"])

@router.get("/search",response_model=list[FoodOut])
async def search(q: str=Query(min_length=2,max_length=120), limit:int=Query(20,ge=1,le=50), db:Session=Depends(get_db)):
    return await search_foods(db,q,limit)

@router.get("/barcode/{code}",response_model=FoodOut)
async def barcode(code:str,db:Session=Depends(get_db)):
    item=await barcode_lookup(db,code)
    if not item:raise HTTPException(404,"Product not found")
    return item
