import base64, re, sys, pathlib

R = pathlib.Path(__file__).resolve().parent
B = R / 'src'
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / 'index.html'
b64 = lambda p: base64.b64encode(pathlib.Path(p).read_bytes()).decode()

data = (B / 'data.js').read_text()
codes = re.findall(r'^\s*([A-Z]{2}):\s*\[', data, re.M) + ['EU']
flags = {}
for c in codes:
    f = B / 'flags' / f'{c}.svg'
    if f.exists():
        flags[c] = 'data:image/svg+xml;base64,' + b64(f)
missing = [c for c in codes if c not in flags]
if missing:
    print('missing flags', missing)
def photo(p):
    from PIL import Image
    import io
    im = Image.open(p).convert('RGB'); im = im.resize((1800, round(im.height * 1800 / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=80, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
hero_js = '/* Hero slideshow photos (embedded at build time from src/photos) */\nconst HERO_PHOTOS = [' + ','.join('"%s"' % photo(p) for p in sorted((B / 'photos').glob('*.jpg'))) + '];\n'
flags_js = 'const FLAGS = {' + ','.join(f'{k}:"{v}"' for k, v in flags.items()) + '};'

fonts = f'''@font-face{{font-family:"Sweet Sans Pro";src:url(data:font/otf;base64,{b64(B / "fonts/SweetSansPro-Regular.otf")}) format("opentype");font-weight:400;font-style:normal;font-display:swap}}
@font-face{{font-family:"Canela Sub";src:url(data:font/woff2;base64,{b64(B / "fonts/marcellus-latin-400-normal.woff2")}) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}}'''

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Travel eSIM prototype</title>
<style>
{fonts}
{(B / 'styles.css').read_text()}
</style>
</head>
<body>
<header class="site-header" id="header"></header>
<main id="view"></main>
<footer class="site-footer" id="footer"></footer>
<div id="modal"></div>
<div id="chat"></div>
<script>
{flags_js}
{(B / 'map.js').read_text()}
{hero_js}
{data}
{(B / 'app.js').read_text()}
</script>
</body>
</html>
'''
out.write_text(html)
print('written', out, round(len(html) / 1024), 'KB')
