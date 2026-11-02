
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Company Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            M
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Mountain-AI
            </h1>
            <p className="text-xs text-slate-500">
              Technologies
            </p>
          </div>
        </a>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#home" className="text-sm text-slate-600 hover:text-blue-600">
            Home
          </a>
          <a href="#about" className="text-sm text-slate-600 hover:text-blue-600">
            About
          </a>
          <a href="#services" className="text-sm text-slate-600 hover:text-blue-600">
            Services
          </a>
          <a href="#products" className="text-sm text-slate-600 hover:text-blue-600">
            Products
          </a>
          <a href="#contact" className="text-sm text-slate-600 hover:text-blue-600">
            Contact
          </a>
        </div>

        {/* Login */}
        <a
          href="/login"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
