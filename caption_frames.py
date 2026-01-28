from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from PIL import Image
import torch
import os
from tqdm import tqdm

model_name = "nlpconnect/vit-gpt2-image-captioning"
model = VisionEncoderDecoderModel.from_pretrained(model_name)
feature_extractor = ViTImageProcessor.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

max_length = 16
num_beams = 4
gen_kwargs = {"max_length": max_length, "num_beams": num_beams}

frames_dir = "frames"
output_file = "captions.txt"

def predict_step(image_paths):
    images = []
    for image_path in image_paths:
        i_image = Image.open(image_path)
        if i_image.mode != "RGB":
            i_image = i_image.convert(mode="RGB")
        images.append(i_image)

    pixel_values = feature_extractor(images=images, return_tensors="pt").pixel_values
    pixel_values = pixel_values.to(device)

    output_ids = model.generate(pixel_values, **gen_kwargs)

    preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
    preds = [pred.strip() for pred in preds]
    return preds

print(f"Generating captions using {model_name}...")

# Collect valid image files
image_files = sorted([f for f in os.listdir(frames_dir) if f.endswith(".jpg")])

with open(output_file, "w") as f:
    for frame in tqdm(image_files):
        path = os.path.join(frames_dir, frame)
        try:
            # Predict one by one to keep it simple and safe for memory, 
            # though batching could be faster.
            captions = predict_step([path]) 
            f.write(f"{frame}: {captions[0]}\n")
            f.flush() # Ensure write in case of crash
        except Exception as e:
            print(f"Error processing {frame}: {e}")

print("Captions saved to captions.txt")

