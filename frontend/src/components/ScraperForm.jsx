/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ScraperForm = ({ onScrape, loading }) => {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("static");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Basic URL validation
      if (!url.trim()) {
        throw new Error("URL is required");
      }

      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("URL must start with http:// or https://");
      }

      await onScrape({ url, type });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Web Scraper</CardTitle>
        <CardDescription>
          Extract data from websites and APIs with ease
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="scrape-type" className="text-sm font-medium">
              Scraper Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="scrape-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static Website</SelectItem>
                <SelectItem value="api">API Endpoint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="url-input" className="text-sm font-medium">
              URL
            </label>
            <Input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                type === "api"
                  ? "https://api.example.com/data"
                  : "https://www.example.com"
              }
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            variant="default"
          >
            {loading ? "Scraping..." : "Scrape"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScraperForm;