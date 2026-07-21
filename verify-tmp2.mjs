import { chromium } from 'playwright'
const base = 'http://localhost:5198'
const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.fill('input[name="email"], input[type="email"]', 'superadmin@medtech.in')
await page.fill('input[name="password"], input[type="password"]', 'test@123')
await page.click('button[type="submit"]')
await page.waitForTimeout(1000)

await page.goto(`${base}/partners/dealers`, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await page.screenshot({ path: '/private/tmp/claude-502/-Users-DigitalSalt-Projects-Medtech-Cms-Claude/cd210774-582a-4e03-aff6-6e177d9a67b0/scratchpad/boneyard-loading-state.png', fullPage: false })

console.log('ERRORS:', JSON.stringify(errors))
await browser.close()
