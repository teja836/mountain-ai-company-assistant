
import { useEffect, useState } from "react";
import { getFAQs } from "../services/api";

function FAQSection() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFAQs() {
      try {
        const data = await getFAQs();

        if (!cancelled) {
          setFaqs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load FAQs. Please try again later.");
          console.error("FAQ loading failed:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFAQs();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="faqs" className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <span className="font-semibold text-blue-600">
            GOT QUESTIONS?
          </span>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Find answers to common questions about our services and solutions.
          </p>
        </div>

        {loading && (
          <p className="py-8 text-center text-slate-600">
            Loading FAQs...
          </p>
        )}

        {error && (
          <p role="alert" className="py-8 text-center text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && faqs.length === 0 && (
          <p className="py-8 text-center text-slate-600">
            No FAQs are available right now.
          </p>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  aria-expanded={openIndex === index}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  <span>{faq.question}</span>
                  <span className="shrink-0 text-xl text-blue-600">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                {openIndex === index && (
                  <div className="border-t border-slate-100 px-5 py-5 leading-7 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FAQSection;
