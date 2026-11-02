
from database import engine

try:
    with engine.connect() as connection:
        print("Database connected successfully!")
        print("Database:", connection.engine.url.database)
except Exception as error:
    print("Database connection failed:")
    print(error)
