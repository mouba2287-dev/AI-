import os
import zipfile
import io
from typing import List
from PIL import Image
import pypdf

IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.bmp'}

def extract_cbz(file_bytes: bytes, output_dir: str) -> List[str]:
    """Extracts images from a CBZ (ZIP) file and saves them sequentially in output_dir."""
    os.makedirs(output_dir, exist_ok=True)
    extracted_paths = []

    with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
        file_list = [f for f in zf.namelist() if not f.startswith('__MACOSX') and not f.endswith('/')]
        file_list.sort(key=lambda x: [int(c) if c.isdigit() else c.lower() for c in os.path.basename(x).replace('.', ' ').split()])

        page_num = 1
        for member in file_list:
            ext = os.path.splitext(member)[1].lower()
            if ext in IMAGE_EXTENSIONS:
                img_data = zf.read(member)
                try:
                    img = Image.open(io.BytesIO(img_data))
                    filename = f"page_{page_num:04d}.png"
                    out_path = os.path.join(output_dir, filename)
                    img.convert('RGB').save(out_path, 'PNG')
                    extracted_paths.append(out_path)
                    page_num += 1
                except Exception as e:
                    print(f"Error processing image {member} in CBZ: {e}")

    return extracted_paths

def extract_pdf(file_bytes: bytes, output_dir: str) -> List[str]:
    """Extracts pages/images from a PDF file into images in output_dir."""
    os.makedirs(output_dir, exist_ok=True)
    extracted_paths = []

    try:
        from pdf2image import convert_from_bytes
        images = convert_from_bytes(file_bytes)
        for idx, img in enumerate(images, start=1):
            filename = f"page_{idx:04d}.png"
            out_path = os.path.join(output_dir, filename)
            img.convert('RGB').save(out_path, 'PNG')
            extracted_paths.append(out_path)
        if extracted_paths:
            return extracted_paths
    except Exception as e:
        print(f"pdf2image fallback to pypdf due to: {e}")

    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        page_num = 1
        for page in reader.pages:
            for count, image_file_object in enumerate(page.images):
                img_data = image_file_object.data
                img = Image.open(io.BytesIO(img_data))
                filename = f"page_{page_num:04d}.png"
                out_path = os.path.join(output_dir, filename)
                img.convert('RGB').save(out_path, 'PNG')
                extracted_paths.append(out_path)
                page_num += 1
    except Exception as e:
        print(f"pypdf extraction error: {e}")

    return extracted_paths

def create_cbz(images_dir: str, output_cbz_path: str) -> str:
    """Creates a CBZ archive from translated image files in images_dir."""
    os.makedirs(os.path.dirname(output_cbz_path), exist_ok=True)

    image_files = sorted([
        f for f in os.listdir(images_dir)
        if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS
    ])

    with zipfile.ZipFile(output_cbz_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for idx, img_file in enumerate(image_files, start=1):
            file_path = os.path.join(images_dir, img_file)
            arcname = f"page_{idx:04d}.png"
            zf.write(file_path, arcname=arcname)

    return output_cbz_path
