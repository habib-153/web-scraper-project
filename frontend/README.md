# Frontend Web Scraper Project

This project is a web scraper application that allows users to scrape data from either static websites or APIs. The frontend is built using React.js and communicates with a Python backend that handles the scraping logic.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- Python 3.x installed on your machine (for the backend).

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the frontend directory:

   ```
   cd web-scraper-project/frontend
   ```

3. Install the frontend dependencies:

   ```
   npm install
   ```

### Running the Application

1. Start the backend server (make sure to follow the backend setup instructions in the backend/README.md):

   ```
   cd ../backend
   python app.py
   ```

2. Start the frontend application:

   ```
   cd ../frontend
   npm start
   ```

3. Open your browser and go to `http://localhost:3000` to access the application.

### Features

- Users can select between scraping a static website or an API.
- Input fields for entering the URL or API endpoint.
- Displays the scraped data in a user-friendly format.

### Folder Structure

- `public/`: Contains static files like `index.html` and `manifest.json`.
- `src/`: Contains the React components and services.
- `components/`: Contains individual React components for the application.
- `services/`: Contains functions to interact with the backend API.
- `styles/`: Contains CSS styles for the application.

### Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

### License

This project is licensed under the MIT License.