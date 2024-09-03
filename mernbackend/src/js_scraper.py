import sys
import requests
import json
import base64
from io import BytesIO
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageFont

# Get the URL from command-line arguments
url = sys.argv[1]

# Your Unsplash API key
unsplash_api_key = "iGd7TeBBDb7pQsvmbWM4z8m3VyM4Mx_8I1bDME8_z4M"

def fetch_webpage_content(url):
    response = requests.get(url)
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response.content

def parse_title(content):
    soup = BeautifulSoup(content, 'html.parser')
    title_element = soup.find('h1')
    return title_element.get_text(strip=True) if title_element else "Title not found"

def fetch_unsplash_image(orientation="landscape"):
    unsplash_api_url = "https://api.unsplash.com/photos/random"
    headers = {
        "Authorization": f"Client-ID {unsplash_api_key}",
        "Accept-Version": "v1"
    }
    params = {
        "orientation": orientation,
        "query": "artistic",
        "count": 1  # Fetch only one image
    }
    response = requests.get(unsplash_api_url, headers=headers, params=params)
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response.json()[0]  # Since we request only one image, take the first item

def download_unsplash_image(image_url):
    response = requests.get(image_url)
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response.content

def generate_image(title_text):
    image_data = fetch_unsplash_image()
    image_url = image_data["urls"]["full"]
    image_content = download_unsplash_image(image_url)
    image = Image.open(BytesIO(image_content))

    image = image.resize((1080, int(1080 * image.height / image.width)))
    return image

def add_text_to_image(image, text):
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("arial.ttf", size=32)  # Set the font size to 32

    # Calculate text size and position using textbbox
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    width, height = image.size
    text_x = (width - text_width) / 2
    text_y = height - text_height - 20

    # Add 5% extra height to the background
    extra_height = text_height * 0.30
    background_height = text_height + extra_height

    # Fill the background with black only for the full width and text height
    draw.rectangle([(0, text_y - extra_height / 2), (width, text_y + background_height + extra_height / 2)], fill="black")

    # Draw the text with white color
    draw.text((text_x, text_y), text, font=font, fill="white")  # Set the text color to white
    return image

try:
    # Fetch the webpage content
    content = fetch_webpage_content(url)
    
    # Parse the title text
    title_text = parse_title(content)
    
    # Fetch a random artistic image from Unsplash
    image = generate_image(title_text)
    
    # Add the parsed title text onto the image
    image_with_text = add_text_to_image(image, title_text)
    
    # Save the resulting image to a byte stream
    output = BytesIO()
    image_with_text.save(output, format="JPEG")
    output.seek(0)

    # Convert image to Base64
    base64_image = base64.b64encode(output.read()).decode('utf-8')

    # Print the Base64 image
    print(base64_image)

except Exception as e:
    print(f'An error occurred: {e}', file=sys.stderr)
    sys.exit(1)
