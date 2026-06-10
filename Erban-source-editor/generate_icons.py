"""Generate ErBan (贰伴) icons with a refined jade-green aesthetic."""
from PIL import Image, ImageDraw, ImageFont
import os

GREEN = (0, 168, 107)      # #00a86b jade green
GREEN_DARK = (0, 143, 90)
WHITE = (255, 255, 255)
SIZES = [(16, 16), (48, 48), (128, 128)]
OUT_DIR = os.path.join(os.path.dirname(__file__), 'icons')

def create_icon(size, filename):
    s = size[0]
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = max(1, s // 7)
    radius = max(2, s // 4)

    # Rounded rectangle background with gradient-like color
    draw.rounded_rectangle(
        [margin, margin, s - margin, s - margin],
        radius=radius, fill=GREEN
    )

    # Draw "EB" monogram for larger icons
    if s >= 48:
        try:
            font_size = int(s * 0.45)
            # Try Chinese-capable fonts
            for font_name in ["msyh.ttc", "msyhbd.ttc", "simhei.ttf", "simsun.ttc",
                              "courbd.ttf", "consolab.ttf", "arialbd.ttf"]:
                try:
                    font = ImageFont.truetype(font_name, font_size)
                    break
                except Exception:
                    continue
            else:
                font = ImageFont.load_default()
        except Exception:
            font = ImageFont.load_default()

        # Use "二" character as monogram (贰伴)
        text = "二"  # 二
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        x = (s - tw) // 2
        y = (s - th) // 2 - int(s * 0.04)
        draw.text((x, y), text, fill=WHITE, font=font)
    elif s >= 16:
        # Simple chevron pattern for tiny icon
        cx = s // 2
        y1 = s // 3
        y2 = 2 * s // 3
        w = max(1, s // 8)
        draw.line([(cx + w, y1), (cx - 1, s // 2), (cx + w, y2)], fill=WHITE, width=2)
        draw.line([(cx - w, y1), (cx + 1, s // 2), (cx - w, y2)], fill=WHITE, width=2)

    img.save(filename, 'PNG')
    print(f'  Created {filename} ({s}x{s})')

os.makedirs(OUT_DIR, exist_ok=True)
print('Generating ErBan icons...')
for w, h in SIZES:
    create_icon((w, h), os.path.join(OUT_DIR, f'icon{w}.png'))
print('Done.')
