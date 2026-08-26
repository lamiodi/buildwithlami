import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

async function optimizeImages() {
  console.log('Optimizing images in public directory...');

  // 1. Hero Image (ChatGPT Image)
  const heroPng = path.join(publicDir, 'ChatGPT Image Aug 22, 2026, 06_24_14 PM.png');
  if (fs.existsSync(heroPng)) {
    console.log('Processing hero founder image...');
    await sharp(heroPng)
      .resize(800, 1200, { fit: 'cover' })
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(publicDir, 'eugene-hero.webp'));

    await sharp(heroPng)
      .resize(400, 600, { fit: 'cover' })
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(publicDir, 'eugene-hero-400.webp'));

    // Also overwrite/create optimized fallback WebP matching original name
    await sharp(heroPng)
      .resize(800, 1200, { fit: 'cover' })
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(publicDir, 'hero-founder.webp'));

    console.log('Hero images created: eugene-hero.webp, eugene-hero-400.webp');
  }

  // 2. About Image (Rectangle 50 (1).png)
  const aboutPng = path.join(publicDir, 'Rectangle 50 (1).png');
  if (fs.existsSync(aboutPng)) {
    console.log('Processing about founder image...');
    await sharp(aboutPng)
      .resize(800, 1000, { fit: 'cover' })
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(publicDir, 'about-founder.webp'));

    await sharp(aboutPng)
      .resize(800, 1000, { fit: 'cover' })
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(publicDir, 'Rectangle 50 (1).webp'));

    console.log('About images created: about-founder.webp, Rectangle 50 (1).webp');
  }

  // 3. Drone Images
  const droneDir = path.join(publicDir, 'images', 'drone');
  if (fs.existsSync(droneDir)) {
    const droneFiles = fs.readdirSync(droneDir);
    for (const file of droneFiles) {
      if (file.endsWith('.jpg') || file.endsWith('.png')) {
        const inputPath = path.join(droneDir, file);
        const outputPath = path.join(droneDir, `${path.parse(file).name}.webp`);
        await sharp(inputPath)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toFile(outputPath);
        console.log(`Converted drone image: ${file} -> ${path.parse(file).name}.webp`);
      }
    }
  }

  // 4. Survey Images
  const surveyDir = path.join(publicDir, 'images', 'survey');
  if (fs.existsSync(surveyDir)) {
    const surveyFiles = fs.readdirSync(surveyDir);
    for (const file of surveyFiles) {
      if (file.endsWith('.jpg') || file.endsWith('.png')) {
        const inputPath = path.join(surveyDir, file);
        const outputPath = path.join(surveyDir, `${path.parse(file).name}.webp`);
        await sharp(inputPath)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toFile(outputPath);
        console.log(`Converted survey image: ${file} -> ${path.parse(file).name}.webp`);
      }
    }
  }

  console.log('Image optimization finished successfully!');
}

optimizeImages().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});
