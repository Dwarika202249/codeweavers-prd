# PWA Icons

This folder contains the app icons for the Progressive Web App.

## Generating PNG Icons

The SVG icon (`icon.svg`) is the source file. To generate PNG icons at various sizes, you can use a tool like:

### Option 1: Using sharp (Node.js)
```bash
npm install sharp
```

```javascript
const sharp = require('sharp');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  sharp('icon.svg')
    .resize(size, size)
    .png()
    .toFile(`icon-${size}x${size}.png`);
});
```

### Option 2: Using ImageMagick
```bash
for size in 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

### Option 3: Online Tools
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://pwa-asset-generator.nicedoc.io/)

## Required Sizes

| Size | Purpose |
|------|---------|
| 72x72 | Android Chrome M36-M38 |
| 96x96 | Shortcuts, Android Chrome M39+ |
| 128x128 | Chrome Web Store |
| 144x144 | Windows 10 tiles |
| 152x152 | iOS Safari |
| 192x192 | Android Chrome homescreen |
| 384x384 | Chrome splash screen |
| 512x512 | Chrome splash screen (HD) |

## Maskable Icons

For best results on Android, icons should have a "safe zone" - the main content should fit within the center 80% of the icon to avoid being clipped by various device shapes.
