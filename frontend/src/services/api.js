import axios from 'axios';

const API_URL = 'http://localhost:5000/api/scrape';

export const scrapeData = async (scrapeRequest) => {
    try {
        const response = await axios.post(API_URL, scrapeRequest);
        return response.data;
    } catch (error) {
        console.error('Error scraping data:', error);
        throw error;
    }
};