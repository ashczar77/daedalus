/**
 * Capture README screenshots + a short step-through GIF from the local dev server.
 * Usage: node scripts/capture-readme-media.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import { PNG } from 'pngjs'
import gifenc from 'gifenc'
const { GIFEncoder, quantize, applyPalette } = gifenc

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'docs', 'media')
const base = process.env.DAEDALUS_URL ?? 'http://localhost:5173'
const chrome =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await mkdir(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  args: ['--disable-gpu', '--no-sandbox'],
})

const page = await browser.newPage()

async function shot(name, url) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 })
  await sleep(700)
  const file = path.join(outDir, name)
  await page.screenshot({ path: file, type: 'png' })
  console.log('wrote', file)
}

await shot('catalog.png', `${base}/`)
await shot(
  'player-invert-tree.png',
  `${base}/problems/0226-invert-binary-tree`,
)
await shot('terminal-catalog.png', `${base}/terminal`)
await shot('terminal-lesson.png', `${base}/terminal/fund-pwd`)

// GIF: step a few beats on invert binary tree
await page.goto(`${base}/problems/0226-invert-binary-tree`, {
  waitUntil: 'networkidle0',
  timeout: 45000,
})
await sleep(900)

const frames = []
const take = async () => {
  const buf = await page.screenshot({ type: 'png' })
  frames.push(PNG.sync.read(buf))
}

await take()
for (let i = 0; i < 10; i++) {
  const clicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')]
    const next = buttons.find((b) => (b.textContent ?? '').trim() === 'Next')
    if (!next || next.disabled) return false
    next.click()
    return true
  })
  if (!clicked) break
  await sleep(380)
  await take()
}

const w = frames[0].width
const h = frames[0].height
const gif = GIFEncoder()
for (const frame of frames) {
  // pngjs data is RGBA
  const palette = quantize(frame.data, 256)
  const index = applyPalette(frame.data, palette)
  gif.writeFrame(index, w, h, { palette, delay: 45 })
}
gif.finish()
const gifPath = path.join(outDir, 'player-step-through.gif')
await writeFile(gifPath, Buffer.from(gif.bytes()))
console.log('wrote', gifPath, `(${frames.length} frames)`)

await browser.close()
