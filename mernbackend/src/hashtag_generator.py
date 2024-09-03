import sys
import requests
from bs4 import BeautifulSoup
import certifi

def fetch_webpage_content(url):
    try:
        response = requests.get(url, verify=certifi.where())  # Verify SSL certificate
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.content
    except requests.RequestException as e:
        print(f"Error fetching webpage content: {e}", file=sys.stderr)
        sys.exit(1)

def parse_title(content):
    soup = BeautifulSoup(content, 'html.parser')
    title_element = soup.find('h1')
    title_text = title_element.get_text(strip=True) if title_element else "Title not found"
    hashtags = ["#" + word for word in title_text.split()] + ["#post", "#blog","#instagram","#facebook","#twitter","#social_media","#social_apps"]
    return hashtags

def main(url):
    content = fetch_webpage_content(url)
    hashtags = parse_title(content)
    print("\n".join(hashtags))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python hashtag_generator.py <url>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    main(url)
