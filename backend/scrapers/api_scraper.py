import requests
import time
import json


class ApiScraper:
    def __init__(self):
        self.start_time = 0

    def analyze_json_structure(self, data):
        """Analyze the structure of JSON data"""
        if isinstance(data, dict):
            return {
                'type': 'object',
                'keys_count': len(data),
                'keys': list(data.keys())[:20],  # First 20 keys
                'nested_objects': sum(1 for v in data.values() if isinstance(v, dict)),
                'nested_arrays': sum(1 for v in data.values() if isinstance(v, list))
            }
        elif isinstance(data, list):
            return {
                'type': 'array',
                'items_count': len(data),
                'sample_items': min(5, len(data)),  # Number of sample items
                'has_objects': any(isinstance(item, dict) for item in data[:10]),
                'has_arrays': any(isinstance(item, list) for item in data[:10])
            }
        else:
            return {
                'type': 'primitive',
                'value_type': type(data).__name__
            }

    def scrape(self, url):
        try:
            self.start_time = time.time()

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }

            response = requests.get(url, headers=headers, timeout=10)
            processing_time = time.time() - self.start_time

            if response.status_code == 200:
                try:
                    # Try to parse as JSON
                    json_data = response.json()

                    # Analyze the structure of the JSON data
                    structure_analysis = self.analyze_json_structure(json_data)

                    # Collect analytics
                    analytics = {
                        'processing_time_seconds': round(processing_time, 2),
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', ''),
                        'response_size_bytes': len(response.content),
                        'is_json': True,
                        'structure': structure_analysis
                    }

                    return {
                        "success": True,
                        "data": json_data,
                        "analytics": analytics,
                        "type": "api"
                    }
                except json.JSONDecodeError:
                    # Not valid JSON, return as text
                    analytics = {
                        'processing_time_seconds': round(processing_time, 2),
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', ''),
                        'response_size_bytes': len(response.content),
                        'is_json': False
                    }

                    return {
                        "success": True,
                        "data": response.text,
                        "analytics": analytics,
                        "type": "api"
                    }
            else:
                return {
                    "success": False,
                    "error": f"API request failed with status code {response.status_code}",
                    "analytics": {
                        'processing_time_seconds': round(processing_time, 2),
                        'status_code': response.status_code,
                        'content_type': response.headers.get('Content-Type', '')
                    },
                    "type": "api"
                }
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timed out. The API took too long to respond.",
                "analytics": {
                    'processing_time_seconds': round(time.time() - self.start_time, 2)
                },
                "type": "api"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Error accessing API: {str(e)}",
                "analytics": {
                    'processing_time_seconds': round(time.time() - self.start_time, 2)
                },
                "type": "api"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}",
                "analytics": {
                    'processing_time_seconds': round(time.time() - self.start_time, 2)
                },
                "type": "api"
            }
