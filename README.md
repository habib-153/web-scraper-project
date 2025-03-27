# Web Scraper Project

This project is a web scraper application that allows users to scrape data from static websites or APIs. It consists of a Python backend using Flask and a React.js frontend.

## Features

- Users can choose between scraping a static website or an API.
- Input fields for entering the URL or API endpoint.
- Data is scraped using Beautiful Soup or Selenium in the backend.
- Results are displayed in the frontend.

## Project Structure

```
web-scraper-project
├── backend
│   ├── app.py
│   ├── requirements.txt
│   ├── scrapers
│   │   ├── __init__.py
│   │   ├── api_scraper.py
│   │   └── web_scraper.py
│   ├── services
│   │   ├── __init__.py
│   │   └── scraper_service.py
│   ├── models
│   │   ├── __init__.py
│   │   └── scrape_request.py
│   ├── utils
│   │   ├── __init__.py
│   │   └── helpers.py
│   └── tests
│       ├── __init__.py
│       ├── test_api_scraper.py
│       └── test_web_scraper.py
├── frontend
│   ├── public
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── components
│   │   │   ├── Header.js
│   │   │   ├── ScraperForm.js
│   │   │   ├── ResultsDisplay.js
│   │   │   └── Footer.js
│   │   ├── services
│   │   │   └── api.js
│   │   └── styles
│   │       └── App.css
│   ├── package.json
│   └── README.md
└── README.md
```

## Setup Instructions

### Backend

1. Navigate to the `backend` directory.
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the backend application:
   ```
   python app.py
   ```

### Frontend

1. Navigate to the `frontend` directory.
2. Install the required dependencies:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm start
   ```

## Technologies Used

- Python
- Flask
- Beautiful Soup
- Selenium
- React.js

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.