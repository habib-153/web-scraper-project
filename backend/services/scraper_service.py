from scrapers.api_scraper import ApiScraper
from scrapers.web_scraper import WebScraper


class ScraperService:
    def __init__(self):
        self.api_scraper = ApiScraper()
        self.web_scraper = WebScraper()

    def scrape(self, scrape_request):
        scrape_type = scrape_request.get('type')
        url = scrape_request.get('url')

        if not url:
            return {"error": "URL is required"}

        if scrape_type == 'api':
            return self.api_scraper.scrape(url)
        elif scrape_type == 'static':
            return self.web_scraper.scrape(url)
        else:
            return {"error": "Invalid scrape type. Use 'api' or 'static'."}
