
import json
from pathlib import Path


# Find the main project directory.
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Locate the structured company data file.
COMPANY_DATA_PATH = (
    PROJECT_ROOT / "data" / "structured" / "company.json"
)


def load_company_data():
    """Load and validate the company's structured JSON data."""

    if not COMPANY_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Company data file not found: {COMPANY_DATA_PATH}"
        )

    with COMPANY_DATA_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if "company" not in data:
        raise ValueError("Missing 'company' information.")

    if "services" not in data:
        raise ValueError("Missing 'services' information.")

    print("\n===== COMPANY INFORMATION =====")
    print("Company:", data["company"]["name"])
    print("Location:", data["company"]["headquarters"])

    print("\n===== AVAILABLE SERVICES =====")

    for service in data["services"]:
        print(
            f"{service['id']}. {service['name']} "
            f"- Starting at ₹{service['starting_price_inr']:,}"
        )

    print("\nTotal services:", len(data["services"]))

    return data


if __name__ == "__main__":
    company_data = load_company_data()
    print("\nCompany data loaded successfully!")
