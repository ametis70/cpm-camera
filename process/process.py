import os, sys, random
import pathlib
import argparse
from datetime import datetime, date
from time import strftime
from pathlib import Path
from babel.dates import format_datetime

import cv2
from PIL import Image, ImageDraw, ImageFont
import unicodedata

DATA_DIR = pathlib.Path(os.path.abspath(os.path.dirname(__file__)), "data")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Process an image uploaded to the server."
    )
    parser.add_argument("filename", action="store", help="Filename of photo to process")
    parser.add_argument("city", action="store", help="City of the visitor")
    parser.add_argument("school", action="store", help="School of the visitor")
    parser.add_argument("age", action="store", help="Age of the visitor")
    parser.add_argument("file", action="store", help="File number (legajo)")
    parser.add_argument("outdir", action="store", help="Output directory")

    return parser.parse_args()


def process(args):
    print("processing")
    image = cv2.imread(args.filename)
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(
        str(DATA_DIR / "haarcascade_frontalface_default.xml")
    )
    faces = face_cascade.detectMultiScale(image_gray)

    n_faces = len(faces)

    if n_faces < 1:
        raise Exception("No faces found")
    else:
        print(f"{n_faces} faces detected in the image.")

    im = Image.open(args.filename)
    draw = ImageDraw.Draw(im)

    # Draw circles
    for x, y, width, height in faces:
        randomFile = random.choice(os.listdir(DATA_DIR / "circles"))
        circle = Image.open(str(DATA_DIR / "circles" / randomFile))

        circle = circle.resize((width * 2, height * 2), Image.ANTIALIAS)
        im.paste(circle, (x - width // 2, y - height // 2), circle)

    # Load fonts
    typewriter_font_size = 40
    typewriter_font = ImageFont.truetype(
        str(DATA_DIR / "ttf" / "typewriter.ttf"), typewriter_font_size
    )
    marker_font = ImageFont.truetype(str(DATA_DIR / "ttf" / "marker.ttf"), 50)
    marker_font_large = ImageFont.truetype(str(DATA_DIR / "ttf" / "marker.ttf"), 70)
    marker_color = (13, 16, 153, 230)

    # Draw top sheet of paper
    top_sheet = Image.open(str(DATA_DIR / "paper" / "01.png")).convert("RGBA")
    top_sheet = top_sheet.crop((0, 0, top_sheet.width - 300, top_sheet.height - 400))
    top_txt_layer = Image.new("RGBA", top_sheet.size, (255, 255, 255, 0))
    top_d = ImageDraw.Draw(top_txt_layer)

    top_text_lines = [
        f"Legajo: {args.file}",
        "Nombre: ___________________",
        "En vigilancia",
        "Bajo sospecha: _________",
        "Peligrosidad: _______________ ",
    ]

    for index, line in enumerate(top_text_lines):
        top_d.text(
            (40, 30 + typewriter_font_size * index * 1.35),
            line,
            font=typewriter_font,
            fill=(43, 37, 22, 200),
        )

    top_d.text((410, 185), "Sí", font=marker_font_large, fill=marker_color)
    top_d.text(
        (370, 240),
        random.choice(["Moderada", "Alta"]),
        font=marker_font_large,
        fill=marker_color,
    )

    top_out = Image.alpha_composite(top_sheet, top_txt_layer)

    # Rotate and resize
    top_out = top_out.rotate(random.uniform(-1.5, 1.5), Image.BILINEAR, True)

    wpercent = im.width / float(top_sheet.size[0])
    hsize = int((float(top_sheet.size[1]) * float(wpercent)))
    top_out = top_out.resize((int(im.width * 0.5), int(hsize * 0.5)), Image.ANTIALIAS)

    im.paste(
        top_out,
        (
            random.randrange(20, 50),
            20,
        ),
        top_out,
    )

    # Draw bottom sheet of paper
    bottom_sheet = Image.open(str(DATA_DIR / "paper" / "02.png")).convert("RGBA")
    bottom_sheet = bottom_sheet.crop(
        (0, 0, bottom_sheet.width, bottom_sheet.height - 100)
    )
    bottom_txt_layer = Image.new("RGBA", bottom_sheet.size, (255, 255, 255, 0))
    bottom_d = ImageDraw.Draw(bottom_txt_layer)

    bottom_text_lines = [
        "Lugar de residencia: _____________________",
        "Escuela: ________________________________",
        "Edad aproximada: ________",
        "Merodeo la DIPBA el",
        unicodedata.normalize(
            "NFKD",
            format_datetime(
                datetime.now(), "EEEE d 'de' MMMM 'de' YYYY 'a las' h a", locale="es_AR"
            ),
        ),
        "",
        "",
        "Investigando:",
        "Pariticipación política: _________________",
        "Orientación Sexual: _________________",
        "Círculo social: ________________________",
    ]
    bottom_text_lines.reverse()

    for index, line in enumerate(bottom_text_lines):
        bottom_d.text(
            (
                40,
                bottom_sheet.height
                - typewriter_font_size * 3
                - typewriter_font_size * index * 1.2,
            ),
            line,
            font=typewriter_font,
            fill=(43, 37, 22, 200),
        )

    bottom_d.text((520, 50), args.city, font=marker_font, fill=marker_color)
    bottom_d.text((220, 100), args.school, font=marker_font, fill=marker_color)
    bottom_d.text((460, 150), args.age, font=marker_font, fill=marker_color)

    bottom_out = Image.alpha_composite(bottom_sheet, bottom_txt_layer)

    # Rotate and resize
    bottom_out = bottom_out.rotate(random.uniform(-2.5, 2.5), Image.BILINEAR, True)

    wpercent = im.width / float(bottom_sheet.size[0])
    hsize = int((float(bottom_sheet.size[1]) * float(wpercent)))
    bottom_out = bottom_out.resize(
        (int(im.width * 0.7), int(hsize * 0.7)), Image.ANTIALIAS
    )

    im.paste(
        bottom_out,
        (
            int(im.width / 2) - int(bottom_out.width / 2),
            im.height - bottom_out.height - 20,
        ),
        bottom_out,
    )

    # Draw bottom sheet of paper
    bottom_sheet = Image.open(str(DATA_DIR / "paper" / "01.png")).convert("RGBA")
    bottom_sheet = bottom_sheet.crop(
        (0, 0, bottom_sheet.width, bottom_sheet.height - 100)
    )
    bottom_txt_layer = Image.new("RGBA", bottom_sheet.size, (255, 255, 255, 0))
    bottom_d = ImageDraw.Draw(bottom_txt_layer)

    bottom_text_lines = [
        "Lugar de residencia: _____________________",
        "Escuela: ________________________________",
        "Edad aproximada: ________",
        "Merodeo la DIPBA el",
        unicodedata.normalize(
            "NFKD",
            format_datetime(
                datetime.now(), "EEEE d 'de' MMMM 'de' YYYY 'a las' h a", locale="es_AR"
            ),
        ),
        "",
        "",
        "Investigando:",
        "Pariticipación política: _________________",
        "Orientación Sexual: _________________",
        "Círculo social: ________________________",
    ]
    bottom_text_lines.reverse()

    for index, line in enumerate(bottom_text_lines):
        bottom_d.text(
            (
                40,
                bottom_sheet.height
                - typewriter_font_size * 3
                - typewriter_font_size * index * 1.2,
            ),
            line,
            font=typewriter_font,
            fill=(43, 37, 22, 200),
        )

    marker_color = (13, 16, 153, 230)
    bottom_d.text((520, 50), args.city, font=marker_font, fill=marker_color)
    bottom_d.text((220, 100), args.school, font=marker_font, fill=marker_color)
    bottom_d.text((460, 150), args.age, font=marker_font, fill=marker_color)

    bottom_out = Image.alpha_composite(bottom_sheet, bottom_txt_layer)

    # Rotate and resize
    bottom_out = bottom_out.rotate(random.uniform(-2.5, 2.5), Image.BILINEAR, True)

    wpercent = im.width / float(bottom_sheet.size[0])
    hsize = int((float(bottom_sheet.size[1]) * float(wpercent)))
    bottom_out = bottom_out.resize(
        (int(im.width * 0.7), int(hsize * 0.7)), Image.ANTIALIAS
    )

    im.paste(
        bottom_out,
        (
            int(im.width / 2) - int(bottom_out.width / 2),
            im.height - bottom_out.height - 20,
        ),
        bottom_out,
    )

    # Save file
    today = date.today()
    time = strftime("%H-%M-%S")

    Path(f"{args.outdir}/{today}/").mkdir(parents=True, exist_ok=True)
    im.save(f"{args.outdir}/{today}/{time}.jpg")


if __name__ == "__main__":
    args = parse_args()
    try:
        process(args)
        sys.exit(0)
    except Exception as e:
        print(e)
        sys.exit(1)
