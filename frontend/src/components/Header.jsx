import { Globe, Code, Database, Search, Download } from "lucide-react";

const Header = () => {
  return (
    <header className="relative bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden">
      {/* Background pattern decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNHptMC0xOGMwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00em0wIDM2YzAtMi4yLTEuOC00LTQtNHMtNCAxLjgtNCA0IDEuOCA0IDQgNCA0LTEuOCA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-400 rounded-full opacity-5 blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-teal-500/90 rounded-xl shadow-lg">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Web Scraper
            </h1>
          </div>

          <p className="text-xl text-white/85 text-center max-w-2xl mx-auto mb-10">
            Extract structured data from websites and APIs with precision and
            ease
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
            <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-xl p-5 flex items-center gap-4 border border-slate-600/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <Globe className="h-6 w-6 text-teal-400" />
              </div>
              <span className="text-white font-medium">
                Static Website Scraping
              </span>
            </div>

            <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-xl p-5 flex items-center gap-4 border border-slate-600/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Code className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-white font-medium">
                API Data Extraction
              </span>
            </div>

            <div className="bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-xl p-5 flex items-center gap-4 border border-slate-600/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Database className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-white font-medium">Structured Results</span>
            </div>
          </div>

          {/* Stats counter with updated design */}
          <div className="flex flex-wrap justify-center gap-12 mt-12">
            <div className="text-center flex flex-col items-center">
              <div className="p-4 bg-white/5 rounded-full mb-2 shadow-inner">
                <Search className="h-7 w-7 text-teal-400" />
              </div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-sm text-teal-200/80 mt-1">Success Rate</div>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="p-4 bg-white/5 rounded-full mb-2 shadow-inner">
                <Download className="h-7 w-7 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">Fast</div>
              <div className="text-sm text-blue-200/80 mt-1">Processing</div>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="p-4 bg-white/5 rounded-full mb-2 shadow-inner">
                <Database className="h-7 w-7 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">Secure</div>
              <div className="text-sm text-purple-200/80 mt-1">
                Data Handling
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Better wave effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-8 text-background"
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 48H1440V0C1295 22 1175 30 1055 30C935 30 815 22 670 0C525 22 405 30 285 30C165 30 45 22 0 0V48Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </header>
  );
};

export default Header;