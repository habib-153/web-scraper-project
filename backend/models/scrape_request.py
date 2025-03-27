class ScrapeRequest:
    def __init__(self, scrape_type, url):
        self.scrape_type = scrape_type  # 'api' or 'static'
        self.url = url  # The URL or API endpoint to scrape

    def validate(self):
        # Add validation logic for URL and scrape type
        if not self.url:
            raise ValueError("URL cannot be empty.")
        if self.scrape_type not in ['api', 'static']:
            raise ValueError("Scrape type must be 'api' or 'static'.")