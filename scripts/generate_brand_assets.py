import base64
import os
import shutil
import io
import numpy as np
from PIL import Image

src_black_path = r'C:\Users\lohar\.gemini\antigravity-ide\brain\eaa4e45c-aa6c-42b7-ac95-86a784a5dc1d\.user_uploaded\media_1791483626391.png'
src_white_path = r'C:\Users\lohar\.gemini\antigravity-ide\brain\eaa4e45c-aa6c-42b7-ac95-86a784a5dc1d\.user_uploaded\media_1791483675640.png'
out_dir = r'e:\Aveezfashion\public\brand'
os.makedirs(out_dir, exist_ok=True)

# 1. Copy original master files
shutil.copyfile(src_black_path, os.path.join(out_dir, 'master-logo-black.png'))
shutil.copyfile(src_white_path, os.path.join(out_dir, 'master-logo-white.png'))
print('Copied master-logo-black.png and master-logo-white.png')

# 2. Process high-res transparent layers
im_b = Image.open(src_black_path).convert('L')
arr_b = np.array(im_b, dtype=np.float32)

# High-precision alpha channel:
# Value 250+ (white) -> Alpha 0
# Value <= 10 (black) -> Alpha 255
alpha_b = np.clip((250.0 - arr_b) / 240.0 * 255.0, 0, 255).astype(np.uint8)

h, w = arr_b.shape
black_rgba = np.zeros((h, w, 4), dtype=np.uint8)
black_rgba[:, :, 3] = alpha_b

white_rgba = np.zeros((h, w, 4), dtype=np.uint8)
white_rgba[:, :, 0] = 255
white_rgba[:, :, 1] = 255
white_rgba[:, :, 2] = 255
white_rgba[:, :, 3] = alpha_b

full_black = Image.fromarray(black_rgba, 'RGBA')
full_white = Image.fromarray(white_rgba, 'RGBA')

# Bounds of full primary logo (monogram + aveez + fashion)
mask_full = alpha_b > 10
y_all, x_all = np.where(mask_full)
pad_fx = int((x_all.max() - x_all.min()) * 0.02)
pad_fy = int((y_all.max() - y_all.min()) * 0.02)
box_primary = (
    max(0, int(x_all.min()) - pad_fx),
    max(0, int(y_all.min()) - pad_fy),
    min(w, int(x_all.max()) + pad_fx),
    min(h, int(y_all.max()) + pad_fy)
)

primary_b = full_black.crop(box_primary)
primary_w = full_white.crop(box_primary)

primary_b.save(os.path.join(out_dir, 'primary-logo.png'))
primary_w.save(os.path.join(out_dir, 'primary-logo-white.png'))
print('Saved primary-logo.png & primary-logo-white.png:', primary_b.size)

# Monogram alone
mask_m = mask_full.copy()
mask_m[615:, :] = False
y_m, x_m = np.where(mask_m)
pad_mx = int((x_m.max() - x_m.min()) * 0.03)
pad_my = int((y_m.max() - y_m.min()) * 0.03)
box_m = (
    max(0, int(x_m.min()) - pad_mx),
    max(0, int(y_m.min()) - pad_my),
    min(w, int(x_m.max()) + pad_mx),
    min(h, int(y_m.max()) + pad_my)
)

mono_b = full_black.crop(box_m)
mono_w = full_white.crop(box_m)
mono_b.save(os.path.join(out_dir, 'av-monogram.png'))
mono_w.save(os.path.join(out_dir, 'av-monogram-white.png'))
print('Saved av-monogram.png & av-monogram-white.png:', mono_b.size)

# Wordmark alone
mask_w_part = mask_full.copy()
mask_w_part[:620, :] = False
y_wp, x_wp = np.where(mask_w_part)
pad_wx = int((x_wp.max() - x_wp.min()) * 0.02)
pad_wy = int((y_wp.max() - y_wp.min()) * 0.02)
box_w_part = (
    max(0, int(x_wp.min()) - pad_wx),
    max(0, int(y_wp.min()) - pad_wy),
    min(w, int(x_wp.max()) + pad_wx),
    min(h, int(y_wp.max()) + pad_wy)
)

word_b = full_black.crop(box_w_part)
word_w = full_white.crop(box_w_part)
word_b.save(os.path.join(out_dir, 'aveez-wordmark.png'))
word_w.save(os.path.join(out_dir, 'aveez-wordmark-white.png'))
print('Saved aveez-wordmark.png & aveez-wordmark-white.png:', word_b.size)

# Horizontal lockup composition
scale_w = 160.0 / word_b.height
new_word_w = int(word_b.width * scale_w)
new_word_h = int(word_b.height * scale_w)
wb_resized = word_b.resize((new_word_w, new_word_h), Image.Resampling.LANCZOS)
ww_resized = word_w.resize((new_word_w, new_word_h), Image.Resampling.LANCZOS)

scale_m = 200.0 / mono_b.height
new_m_w = int(mono_b.width * scale_m)
new_m_h = int(mono_b.height * scale_m)
mb_resized = mono_b.resize((new_m_w, new_m_h), Image.Resampling.LANCZOS)
mw_resized = mono_w.resize((new_m_w, new_m_h), Image.Resampling.LANCZOS)

