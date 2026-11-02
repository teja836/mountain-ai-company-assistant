
from database import Base, engine
import models

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")

for table_name in Base.metadata.tables:
    print(f"- {table_name}")
