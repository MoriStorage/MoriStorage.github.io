import os
import requests
from io import BytesIO
from PIL import Image
from openai import OpenAI

# 1. Initialize the OpenAI client
# It will automatically look for the OPENAI_API_KEY environment variable.
# Alternatively, pass it directly: client = OpenAI(api_key="your-api-key-here")
client = OpenAI()

# 2. Define the text prompt
prompt_text = (
    "Sonic.exe and Soul Tails standing side by side as 'Soul Brothers', dark creepypasta concept art, "
    "LMS Outcome Memories style. Sonic.exe is a glitchy, terrifying blue hedgehog with glowing red pupils "
    "in black sockets and a wide, sinister, jagged grin. Soul Tails is a tragic, ghostly fox with hollow "
    "black eyes weeping dark static, looking empty and corrupted. Sonic.exe has a clawed hand on Tails' shoulder. "
    "Background is a distorted, glitching Green Hill Zone under a bloody red sky with VHS static effects. "
    "Grim, eerie, surreal horror illustration, cinematic lighting, highly detailed."
)

print("Sending prompt to DALL-E 3...")

try:
    # 3. Request the image from DALL-E 3
    response = client.images.generate(
        model="dall-e 3",
        prompt=prompt_text,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    # 4. Extract the image URL
    image_url = response.data[0].url
    print("Image generated successfully! Downloading...")

    # 5. Download the image data
    image_response = requests.get(image_url)
    img = Image.open(BytesIO(image_response.content))

    # 6. Save the file locally as a PNG
    output_filename = "soul_brothers_concept.png"
    img.save(output_filename, "PNG")
    
    print(f"Success! Your image has been saved as '{output_filename}' in your current directory.")

except Exception as e:
    print(f"An error occurred: {e}")
