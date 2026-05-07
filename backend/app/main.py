import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.database import Base, engine
from app.routers import auth, messages, runs, workspaces
from app.seed import seed

Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(title="Policy Simulator API")

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(messages.router)
app.include_router(runs.router)


@app.get("/health")
def health():
    return {"status": "ok"}
