#!/usr/bin/env node
/**
 * generate-png.mjs - PWA 图标生成脚本
 *
 * 阶段 8 Round 1 修复：从 icon.svg 生成所有需要的 PNG 文件
 *
 * 用法：
 *   1. 安装依赖：pnpm add -D sharp
 *   2. 运行：node public/icons/generate-png.mjs
 *   3. 输出：public/icons/*.png + favicon.ico
 *
 * 输出清单：
 *   - favicon.ico              (32x32)
 *   - apple-touch-icon.png     (180x180)
 *   - icon-72x72.png           (72x72)
 *   - icon-96x96.png           (96x96)
 *   - icon-128x128.png         (128x128)
 *   - icon-144x144.png         (144x144)
 *   - icon-152x152.png         (152x152)
 *   - icon-192x192.png         (192x192, manifest)
 *   - icon-384x384.png         (384x384)
 *   - icon-512x512.png         (512x512, manifest)
 *   - icon-maskable-512x512.png (512x512, manifest, maskable)
 *   - og-image.png             (1200x630, 社交分享)
 *
 * 注意：
 *   - 本脚本依赖 sharp 库，需要先安装
 *   - 输出 PNG 会覆盖同名文件
 *   - 设计师可替换 icon.svg 后重新运行
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SVG_PATH = path.join(__dirname, 'icon.svg')
const OG_SVG_PATH = path.join(__dirname, 'og-image.svg')

const SIZES = [
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

async function generate() {
  console.log('🎨 开始生成 PWA 图标...')
  const svgBuffer = await fs.readFile(SVG_PATH)

  // 生成所有 PNG
  for (const { name, size } of SIZES) {
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(__dirname, name))
    console.log(`  ✅ ${name} (${size}x${size})`)
  }

  // maskable：safe area 占 80%，背景填品牌色
  const maskable = await sharp(svgBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 182, b: 193, alpha: 1 } })
    .composite([
      {
        input: await sharp(svgBuffer).resize(410, 410, { fit: 'contain' }).toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(__dirname, 'icon-maskable-512x512.png'))
  console.log(`  ✅ icon-maskable-512x512.png (512x512, maskable)`)

  // favicon.ico
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFormat('ico')
    .toFile(path.join(__dirname, 'favicon.ico'))
  console.log(`  ✅ favicon.ico (32x32)`)

  // OG image（如果存在 og-image.svg）
  try {
    const ogSvg = await fs.readFile(OG_SVG_PATH)
    await sharp(ogSvg)
      .resize(1200, 630)
      .png()
      .toFile(path.join(__dirname, 'og-image.png'))
    console.log(`  ✅ og-image.png (1200x630)`)
  } catch (e) {
    console.log(`  ⚠️ 跳过 og-image.png（需要 og-image.svg）`)
  }

  console.log('\n🎉 全部完成！')
}

generate().catch((err) => {
  console.error('❌ 生成失败：', err)
  process.exit(1)
})