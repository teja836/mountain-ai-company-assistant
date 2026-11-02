
import { useEffect, useState } from "react";
import ServiceCard from "./ServiceCard";
import { getServices } from "../services/api";

const serviceIcons = {
  "Web Development": "🌐",
  "AI Chatbot Development": "🤖",
  "Workflow Automation": "⚡",
  "AI Document Intelligence": "📄",
  "Mobile App Development": "📱",
  "Database and API Development": "🗄️",
  "Database & API Development": "🗄️",
};

function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const data = await getServices();

        if (!cancelled) {
          setServices(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load services. Please try again later.");
          console.error("Services loading failed:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="services" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="font-semibold text-blue-600">
            WHAT WE DO
          </span>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Our Technology Services
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Practical technology solutions to help businesses work smarter,
            build better products, and grow.
          </p>
        </div>

        {loading && (
          <p className="py-8 text-center text-slate-600">
            Loading services...
          </p>
        )}

        {error && (
          <p role="alert" className="py-8 text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && services.length === 0 && (
          <p className="py-8 text-center text-slate-600">
            No services are available right now.
          </p>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.name}
                description={service.description}
                icon={serviceIcons[service.name] || "💡"}
                technologies={
                  service.technologies
                    ? service.technologies
                        .split(",")
                        .map((technology) => technology.trim())
                    : []
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ServicesSection;
