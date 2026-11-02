function ProductCard({ name, description, icon, category }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl transition group-hover:bg-indigo-100">
        {icon}
      </div>

      <div className="mt-5">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {category}
        </span>

        <h3 className="mt-4 text-xl font-bold text-slate-900">
          {name}
        </h3>

        <p className="mt-3 leading-7 text-slate-600">
          {description}
        </p>
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

export default ProductCard;