from flask import Flask, request, jsonify
from flask_cors import CORS
from services.scraper_service import ScraperService

app = Flask(__name__)
CORS(app)  
scraper_service = ScraperService()


@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "message": "Web Scraper API is running",
        "endpoints": {
            "/scrape": "POST - Scrape a website or API"
        }
    })


@app.route('/scrape', methods=['POST'])
def scrape():
    data = request.json
    scrape_request = {
        'type': data.get('type'),
        'url': data.get('url')
    }
    result = scraper_service.scrape(scrape_request)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
