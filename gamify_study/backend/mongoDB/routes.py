from fastapi import APIRouter
from config import collection_name
from models import User
from schemas import user_serializer, users_serializer
from bson import ObjectId

study_api_router = APIRouter()

@study_api_router.get("/")
async def get_users():
    users = users_serializer(collection_name.find())
    return {"status": "ok", "data": users}

@study_api_router.get("/{id}")
async def get_user(id: str):
    user = users_serializer(collection_name.find({"_id": ObjectId(id)}))
    return {"status": "ok", "data": user}

@study_api_router.post("/")
async def post_user(user: User):
    _id = collection_name.insert_one(dict(user))
    user = users_serializer(collection_name.find({"_id": _id.inserted_id}))
    return {"status": "ok", "data": user}

@study_api_router.put("/{id}")
async def update_user(id: str, user: User):
    collection_name.find_one_and_update({"_id": ObjectId(id)}, {
        "$set": dict(user)
    })
    user = users_serializer(collection_name.find({"_id": ObjectId(id)}))
    return {"status": "ok", "data": user}

@study_api_router.delete("/{id}")
async def delete_user(id: str):
    collection_name.find_one_and_delete({"_id": ObjectId(id)})
    return {"status": "ok", "data": []}