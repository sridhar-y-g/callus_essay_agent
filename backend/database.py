import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use TIDB_DATABASE_URL from the environment, fallback to sqlite for local testing if not set
DATABASE_URL = os.getenv("TIDB_DATABASE_URL", "sqlite:///./sql_app.db")

# For sqlite, we need check_same_thread=False. For TiDB/MySQL we don't.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
