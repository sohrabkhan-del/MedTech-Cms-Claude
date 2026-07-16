import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:5174'
const shotDir = '/private/tmp/claude-502/-Users-DigitalSalt-Projects-Medtech-Cms-Claude/dda37358-1ca7-4fc3-9620-b949a6aa47b4/scratchpad/shots'
fs.mkdirSync(shotDir, { recursive: true })

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } })
const errors = []
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[${page.url()}] ${msg.text()}`) })
page.on('pageerror', (err) => errors.push(`[${page.url()}] ${String(err)}`))

async function shot(name, fullPage = true) {
  await page.screenshot({ path: `${shotDir}/${name}.png`, fullPage })
  console.log('SHOT', name)
}

// 1. Dealer details
await page.goto(`${BASE}/partners/dealers/dealer-1`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Scan History', { timeout: 15000 })
await shot('final-dealer-details')

// 2. Chemist details
await page.goto(`${BASE}/partners/chemists/chemist-1`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Scan History', { timeout: 15000 })
await shot('final-chemist-details')

// 3. GeoFence details
await page.goto(`${BASE}/field-operations/geo-fence-management`, { waitUntil: 'networkidle' })
await page.waitForSelector('table tbody tr', { timeout: 15000 })
await page.locator('table tbody tr').first().locator('td').nth(1).locator('p, span').first().click()
await page.waitForSelector('text=Verification History', { timeout: 15000 })
await shot('final-geofence-details')

// 4. Approval request details
await page.goto(`${BASE}/verification/approval-requests`, { waitUntil: 'networkidle' })
await page.waitForSelector('table tbody tr', { timeout: 15000 })
await page.locator('table tbody tr').first().locator('td').nth(1).locator('p').first().click()
await page.waitForSelector('text=Verification Documents', { timeout: 15000 })
await shot('final-approval-request-details')

// 5. Rejected request details
await page.goto(`${BASE}/verification/rejected-requests`, { waitUntil: 'networkidle' })
await page.waitForSelector('table tbody tr', { timeout: 15000 })
await page.locator('table tbody tr').first().locator('td').nth(1).locator('p').first().click()
await page.waitForSelector('text=Supporting Documents', { timeout: 15000 })
await shot('final-rejected-request-details')

// 6. Security Alerts user details tab
await page.goto(`${BASE}/field-operations/security-alerts`, { waitUntil: 'networkidle' })
await page.waitForSelector('table tbody tr', { timeout: 15000 })
await page.locator('table tbody tr').first().locator('td').nth(3).locator('p').first().click()
await page.waitForSelector('text=Security Alert History', { timeout: 15000 })
await shot('final-security-alert-user-details')

// 7. Live Scan Feed user details tab
await page.goto(`${BASE}/field-operations/live-scan-feed`, { waitUntil: 'networkidle' })
await page.waitForSelector('table tbody tr', { timeout: 15000 })
await page.locator('table tbody tr').first().locator('td').nth(1).locator('p').first().click()
await page.waitForSelector('text=Scan History', { timeout: 15000 })
await shot('final-livescan-user-details')

console.log('CONSOLE_ERRORS', JSON.stringify(errors, null, 2))
await browser.close()
