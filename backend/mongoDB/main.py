from fastapi import FastAPI
from routes import study_api_router # import the router from routes.py

# Create the fastapi object and add the router to it
app = FastAPI()
app.include_router(study_api_router)