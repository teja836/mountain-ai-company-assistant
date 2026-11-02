
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# XAMPP commonly uses the root account with no password
# on a local development installation.
DATABASE_URL = "mysql+pymysql://root:@127.0.0.1:3306/mountain_ai_assistant"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()
