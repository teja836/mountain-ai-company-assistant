
const API_BASE_URL = "http://127.0.0.1:8000";

export async function getServices() {
  const response = await fetch(`${API_BASE_URL}/services`);

  if (!response.ok) {
    throw new Error("Failed to fetch services");
  }

  return response.json();
}

export async function getServiceById(serviceId) {
  const response = await fetch(
    `${API_BASE_URL}/services/${serviceId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch service");
  }

  return response.json();
}

export async function getFAQs() {
  const response = await fetch(`${API_BASE_URL}/faqs`);

  if (!response.ok) {
    throw new Error("Failed to fetch FAQs");
  }

  return response.json();
}


export async function submitContactMessage(contactData) {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map((error) => error.msg).join(", ")
      : data.detail || "Failed to send your message.";

    throw new Error(message);
  }

  return data;
}
