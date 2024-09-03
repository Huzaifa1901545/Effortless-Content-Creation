import sys
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import base64
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
    return title_element.get_text(strip=True) if title_element else "Title not found"

def fetch_image(url):
    try:
        response = requests.get(url, verify=certifi.where())  # Verify SSL certificate
        response.raise_for_status()  # Raise an exception for HTTP errors
        image = Image.open(BytesIO(response.content))
        image = image.resize((1080, 1080), Image.Resampling.LANCZOS)  # Resize the image to 1080x1080 pixels
        return image
    except requests.RequestException as e:
        print(f"Error fetching image: {e}", file=sys.stderr)
        sys.exit(1)

def add_text_to_image(image, text):
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("arial.ttf", size=32)

    # Calculate text size and position using textbbox
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    width, height = image.size
    text_x = (width - text_width) / 2
    text_y = height - text_height - 10

    # Add 5% extra height to the background
    extra_height = text_height * 0.30
    background_height = text_height + extra_height

    # Fill the background with black only for the full width and text height
    draw.rectangle([(0, text_y - extra_height / 2), (width, text_y + background_height + extra_height / 2)], fill="black")

    # Draw the text with white color
    draw.text((text_x, text_y), text, font=font, fill="white")
    return image

def main(url):
    content = fetch_webpage_content(url)
    title_text = parse_title(content)

    soup = BeautifulSoup(content, 'html.parser')
    image_element = soup.find('img', class_='hover:ds-scale-110 hover:ds-transition-transform hover:ds-duration-500 hover:ds-ease-in-out ds-rounded-t-xl')
    image_url = image_element['src'] if image_element and 'src' in image_element.attrs else None

    if image_url:
        image = fetch_image(image_url)
        image_with_text = add_text_to_image(image, title_text)

        # Save the resulting image to a byte stream
        output = BytesIO()
        image_with_text.save(output, format="JPEG")
        output.seek(0)

        # Encode the image bytes to Base64
        base64_data = base64.b64encode(output.read()).decode('utf-8')
        print(base64_data)  # Output the Base64 string
    else:
        print("No image found", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <url>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    main(url)
