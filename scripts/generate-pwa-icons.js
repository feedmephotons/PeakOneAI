/**
 * PWA Icon Generator Script
 *
 * This script generates PWA icons from SVG templates.
 * Run: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template for the mountain/peak icon
const generateIconSvg = (size, maskable = false) => {
  const padding = maskable ? size * 0.15 : 0;
  const innerSize = size - (padding * 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#grad)"/>
  <g transform="translate(${padding + innerSize * 0.15}, ${padding + innerSize * 0.15})">
    <path
      d="M${innerSize * 0.35} ${innerSize * 0.1} L${innerSize * 0.65} ${innerSize * 0.6} L${innerSize * 0.5} ${innerSize * 0.6} L${innerSize * 0.35} ${innerSize * 0.35} L${innerSize * 0.2} ${innerSize * 0.6} L${innerSize * 0.05} ${innerSize * 0.6} Z"
      fill="white"
    />
  </g>
</svg>`;
};

// Shortcut icon templates
const shortcutIcons = {
  messages: (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#10b981"/>
    <g transform="translate(${size * 0.25}, ${size * 0.25})">
      <path d="M0 ${size * 0.05} a${size * 0.05} ${size * 0.05} 0 0 1 ${size * 0.05} -${size * 0.05} h${size * 0.4} a${size * 0.05} ${size * 0.05} 0 0 1 ${size * 0.05} ${size * 0.05} v${size * 0.25} a${size * 0.05} ${size * 0.05} 0 0 1 -${size * 0.05} ${size * 0.05} h-${size * 0.25} l-${size * 0.1} ${size * 0.1} v-${size * 0.1} h-${size * 0.05} a${size * 0.05} ${size * 0.05} 0 0 1 -${size * 0.05} -${size * 0.05} z" fill="white"/>
    </g>
  </svg>`,
  video: (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#8b5cf6"/>
    <g transform="translate(${size * 0.2}, ${size * 0.3})">
      <rect width="${size * 0.35}" height="${size * 0.4}" rx="${size * 0.05}" fill="white"/>
      <path d="M${size * 0.4} ${size * 0.05} l${size * 0.2} -${size * 0.1} v${size * 0.5} l-${size * 0.2} -${size * 0.1} z" fill="white"/>
    </g>
  </svg>`,
  tasks: (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#f59e0b"/>
    <g transform="translate(${size * 0.25}, ${size * 0.25})">
      <rect width="${size * 0.5}" height="${size * 0.5}" rx="${size * 0.08}" fill="white"/>
      <path d="M${size * 0.1} ${size * 0.25} l${size * 0.1} ${size * 0.1} l${size * 0.2} -${size * 0.2}" stroke="#f59e0b" stroke-width="${size * 0.06}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`,
  ai: (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="aigrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ec4899"/>
        <stop offset="100%" style="stop-color:#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#aigrad)"/>
    <g transform="translate(${size * 0.2}, ${size * 0.2})">
      <path d="M${size * 0.3} ${size * 0.05} l${size * 0.05} ${size * 0.15} l${size * 0.15} ${size * 0.05} l-${size * 0.15} ${size * 0.05} l-${size * 0.05} ${size * 0.15} l-${size * 0.05} -${size * 0.15} l-${size * 0.15} -${size * 0.05} l${size * 0.15} -${size * 0.05} z" fill="white"/>
      <circle cx="${size * 0.15}" cy="${size * 0.45}" r="${size * 0.06}" fill="white"/>
      <circle cx="${size * 0.45}" cy="${size * 0.45}" r="${size * 0.06}" fill="white"/>
    </g>
  </svg>`
};

const outputDir = path.join(__dirname, '../public/icons/pwa');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Generate main icons
  for (const size of ICON_SIZES) {
    const svg = generateIconSvg(size, false);
    const pngPath = path.join(outputDir, `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(pngPath);

    console.log(`Generated icon-${size}.png`);
  }

  // Generate maskable icons
  for (const size of [192, 512]) {
    const svg = generateIconSvg(size, true);
    const pngPath = path.join(outputDir, `maskable-icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(pngPath);

    console.log(`Generated maskable-icon-${size}.png`);
  }

  // Generate shortcut icons
  for (const [name, generator] of Object.entries(shortcutIcons)) {
    const svg = generator(96);
    const pngPath = path.join(outputDir, `shortcut-${name}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(pngPath);

    console.log(`Generated shortcut-${name}.png`);
  }

  // Generate badge icon
  const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
    <circle cx="36" cy="36" r="36" fill="#8b5cf6"/>
    <path d="M36 18 L52 54 L44 54 L36 38 L28 54 L20 54 Z" fill="white"/>
  </svg>`;

  await sharp(Buffer.from(badgeSvg))
    .png()
    .toFile(path.join(outputDir, 'badge-72.png'));

  console.log('Generated badge-72.png');

  console.log('\n✅ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
