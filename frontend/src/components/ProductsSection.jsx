import ProductCard from "./ProductCard";

const products = [
  {
    name: "Mountain AI Assistant",
    description:
      "An AI-powered assistant that helps visitors find company information and get answers quickly.",
    icon: "🤖",
    category: "AI Assistant",
  },
  {
    name: "Smart Document Search",
    description:
      "Search business documents and retrieve relevant information using AI.",
    icon: "📚",
    category: "AI & Knowledge",
  },
  {
    name: "Workflow Manager",
    description:
      "Connect business applications and automate repetitive tasks through workflows.",
    icon: "⚡",
    category: "Automation",
  },
];

function ProductsSection() {
  return (
    <section id="products" className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="font-semibold text-blue-600">
            OUR PRODUCTS
          </span>

          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Tools Built for Smarter Work
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Explore digital tools designed to make information easier to
            access and everyday business work more efficient.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductsSection;