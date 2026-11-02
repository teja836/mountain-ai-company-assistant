function ServiceCard({ title, description, icon, technologies }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl transition group-hover:bg-blue-600">
        <span className="group-hover:scale-110 transition">{icon}</span>
      </div>

      <h3 className="text-xl font-bold text-slate-900">{title}</h3>

      <p className="mt-3 leading-7 text-slate-600">{description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {technologies.map((technology) => (
          <span
            key={technology}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {technology}
          </span>
        ))}
      </div>

      <a
        href="#contact"
        className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
      >
        Learn more <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

export default ServiceCard;
