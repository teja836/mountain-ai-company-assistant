
import { useState } from "react";
import { submitContactMessage } from "../services/api";

function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      setFeedback({
        type: "success",
        message: "Thank you! Your message has been sent successfully.",
      });

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Unable to send your message. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="font-semibold text-blue-600">
            GET IN TOUCH
          </span>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Let's Build Something Great
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Have a project idea or a question about our services? Send us a
            message.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-8">
            <h3 className="text-2xl font-bold text-slate-900">
              Contact Information
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Tell us what you are looking to build, and we can discuss a
              suitable technology solution.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <span className="text-2xl">📧</span>
                <div>
                  <h4 className="font-semibold text-slate-900">Email</h4>
                  <p className="mt-1 text-slate-600">
                    Contact details to be added
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-2xl">💼</span>
                <div>
                  <h4 className="font-semibold text-slate-900">Our Services</h4>
                  <p className="mt-1 text-slate-600">
                    Web development, AI solutions, and automation
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-slate-200 p-8 shadow-sm"
          >
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Your Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                minLength={2}
                maxLength={150}
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                minLength={5}
                maxLength={5000}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project..."
                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {feedback.message && (
              <p
                role="status"
                aria-live="polite"
                className={`rounded-lg p-3 text-sm ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Message →"}
            </button>

            <p className="text-xs leading-5 text-slate-500">
              Your message will be stored securely in our contact database.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
