import unittest
from backend.scrapers.web_scraper import WebScraper

class TestWebScraper(unittest.TestCase):

    def setUp(self):
        self.scraper = WebScraper()

    def test_scrape_static_website(self):
        url = "http://example.com"
        result = self.scraper.scrape(url)
        self.assertIsInstance(result, dict)  # Assuming the result is a dictionary

    def test_invalid_url(self):
        url = "invalid-url"
        with self.assertRaises(ValueError):
            self.scraper.scrape(url)

    def test_scrape_empty_page(self):
        url = "http://empty-page.com"  # Replace with a valid empty page for testing
        result = self.scraper.scrape(url)
        self.assertEqual(result, {})  # Assuming an empty page returns an empty dictionary

if __name__ == '__main__':
    unittest.main()