gap = 48
canvas_w = new_m_w + gap + new_word_w
canvas_h = max(new_m_h, new_word_h) + 20

horiz_b = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
horiz_b.paste(mb_resized, (0, (canvas_h - new_m_h) // 2), mb_resized)
horiz_b.paste(wb_resized, (new_m_w + gap, (canvas_h - new_word_h) // 2), wb_resized)
horiz_b.save(os.path.join(out_dir, 'horizontal-logo.png'))

horiz_w = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
horiz_w.paste(mw_resized, (0, (canvas_h - new_m_h) // 2), mw_resized)
horiz_w.paste(ww_resized, (new_m_w + gap, (canvas_h - new_word_h) // 2), ww_resized)
horiz_w.save(os.path.join(out_dir, 'horizontal-logo-white.png'))
print('Saved horizontal-logo.png & horizontal-logo-white.png:', horiz_b.size)

# SVG wrappers with base64 embedded PNG
def make_svg(png_img, svg_path):
    buf = io.BytesIO()
    png_img.save(buf, format='PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    pw, ph = png_img.size
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {pw} {ph}" width="{pw}" height="{ph}">
  <image href="data:image/png;base64,{b64}" width="{pw}" height="{ph}" preserveAspectRatio="xMidYMid meet" />
</svg>
'''
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)

make_svg(primary_b, os.path.join(out_dir, 'primary-logo.svg'))
make_svg(primary_w, os.path.join(out_dir, 'primary-logo-white.svg'))
make_svg(horiz_b, os.path.join(out_dir, 'logo-black.svg'))
make_svg(horiz_w, os.path.join(out_dir, 'logo-white.svg'))
make_svg(horiz_b, os.path.join(out_dir, 'horizontal-logo.svg'))
make_svg(mono_b, os.path.join(out_dir, 'av-monogram.svg'))
make_svg(mono_w, os.path.join(out_dir, 'av-monogram-white.svg'))
make_svg(word_b, os.path.join(out_dir, 'aveez-wordmark.svg'))
make_svg(word_w, os.path.join(out_dir, 'aveez-wordmark-white.svg'))

# Clothing label SVG
buf_lbl = io.BytesIO()
primary_b.save(buf_lbl, format='PNG')
lbl_b64 = base64.b64encode(buf_lbl.getvalue()).decode('ascii')
clothing_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280">
  <!-- Physical Woven Garment Label -->
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1" />
    </filter>
  </defs>
  <!-- Label Base -->
  <rect x="10" y="10" width="180" height="260" rx="2" fill="#FBFBFB" stroke="#D4D4D8" stroke-width="1.5" stroke-dasharray="5 3" filter="url(#shadow)" />
  
  <!-- Hanger Ribbon Loop -->
  <line x1="80" y1="10" x2="120" y2="10" stroke="#71717A" stroke-width="2.5" stroke-linecap="round" />
  
  <!-- Primary Brand Logo -->
  <image href="data:image/png;base64,{lbl_b64}" x="30" y="32" width="140" height="114" preserveAspectRatio="xMidYMid meet" />
  
  <!-- Divider Stitch -->
  <line x1="35" y1="160" x2="165" y2="160" stroke="#E4E4E7" stroke-width="1" />
  
  <!-- Label Details -->
  <text x="100" y="182" font-family="'Outfit', -apple-system, sans-serif" font-size="9" font-weight="600" letter-spacing="3" fill="#18181B" text-anchor="middle">
    ORIGINALS
  </text>
  <text x="100" y="202" font-family="'Inter', -apple-system, sans-serif" font-size="7.5" font-weight="500" letter-spacing="2" fill="#71717A" text-anchor="middle">
    HEAVYWEIGHT EDITION
  </text>
  <text x="100" y="222" font-family="'Inter', -apple-system, sans-serif" font-size="7" font-weight="500" letter-spacing="2" fill="#A1A1AA" text-anchor="middle">
    CRAFTED IN INDIA
  </text>
  <text x="100" y="246" font-family="ui-monospace, monospace" font-size="6.5" font-weight="400" letter-spacing="1.5" fill="#A1A1AA" text-anchor="middle">
    RN #849204 • 100% COTTON
  </text>
</svg>
'''
with open(os.path.join(out_dir, 'clothing-label-mark.svg'), 'w', encoding='utf-8') as f:
    f.write(clothing_svg)

# Favicons
mono_sq = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
scale_fav = 440.0 / max(mono_b.width, mono_b.height)
mf_w = int(mono_b.width * scale_fav)
mf_h = int(mono_b.height * scale_fav)
mf_resized = mono_b.resize((mf_w, mf_h), Image.Resampling.LANCZOS)
mono_sq.paste(mf_resized, ((512 - mf_w) // 2, (512 - mf_h) // 2), mf_resized)

mono_sq.save(r'e:\Aveezfashion\public\favicon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64)])
mono_sq.save(r'e:\Aveezfashion\public\apple-touch-icon.png')
mono_sq.save(r'e:\Aveezfashion\src\app\icon.png')

print('ALL BRAND ASSETS GENERATED SUCCESSFULLY!')
