
import json
from pathlib import Path

from sqlalchemy.orm import Session

from database import SessionLocal
from models import Service, Product, FAQ


PROJECT_ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = PROJECT_ROOT / "data" / "structured" / "company.json"


def seed_database():
    with JSON_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)

    db: Session = SessionLocal()

    try:
        # Insert services without duplicating existing records.
        for item in data.get("services", []):
            existing = (
                db.query(Service)
                .filter_by(name=item["name"])
                .first()
            )

            if existing:
                existing.category = item["category"]
                existing.description = item["description"]
                existing.technologies = ", ".join(
                    item.get("technologies", [])
                )
                existing.starting_price_inr = item["starting_price_inr"]
                existing.estimated_duration = item.get(
                    "estimated_duration"
                )
                existing.status = item.get("status", "active")
            else:
                db.add(
                    Service(
                        name=item["name"],
                        category=item["category"],
                        description=item["description"],
                        technologies=", ".join(
                            item.get("technologies", [])
                        ),
                        starting_price_inr=item["starting_price_inr"],
                        estimated_duration=item.get("estimated_duration"),
                        status=item.get("status", "active"),
                    )
                )

        # Insert products without duplicating existing records.
        for item in data.get("products", []):
            existing = (
                db.query(Product)
                .filter_by(name=item["name"])
                .first()
            )

            if existing:
                existing.description = item["description"]
                existing.category = item["category"]
                existing.starting_price_inr = item.get(
                    "starting_price_inr", 0
                )
                existing.availability = item.get(
                    "availability", "Prototype"
                )
            else:
                db.add(
                    Product(
                        name=item["name"],
                        description=item["description"],
                        category=item["category"],
                        starting_price_inr=item.get(
                            "starting_price_inr", 0
                        ),
                        availability=item.get(
                            "availability", "Prototype"
                        ),
                    )
                )

        # Insert FAQs without duplicating existing questions.
        for item in data.get("faqs", []):
            existing = (
                db.query(FAQ)
                .filter_by(question=item["question"])
                .first()
            )

            if existing:
                existing.answer = item["answer"]
            else:
                db.add(
                    FAQ(
                        question=item["question"],
                        answer=item["answer"],
                    )
                )

        db.commit()

        print("Company data loaded successfully!")
        print("Services:", db.query(Service).count())
        print("Products:", db.query(Product).count())
        print("FAQs:", db.query(FAQ).count())

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
