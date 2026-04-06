/**
 * WX ARENA Auto-Setup Script
 * Runs automatically during build/deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 WX ARENA Auto-Setup Starting...');

// 1. Copy service worker template to public
const swSource = path.join(process.cwd(), 'lib', 'sw-template.js');
const swDest = path.join(process.cwd(), 'public', 'sw.js');

if (fs.existsSync(swSource)) {
  if (!fs.existsSync(swDest)) {
    fs.copyFileSync(swSource, swDest);
    console.log('✅ Service worker copied to public/sw.js');
  } else {
    console.log('ℹ️ Service worker already exists');
  }
} else {
  console.warn('⚠️ Service worker template not found');
}

// 2. Create .env.local if missing (from example)
const envExample = path.join(process.cwd(), '.env.local.example');
const envLocal = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envExample) && !fs.existsSync(envLocal)) {
  if (!process.env.VERCEL && !process.env.NETLIFY) {
    console.warn('⚠️ .env.local not found. Copy from .env.local.example');
  }
}

// 3. Verify Supabase env vars
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missing = requiredEnvVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  
  if (process.env.VERCEL || process.env.NETLIFY) {
    console.error('\n🛑 Build will fail without these variables!');
    process.exit(1);
  }
}

// 4. Create placeholder icons if missing
const iconsDir = path.join(process.cwd(), 'public', 'icons');
const requiredIcons = ['icon-192x192.png', 'icon-512x512.png'];

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('📁 Created icons directory');
}

// Check for missing icons
const missingIcons = requiredIcons.filter(icon => 
  !fs.existsSync(path.join(iconsDir, icon))
);

if (missingIcons.length > 0) {
  console.warn('⚠️ Missing PWA icons:', missingIcons.join(', '));
  console.warn('   Add icon files to public/icons/ for PWA to work properly');
}

// 5. Verify build configuration
const nextConfig = path.join(process.cwd(), 'next.config.ts');
if (!fs.existsSync(nextConfig)) {
  console.warn('⚠️ next.config.ts not found');
}

console.log('✅ Auto-Setup Complete!');

// Export status for build process
module.exports = { success: true, missingIcons, missingEnvVars: missing };
