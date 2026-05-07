from app.auth import hash_password
from app.config import settings
from app.database import SessionLocal
from app.models import User, Workspace


def seed():
    db = SessionLocal()
    try:
        if db.query(User).first():
            return
        user = User(email=settings.seed_email, password_hash=hash_password(settings.seed_password))
        db.add(user)
        sample = Workspace(
            name="Housing Affordability Initiative",
            description="Explore policy levers to improve housing affordability in major Canadian cities.",
        )
        db.add(sample)
        db.commit()
        print(f"Seeded user: {settings.seed_email} / {settings.seed_password}")
    finally:
        db.close()
