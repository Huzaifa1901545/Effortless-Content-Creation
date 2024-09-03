import os
import sys
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import numpy as np
import certifi
from moviepy.editor import ImageClip, TextClip, CompositeVideoClip
from moviepy.config import change_settings
import random
import base64
import logging
import contextlib
import io

# Set the path to ImageMagick
change_settings({"IMAGEMAGICK_BINARY": r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"})

# Suppress MoviePy logs
logging.getLogger('moviepy').setLevel(logging.ERROR)

def fetch_webpage_content(url):
    try:
        response = requests.get(url, verify=certifi.where())
        response.raise_for_status()
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
        response = requests.get(url, verify=certifi.where())
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        image = image.resize((1080, 1080), Image.Resampling.LANCZOS)
        return image
    except requests.RequestException as e:
        print(f"Error fetching image: {e}", file=sys.stderr)
        sys.exit(1)

def get_random_animation():
    animations = ['flyin', 'flyout', 'move_up_to_down']
    return random.choice(animations)

def create_text_clip(text, duration=10):
    text_clip = TextClip(text, fontsize=50, font='Arial-Bold', color='white', size=(1080, 200))

    animation = get_random_animation()
    if animation == 'flyin':
        text_clip = text_clip.set_position(lambda t: ('center', 1080 - int(1080 * t))).fadein(0.5)
    elif animation == 'flyout':
        text_clip = text_clip.set_position(lambda t: ('center', int(1080 * t))).fadein(0.5)
    elif animation == 'move_up_to_down':
        text_clip = text_clip.set_position(lambda t: ('center', 200 - int(880 * t))).fadein(0.5)
    else:
        text_clip = text_clip.set_position(('center', 'bottom'))

    text_clip = text_clip.set_start(0).set_end(duration + 1).crossfadeout(1)
    return text_clip

def create_video_with_text(image, text, duration=3):
    image_np = np.array(image)
    image_clip = ImageClip(image_np).set_duration(duration + len(text.split()) * 0.5)

    text_clip = create_text_clip(text, duration)

    video = CompositeVideoClip([image_clip, text_clip.set_position(('center', 'center')).resize(width=800)])
    return video

def main(url):
    content = fetch_webpage_content(url)
    title_text = parse_title(content)

    soup = BeautifulSoup(content, 'html.parser')
    image_element = soup.find('img', class_='hover:ds-scale-110 hover:ds-transition-transform hover:ds-duration-500 hover:ds-ease-in-out ds-rounded-t-xl')
    image_url = image_element['src'] if image_element and 'src' in image_element.attrs else None

    if image_url:
        image = fetch_image(image_url)
        image = image.convert("RGB")
        video = create_video_with_text(image, title_text)
        video_file_path = "output.mp4"

        # Redirect stdout and stderr to suppress MoviePy logs
        with open(os.devnull, 'w') as devnull, contextlib.redirect_stdout(devnull), contextlib.redirect_stderr(devnull):
            video.write_videofile(video_file_path, fps=24, codec='libx264', audio_codec='aac')

    else:
        print("No image found", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <url>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    main(url)

    # Print the Base64-encoded data to stdout
    with open("output.mp4", "rb") as video_file:
        video_data = base64.b64encode(video_file.read()).decode('utf-8')
        print(video_data)
        print(len(video_data))
