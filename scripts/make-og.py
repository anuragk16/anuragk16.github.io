"""Build assets/og-image.png (1200x630 link-preview card) from the headshot.

Usage: python3 scripts/make-og.py <path-to-headshot>
Uses macOS system fonts (Georgia Bold, Arial) so nothing is downloaded.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630
BG, INK, ACC, MUTED, LOGO = (15, 20, 17), (238, 245, 235), (168, 213, 186), (138, 151, 140), (232, 245, 225)
FONTS = Path("/System/Library/Fonts/Supplemental")


def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def cut_mask(size, cut):
    m = Image.new("L", size, 0)
    w, h = size
    ImageDraw.Draw(m).polygon([(0, 0), (w - cut, 0), (w, cut), (w, h), (0, h)], fill=255)
    return m


def main(src):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Photo on the right with the logo's slanted cut.
    ph = 470
    photo = Image.open(src).convert("RGB").resize((ph, ph), Image.LANCZOS)
    px, py = W - ph - 80, (H - ph) // 2
    d.polygon([(px + 16, py + 16), (px + ph + 16 - 40, py + 16), (px + ph + 16, py + 56), (px + ph + 16, py + ph + 16), (px + 16, py + ph + 16)], outline=ACC, width=3)
    img.paste(photo, (px, py), cut_mask((ph, ph), 40))

    # AK mark (same geometry as assets/logo.svg, scaled).
    s, ox, oy = 0.55, 80 - 30 * 0.55, 70 - 70 * 0.55
    P = lambda x, y: (ox + x * s, oy + y * s)
    d.line([P(50, 142), P(89.5, 91), P(129, 142)], fill=LOGO, width=int(19 * s), joint="curve")
    d.rectangle([P(30, 134.5), P(140, 150)], fill=BG)  # flat feet
    d.polygon([P(148, 81), P(176, 81), P(132, 106), P(173, 134.5), P(144, 134.5), P(117, 103)], fill=LOGO)

    x = 80
    d.text((x, 175), "SOFTWARE ENGINEER · COLOREDCOW", font=font("Arial Bold.ttf", 22), fill=ACC)
    d.text((x, 215), "Anurag Kumawat", font=font("Georgia Bold.ttf", 54), fill=INK)
    head = font("Georgia.ttf", 34)
    for i, line in enumerate(["I build software from zero", "and take it to real users."]):
        d.text((x, 315 + i * 52), line, font=head, fill=INK)
    d.text((x, 460), "anuragk16.github.io", font=font("Arial.ttf", 24), fill=MUTED)

    out = ROOT / "assets" / "og-image.png"
    img.save(out, optimize=True)
    print(out, out.stat().st_size)


if __name__ == "__main__":
    main(sys.argv[1])
