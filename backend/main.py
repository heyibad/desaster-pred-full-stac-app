import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from db import init_db
from routers.auth import router as auth_router
from routers.predict import router as predict_router

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="Disaster Prediction API")

frontend_env = os.getenv("FRONTEND_ORIGINS", "").strip()
frontend_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if frontend_env:
    frontend_origins.extend([origin.strip() for origin in frontend_env.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def root():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(predict_router)
