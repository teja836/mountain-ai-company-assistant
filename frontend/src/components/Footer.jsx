function Footer() {
  return (
    <footer className="bg-slate-950 px-6 py-12 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              M
            </div>
            <div>
              <h2 className="font-bold text-white">Mountain-AI</h2>
              <p className="text-xs text-slate-400">Technologies</p>
            </div>
          </a>

          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
            Building modern digital experiences, intelligent AI applications,
            and efficient business automation solutions.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a href="#home" className="hover:text-blue-400">Home</a></li>
            <li><a href="#about" className="hover:text-blue-400">About Us</a></li>
            <li><a href="#services" className="hover:text-blue-400">Services</a></li>
            <li><a href="#products" className="hover:text-blue-400">Products</a></li>
            <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Our Services</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>Web Development</li>
            <li>AI Chatbot Development</li>
            <li>Workflow Automation</li>
            <li>AI Document Intelligence</li>
            <li>Database & API Development</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white">Let's Connect</h3>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Have a project idea? Explore our services and get in touch with us.
          </p>
          <a
            href="#contact"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Contact Us →
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Mountain-AI Technologies. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;