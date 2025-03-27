import unittest
from backend.scrapers.api_scraper import ApiScraper

class TestApiScraper(unittest.TestCase):

    def setUp(self):
        self.scraper = ApiScraper()

    def test_valid_api_response(self):
        url = "https://api.example.com/data"
        response = self.scraper.scrape(url)
        self.assertIsNotNone(response)
        self.assertIn("expected_key", response)

    def test_invalid_api_url(self):
        url = "https://invalid.api.url"
        with self.assertRaises(ValueError):
            self.scraper.scrape(url)

    def test_empty_api_url(self):
        url = ""
        with self.assertRaises(ValueError):
            self.scraper.scrape(url)

if __name__ == '__main__':
    unittest.main()