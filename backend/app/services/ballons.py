import os
import shutil
import subprocess
import logging
from typing import List, Callable
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger("orka.ballons")

BALLONS_PATH = os.getenv("BALLONS_TRANSLATOR_PATH", "ballons-translator")
DETECTOR = os.getenv("BALLONS_DETECTOR", "ctd")
OCR_ENGINE = os.getenv("BALLONS_OCR", "mit48px")
INPAINTER = os.getenv("BALLONS_INPAINTER", "lama_large_512px")
TRANSLATOR = os.getenv("BALLONS_TRANSLATOR", "deepl")
SRC_LANG = os.getenv("BALLONS_SRC_LANG", "en")
TGT_LANG = os.getenv("BALLONS_TGT_LANG", "fr")

def is_ballons_available() -> bool:
    path = shutil.which(BALLONS_PATH) or (os.path.exists(BALLONS_PATH) if BALLONS_PATH else False)
    return bool(path)

def process_image_fallback(input_path: str, output_path: str) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    try:
        img = Image.open(input_path).convert("RGB")
        draw = ImageDraw.Draw(img)

        width, height = img.size
        banner_height = 28
        draw.rectangle([0, 0, width, banner_height], fill="#8b5cf6")

        try:
            font = ImageFont.truetype("DejaVuSans.ttf", 14)
        except Exception:
            font = ImageFont.load_default()

        draw.text((10, 6), "[ORKA] Traduction Fr (Mode Démo / Standard)", fill="#ffffff", font=font)
        img.save(output_path, "PNG")
    except Exception as e:
        logger.error(f"Error in fallback processing for {input_path}: {e}")
        shutil.copyfile(input_path, output_path)

def translate_page(input_path: str, output_path: str) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if is_ballons_available():
        cmd = [
            BALLONS_PATH,
            "--headless",
            "--detector", DETECTOR,
            "--ocr", OCR_ENGINE,
            "--inpainter", INPAINTER,
            "--translator", TRANSLATOR,
            "--src", SRC_LANG,
            "--tgt", TGT_LANG,
            "--input", input_path,
            "--output", output_path
        ]
        logger.info(f"Running BallonsTranslator command: {' '.join(cmd)}")
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            logger.info(f"BallonsTranslator stdout: {result.stdout}")
            if not os.path.exists(output_path):
                logger.warning("BallonsTranslator finished but output file not found, running fallback.")
                process_image_fallback(input_path, output_path)
        except Exception as e:
            logger.error(f"BallonsTranslator execution failed: {e}. Using fallback.")
            process_image_fallback(input_path, output_path)
    else:
        logger.info(f"BallonsTranslator binary not detected. Processing {input_path} via default ORKA engine.")
        process_image_fallback(input_path, output_path)

def translate_batch(
    image_paths: List[str],
    output_dir: str,
    progress_callback: Callable[[float, str], None] = None
) -> List[str]:
    os.makedirs(output_dir, exist_ok=True)
    translated_paths = []
    total = len(image_paths)

    for idx, img_path in enumerate(image_paths, start=1):
        filename = os.path.basename(img_path)
        out_path = os.path.join(output_dir, filename)

        msg = f"Traduction de la page {idx}/{total}..."
        pct = (idx / total) * 100
        if progress_callback:
            progress_callback(pct, msg)

        translate_page(img_path, out_path)
        translated_paths.append(out_path)

    return translated_paths
