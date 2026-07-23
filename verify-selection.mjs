import { chromium } from 'playwright'

const shots = '/private/tmp/claude-502/-Users-DigitalSalt-Projects-Medtech-Cms-Claude/14f18ee1-b538-4755-b89a-970fc7eeeacc/scratchpad'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 500 } })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
page.on('pageerror', (err) => errors.push(String(err.stack || err)))

await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15000 })
await page.fill('input[type="email"], input[name="email"]', 'superadmin@medtech.in')
await page.fill('input[type="password"], input[name="password"]', 'test@123')
await page.click('button[type="submit"]')
await page.waitForURL('**/dashboard', { timeout: 15000 })
await page.waitForTimeout(1000)

// Select the greeting text by triple-clicking it (selects the whole line)
const greeting = page.locator('text=/Good (morning|afternoon|evening), Suryakant/')
await greeting.click({ clickCount: 3 })
await page.waitForTimeout(300)
await page.screenshot({ path: `${shots}/welcome-banner-selection.png`, clip: { x: 0, y: 90, width: 900, height: 260 } })

await browser.close()
console.log('--- CONSOLE ERRORS ---')
console.log(errors.length ? errors.join('\n') : '(none)')
