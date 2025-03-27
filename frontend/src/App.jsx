import { useState } from "react";
import ScraperForm from "./components/ScraperForm";
import ResultsDisplay from "./components/ResultsDisplay";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScrape = async (scrapeRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scrapeRequest),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        const errorText = await response.text();
        setError(
          `Server error: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
      console.error("Error fetching data from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container max-w-6xl mx-auto px-4 py-6">
        <ScraperForm onScrape={handleScrape} loading={loading} />

        {error && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-md">
              <h3 className="font-medium text-destructive">Error</h3>
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="max-w-3xl mx-auto mt-6 bg-card rounded-lg border p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-lg font-medium">Processing your request...</p>
          </div>
        )}

        {!loading && results && <ResultsDisplay results={results} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;