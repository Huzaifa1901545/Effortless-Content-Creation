import sys
import requests
import json
import base64
from io import BytesIO
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageFont
import time

# Get the URL from command-line arguments
url = sys.argv[1]

# Your Stable Diffusion API key
api_key = "sk-MxKQjd4LmTq28rGCK0SmK7H9oWtxSyVjaowj9ZCH8QHs1864"

def fetch_webpage_content(url):
    response = requests.get(url)
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response.content

def parse_title(content):
    soup = BeautifulSoup(content, 'html.parser')
    title_element = soup.find('h1')
    return title_element.get_text(strip=True) if title_element else "Title not found"

def send_to_stable_diffusion(title_text):
    stable_diffusion_api_url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
    payload = {
        "text_prompts": [
            {"text": title_text}
        ],
        "height": 1024,  # Valid dimensions as per the documentation
        "width": 1024
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    for attempt in range(5):  # Retry up to 5 times
        try:
            response = requests.post(stable_diffusion_api_url, json=payload, headers=headers)
            response.raise_for_status()  # Raise an exception for HTTP errors
            return response.json()
        except requests.RequestException as e:
            print(f'Attempt {attempt+1} failed: {e}', file=sys.stderr)
            time.sleep(5)  # Wait for 5 seconds before retrying
    raise Exception('Failed to reach Stable Diffusion API after multiple attempts')

def generate_image(title_text):
    response = send_to_stable_diffusion(title_text)
    image_data = base64.b64decode(response['artifacts'][0]['base64'])
    image = Image.open(BytesIO(image_data))
    return image

def resize_image(image, size=(1024, 1024)):
    return image.resize(size, Image.Resampling.LANCZOS)

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
    
    # Generate the image using Stable Diffusion API
    image = generate_image(title_text)
    
    # Add the parsed title text onto the generated image
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
