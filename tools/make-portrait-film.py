#!/usr/bin/env python3
"""
make-portrait-film.py — build the PHONE cut of the padel opening.

WHY THIS EXISTS
    The padel film is a 16:9 clip (1280x720). Cover-fitting it to a portrait
    phone shows only the middle ~26% of the frame: the player, the ball and
    the whole cups-and-racket arrangement fall outside the visible band, and
    the surviving sliver gets upscaled ~2.3x by the browser. On a phone the
    opening read as blurry empty court.

WHAT IT DOES
    Re-frames the film for portrait instead of cropping it blindly:

      1. measures, per frame, where the subject actually is (column edge
         energy -> horizontal centre of mass),
      2. smooths that into a slow drift so the crop pans with the action
         instead of jumping, and LOCKS it dead-centre for the cream tail —
         the hand-off maths depends on the final cup sitting at x=637,
      3. crops a portrait band on that path and resamples ONCE, offline,
         with Lanczos + a light unsharp, at the size a phone actually
         displays. The browser then draws it ~1:1 instead of upscaling.

    Output is smaller than the wide sequence it replaces, so phones download
    less AND get a sharper picture.

USAGE
    python3 tools/make-portrait-film.py            # writes public/assets/...
    python3 tools/make-portrait-film.py --preview  # contact sheet only

    Requires Pillow + numpy.  Re-run after replacing the padel footage, then
    bump "build" in public/assets/manifest.json to bust the asset cache.
"""

import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "public/assets/frames/padel")
OUT_DIR = os.path.join(ROOT, "public/assets/frames/padel-tall")
STILLS = os.path.join(ROOT, "public/assets/stills")

FW, FH = 1280, 720          # source frame
OUT_W, OUT_H = 800, 1735    # phone-native output (covers a 390pt screen at dpr2)
CROP_W = int(round(FH * OUT_W / OUT_H))     # 332 — portrait band in source px
TAIL = 150                  # frame where the film dissolves to cream
QUALITY = 76


def focal_path(n):
    """Per-frame horizontal centre of the crop, as a fraction of frame width."""
    cx = np.zeros(n)
    for i in range(n):
        im = Image.open(f"{SRC_DIR}/padel-{i+1:04d}.webp").convert("RGB").resize((320, 180))
        g = np.asarray(im).astype(np.float32).mean(axis=2)
        e = np.abs(np.diff(g, axis=1)).sum(axis=0)
        e = np.concatenate([e, [e[-1]]])
        e = np.clip(e - np.percentile(e, 35), 0, None)   # ignore the flat court
        cx[i] = float((e * np.arange(320)).sum() / max(e.sum(), 1e-6)) / 320.0

    # the cup the hand-off lands on is centred — never pan away from it
    cx[TAIL:] = 0.5

    def smooth(v, sig):
        k = np.arange(-3 * sig, 3 * sig + 1)
        w = np.exp(-k ** 2 / (2 * sig * sig)); w /= w.sum()
        return np.convolve(np.pad(v, (3 * sig, 3 * sig), mode="edge"), w, mode="same")[3 * sig:-3 * sig]

    s = smooth(cx, 18)
    s[TAIL + 20:] = 0.5           # absolutely locked once the cup is alone
    s = smooth(s, 8)
    half = CROP_W / 2 / FW
    return np.clip(s, half, 1 - half)


def render(img, focal):
    left = int(round(focal * FW - CROP_W / 2))
    left = max(0, min(FW - CROP_W, left))
    out = img.crop((left, 0, left + CROP_W, FH)).resize((OUT_W, OUT_H), Image.LANCZOS)
    return out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=3))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true", help="write a contact sheet and stop")
    args = ap.parse_args()

    if not os.path.isdir(SRC_DIR):
        sys.exit(f"missing source frames: {SRC_DIR}")
    n = len([f for f in os.listdir(SRC_DIR) if f.endswith(".webp")])
    print(f"source: {n} frames {FW}x{FH}")
    print(f"output: {OUT_W}x{OUT_H} from a {CROP_W}x{FH} band")

    print("measuring the subject path ...")
    focal = focal_path(n)

    if args.preview:
        picks = list(range(1, n + 1, max(1, n // 10)))[:10]
        tw = 188
        th = int(round(tw * OUT_H / OUT_W))
        sheet = Image.new("RGB", (tw * len(picks), th))
        for k, i in enumerate(picks):
            im = Image.open(f"{SRC_DIR}/padel-{i:04d}.webp").convert("RGB")
            sheet.paste(render(im, focal[i - 1]).resize((tw, th)), (tw * k, 0))
        out = os.path.join(ROOT, "portrait-preview.png")
        sheet.save(out)
        print("preview ->", out)
        return

    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0
    for i in range(n):
        im = Image.open(f"{SRC_DIR}/padel-{i+1:04d}.webp").convert("RGB")
        dst = f"{OUT_DIR}/padel-tall-{i+1:04d}.webp"
        render(im, focal[i]).save(dst, "WEBP", quality=QUALITY, method=6)
        total += os.path.getsize(dst)
        if (i + 1) % 60 == 0:
            print(f"  {i+1}/{n}")
    print(f"frames -> {OUT_DIR}  ({total/1048576:.1f} MB)")

    # the cup-free plate and the poster share the locked tail framing
    for src, dst in (("padel-plate.webp", "padel-plate-tall.webp"),
                     ("poster-padel.webp", "poster-padel-tall.webp")):
        p = os.path.join(STILLS, src)
        if not os.path.exists(p):
            print("skip (missing):", src); continue
        render(Image.open(p).convert("RGB"), 0.5).save(
            os.path.join(STILLS, dst), "WEBP", quality=84, method=6)
        print("still  ->", dst)

    man_path = os.path.join(ROOT, "public/assets/manifest.json")
    man = json.load(open(man_path))
    man.setdefault("sequences", {})["padel-tall"] = {
        "dir": "assets/frames/padel-tall", "base": "padel-tall",
        "count": n, "pad": 4, "ext": "webp"
    }
    json.dump(man, open(man_path, "w"), indent=1)
    print("manifest updated: padel-tall")
    print("\nremember to bump manifest 'build' to bust the asset cache")


if __name__ == "__main__":
    main()
