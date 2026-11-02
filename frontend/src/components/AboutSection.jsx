function AboutSection() {
  return (
    <section id="about" className="bg-slate-50 px-6 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        <div>
          <span className="font-semibold text-blue-600">
            ABOUT OUR COMPANY
          </span>

          <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            Turning Ideas into
            <span className="text-blue-600"> Intelligent Solutions</span>
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            Mountain-AI Technologies is a technology company focused on
            building modern websites, AI-powered applications, and business
            automation solutions.
          </p>

          <p className="mt-4 leading-8 text-slate-600">
            Our goal is to simplify complex business processes through
            practical software, intelligent assistants, and reliable
            technology.
          </p>

          <a
            href="#services"
            className="mt-7 inline-flex rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Explore Our Services
          </a>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-2xl bg-blue-50 p-6">
              <span className="text-3xl">💡</span>
              <h3 className="mt-4 font-bold text-slate-900">
                Innovation
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Exploring smarter ways to solve business problems.
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-50 p-6">
              <span className="text-3xl">🤖</span>
              <h3 className="mt-4 font-bold text-slate-900">
                AI Solutions
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Making useful AI tools accessible to businesses.
              </p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-6">
              <span className="text-3xl">⚙️</span>
              <h3 className="mt-4 font-bold text-slate-900">
                Automation
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Reducing repetitive work with connected workflows.
              </p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-6">
              <span className="text-3xl">🚀</span>
              <h3 className="mt-4 font-bold text-slate-900">
                Growth
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Building technology that supports business goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;