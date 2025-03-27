import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import time
import re
from collections import Counter


class WebScraper:
    def __init__(self):
        self.start_time = 0
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

    def clean_text(self, text):
        """Clean text by removing excessive whitespace"""
        if text:
            return re.sub(r'\s+', ' ', text.strip())
        return ""

    def get_absolute_url(self, base_url, href):
        """Convert a relative URL to an absolute URL"""
        if not href:
            return None
        if href.startswith(('http://', 'https://')):
            return href
        return urljoin(base_url, href)

    def get_meta_data(self, soup, base_url):
        """Extract meta information from the page"""
        meta_data = {}

        # Get meta title
        meta_data['title'] = soup.title.string if soup.title else "No title found"

        # Get meta description
        meta_description = soup.find('meta', attrs={'name': 'description'})
        meta_data['description'] = meta_description['content'] if meta_description and meta_description.get(
            'content') else "No description found"

        # Get all meta tags
        meta_tags = []
        for meta in soup.find_all('meta'):
            meta_info = {}
            for attr in meta.attrs:
                meta_info[attr] = meta.get(attr)
            meta_tags.append(meta_info)
        meta_data['meta_tags'] = meta_tags

        # Get favicon
        favicon = soup.find('link', rel=lambda r: r and (
            'icon' in r or 'shortcut icon' in r))
        if favicon and favicon.get('href'):
            meta_data['favicon'] = self.get_absolute_url(
                base_url, favicon['href'])
        else:
            meta_data['favicon'] = urljoin(
                base_url, '/favicon.ico')  # Default location

        # Get canonical URL
        canonical = soup.find('link', rel='canonical')
        meta_data['canonical'] = canonical['href'] if canonical and canonical.get(
            'href') else base_url

        # Get Open Graph tags
        og_tags = {}
        for og in soup.find_all('meta', property=re.compile('^og:')):
            og_name = og.get('property')[3:]  # Remove 'og:' prefix
            og_tags[og_name] = og.get('content')
        meta_data['open_graph'] = og_tags

        # Get Twitter card tags
        twitter_tags = {}
        for twitter in soup.find_all('meta', attrs={'name': re.compile('^twitter:')}):
            twitter_name = twitter.get('name')[8:]  # Remove 'twitter:' prefix
            twitter_tags[twitter_name] = twitter.get('content')
        meta_data['twitter'] = twitter_tags

        return meta_data

    def extract_text_content(self, soup):
        """Extract main text content from the page"""
        # Try to find the main content
        main_content = soup.find('main') or soup.find(
            id=re.compile('content|main', re.I))

        if not main_content:
            # If no main content is found, use the body but exclude header, footer, nav, and aside
            main_content = soup.body
            if main_content:
                for tag in main_content.find_all(['header', 'footer', 'nav', 'aside']):
                    tag.decompose()

        # Get paragraphs from the main content
        paragraphs = []
        if main_content:
            for p in main_content.find_all('p'):
                text = self.clean_text(p.get_text())
                if text and len(text) > 20:  # Ignore very short paragraphs
                    paragraphs.append(text)

        return paragraphs

    def extract_css_and_style_info(self, soup, base_url):
        """Extract CSS and style information from the page"""
        css_info = {
            'stylesheets': [],
            'inline_styles': [],
        }

        # Extract external stylesheets
        for link in soup.find_all('link', rel='stylesheet'):
            href = link.get('href')
            if href:
                css_info['stylesheets'].append({
                    'href': self.get_absolute_url(base_url, href),
                    'media': link.get('media', 'all')
                })

        # Extract inline styles
        for style in soup.find_all('style'):
            css_info['inline_styles'].append({
                'content': style.string,
                'media': style.get('media', 'all')
            })

        return css_info

    def extract_scripts(self, soup, base_url):
        """Extract script information from the page"""
        scripts = []

        # Extract both inline and external scripts
        for script in soup.find_all('script'):
            script_info = {
                'type': script.get('type', 'text/javascript'),
                'is_external': script.has_attr('src'),
            }

            if script.has_attr('src'):
                script_info['src'] = self.get_absolute_url(
                    base_url, script['src'])
            else:
                # Only include first 500 chars of script content
                script_info['content'] = script.string[:500] if script.string else ''

            scripts.append(script_info)

        return scripts

    def analyze_html_structure(self, soup):
        """Analyze the HTML structure of the page"""
        structure = {}

        # Count all HTML tags
        tags = Counter([tag.name for tag in soup.find_all()])
        structure['tag_counts'] = dict(tags.most_common())

        # Get all CSS classes used
        classes = []
        for tag in soup.find_all(class_=True):
            classes.extend(tag.get('class', []))
        structure['class_counts'] = dict(Counter(classes).most_common())

        # Map classes to elements
        class_to_elements = {}
        for cls in set(classes):
            elements = soup.find_all(class_=lambda c: c and cls in c)
            class_to_elements[cls] = {
                'count': len(elements),
                'tags': list(set(el.name for el in elements)),
                'sample_elements': [{'tag': el.name, 'classes': el.get('class'), 'id': el.get('id')}
                                    for el in elements[:5]]  # Get 5 samples
            }
        structure['class_to_elements'] = class_to_elements

        # Get all IDs used
        ids = [tag.get('id') for tag in soup.find_all(id=True)]
        structure['id_counts'] = dict(Counter(ids).most_common())

        # Analyze document depth
        def get_depth(elem, current_depth=0):
            if not hasattr(elem, 'contents'):
                return current_depth
            if not elem.contents:
                return current_depth

            depths = [get_depth(child, current_depth + 1) for child in elem.contents
                      if hasattr(child, 'contents')]

            # Return current_depth if no valid children found
            return max(depths) if depths else current_depth

        structure['document_depth'] = get_depth(soup)

        # Analyze semantic structure
        semantic_tags = ['header', 'footer', 'nav', 'main', 'article', 'section',
                         'aside', 'figure', 'figcaption', 'time', 'mark']
        structure['semantic_elements'] = {
            tag: len(soup.find_all(tag)) for tag in semantic_tags}

        # Form elements
        structure['forms_count'] = len(soup.find_all('form'))
        structure['input_counts'] = {
            'total': len(soup.find_all('input')),
            'by_type': dict(Counter(i.get('type', 'text') for i in soup.find_all('input')))
        }

        # Iframe analysis
        iframes = soup.find_all('iframe')
        structure['iframes'] = {
            'count': len(iframes),
            'sources': [iframe.get('src') for iframe in iframes if iframe.get('src')]
        }

        return structure

    def scrape(self, url, max_elements=1000):
        try:
            self.start_time = time.time()

            headers = {
                'User-Agent': self.user_agent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }

            response = requests.get(url, headers=headers, timeout=15)
            processing_time = time.time() - self.start_time

            if response.status_code == 200:
                # Parse HTML
                soup = BeautifulSoup(response.text, 'html.parser')

                # Parse URL components
                parsed_url = urlparse(url)
                base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                path = parsed_url.path or "/"

                # Get meta data
                meta_data = self.get_meta_data(soup, base_url)

                # Extract links
                links = []
                for link in soup.find_all('a', href=True):
                    href = self.get_absolute_url(base_url, link['href'])
                    if href:
                        links.append({
                            'text': self.clean_text(link.get_text()),
                            'href': href,
                            'is_external': not href.startswith(base_url) if href else False
                        })

                # Extract headings
                headings = []
                for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                    headings.append({
                        'level': h.name,
                        'text': self.clean_text(h.get_text())
                    })

                # Extract images
                images = []
                for img in soup.find_all('img', src=True):
                    img_src = self.get_absolute_url(base_url, img['src'])
                    if img_src:
                        images.append({
                            'src': img_src,
                            'alt': img.get('alt', 'No alt text'),
                            'width': img.get('width', ''),
                            'height': img.get('height', '')
                        })

                # Extract text content
                paragraphs = self.extract_text_content(soup)

                # Analyze HTML structure
                html_structure = self.analyze_html_structure(soup)

                # Extract CSS and style information
                css_info = self.extract_css_and_style_info(soup, base_url)

                # Extract scripts
                scripts = self.extract_scripts(soup, base_url)

                # Extract forms
                forms = []
                for form in soup.find_all('form'):
                    form_data = {
                        'action': self.get_absolute_url(base_url, form.get('action', '')),
                        'method': form.get('method', 'get'),
                        'inputs': []
                    }

                    for input_tag in form.find_all(['input', 'select', 'textarea']):
                        input_data = {
                            'tag': input_tag.name,
                            'type': input_tag.get('type', ''),
                            'name': input_tag.get('name', ''),
                            'id': input_tag.get('id', ''),
                            'required': input_tag.has_attr('required')
                        }
                        form_data['inputs'].append(input_data)

                    forms.append(form_data)

                # Element tree (limited to max_elements)
                element_tree = []

                def process_element(element, path="html", depth=0):
                    if len(element_tree) >= max_elements:
                        return

                    if hasattr(element, 'name') and element.name:
                        el_id = element.get('id', '')
                        el_class = ' '.join(element.get('class', []))

                        # Build path
                        element_path = f"{path} > {element.name}"
                        if el_id:
                            element_path += f"#{el_id}"
                        if el_class:
                            element_path += f".{el_class.replace(' ', '.')}"

                        # Get the actual text content
                        # Use .string for direct text or get_text() for all nested text
                        text_content = element.string if element.string else element.get_text()
                        text_content = self.clean_text(text_content)

                        # Limit text length for large content
                        display_text = text_content[:200] + \
                            "..." if len(text_content) > 200 else text_content

                        # Create element info
                        element_info = {
                            'tag': element.name,
                            'path': element_path,
                            'id': el_id,
                            'classes': element.get('class', []),
                            'attributes': {k: v for k, v in element.attrs.items()
                                           if k not in ['id', 'class']},
                            'depth': depth,
                            'text_length': len(text_content),
                            'text_content': display_text,  # Add the actual text content
                            'children_count': len([c for c in element.children
                                                   if hasattr(c, 'name') and c.name])
                        }

                        element_tree.append(element_info)

                        # Process children
                        for child in element.children:
                            if hasattr(child, 'name') and child.name:
                                process_element(child, element_path, depth+1)

                # Start from body to keep element count manageable
                if soup.body:
                    process_element(soup.body, "html", 0)

                # Count elements for analytics
                analytics = {
                    'links_count': len(links),
                    'headings_count': len(headings),
                    'images_count': len(images),
                    'paragraphs_count': len(paragraphs),
                    'scripts_count': len(scripts),
                    'forms_count': len(forms),
                    'css_files_count': len(css_info['stylesheets']),
                    'inline_styles_count': len(css_info['inline_styles']),
                    'unique_classes': len(html_structure['class_counts']),
                    'unique_ids': len(html_structure['id_counts']),
                    'tag_types_count': len(html_structure['tag_counts']),
                    'total_tags_count': sum(html_structure['tag_counts'].values()),
                    'element_tree_count': len(element_tree),
                    'document_depth': html_structure.get('document_depth', 0),
                    'processing_time_seconds': round(processing_time, 2),
                    'status_code': response.status_code,
                    'content_type': response.headers.get('Content-Type', ''),
                    'page_size_bytes': len(response.content)
                }

                return {
                    "success": True,
                    "data": {
                        "url": url,
                        "base_url": base_url,
                        "path": path,
                        "meta": meta_data,
                        "title": meta_data['title'],
                        "headings": headings,
                        "links": links,
                        "images": images,
                        "paragraphs": paragraphs,
                        "html_structure": html_structure,
                        "css_info": css_info,
                        "scripts": scripts,
                        "forms": forms,
                        "element_tree": element_tree,
                        # First 5000 chars of HTML
                        "html_sample": response.text[:5000]
                    },
                    "analytics": analytics,
                    "type": "static"
                }
            else:
                return {
                    "success": False,
                    "error": f"Website request failed with status code {response.status_code}",
                    "type": "static",
                    "analytics": {
                        "processing_time_seconds": round(time.time() - self.start_time, 2),
                        "status_code": response.status_code
                    }
                }

        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timed out. The website took too long to respond.",
                "type": "static",
                "analytics": {
                    "processing_time_seconds": round(time.time() - self.start_time, 2)
                }
            }
        except requests.exceptions.TooManyRedirects:
            return {
                "success": False,
                "error": "Too many redirects. The website has a redirect loop.",
                "type": "static",
                "analytics": {
                    "processing_time_seconds": round(time.time() - self.start_time, 2)
                }
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Error scraping website: {str(e)}",
                "type": "static",
                "analytics": {
                    "processing_time_seconds": round(time.time() - self.start_time, 2)
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}",
                "type": "static",
                "analytics": {
                    "processing_time_seconds": round(time.time() - self.start_time, 2)
                }
            }
