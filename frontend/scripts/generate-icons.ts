/**
 * PWA Icon Generator Script
 * 
 * This script generates PNG icons from the SVG source for PWA manifest.
 * 
 * Prerequisites:
 *   npm install sharp --save-dev
 * 
 * Usage:
 *   npx tsx scripts/generate-icons.ts
 * 
 * Or add to package.json scripts:
 *   "build:icons": "npx tsx scripts/generate-icons.ts"
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
const SVG_SOURCE = path.join(ICONS_DIR, 'icon.svg');

async function generateIcons() {
  // Check if sharp is installed
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('⚠️  Sharp not installed. Installing...');
    console.log('Run: npm install sharp --save-dev');
    console.log('\nAlternatively, you can use online tools to convert SVG to PNG:');
    console.log('- https://cloudconvert.com/svg-to-png');
    console.log('- https://svgtopng.com/');
    console.log('\nRequired sizes:', ICON_SIZES.join(', '));
    return;
  }

  // Read SVG source
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error('❌ SVG source not found:', SVG_SOURCE);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_SOURCE);

  console.log('🎨 Generating PWA icons from SVG...\n');

  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error);
    }
  }

  // Also generate apple-touch-icon (180x180)
  const appleTouchIconPath = path.join(process.cwd(), 'public', 'apple-touch-icon.png');
  try {
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(appleTouchIconPath);
    console.log(`✅ Generated: apple-touch-icon.png (180x180)`);
  } catch (error) {
    console.error('❌ Failed to generate apple-touch-icon:', error);
  }

  // Generate favicon.ico (32x32)
  const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
  try {
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    console.log(`✅ Generated: favicon.png (32x32)`);
    console.log('   Note: Rename to favicon.ico or use PNG directly');
  } catch (error) {
    console.error('❌ Failed to generate favicon:', error);
  }

  // Generate OG image (1200x630)
  const ogImagePath = path.join(process.cwd(), 'public', 'og-image.png');
  try {
    // Create a larger canvas for OG image with text
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 10, g: 10, b: 15, alpha: 1 }
      }
    })
    .composite([
      {
        input: await sharp(svgBuffer).resize(200, 200).png().toBuffer(),
        top: 215,
        left: 100
      }
    ])
    .png()
    .toFile(ogImagePath);
    console.log(`✅ Generated: og-image.png (1200x630)`);
    console.log('   Note: Consider adding text overlay manually for better social sharing');
  } catch (error) {
    console.error('❌ Failed to generate OG image:', error);
  }

  console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);
