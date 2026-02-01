from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.modules.ai.router import router as ai_router
from app.modules.coaching.router import router as coaching_router
from app.modules.identity.router import router as identity_router
from app.modules.training.router import router as training_router

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(identity_router)
app.include_router(coaching_router)
app.include_router(training_router)
app.include_router(ai_router)


@app.get("/")
async def root():
    return {"message": "Welcome to Sportan API"}
