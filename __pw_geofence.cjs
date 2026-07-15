const { chromium } = require('playwright')

const OUT = '/private/tmp/claude-502/-Users-DigitalSalt-Projects-Medtech-Cms-Claude/cd210774-582a-4e03-aff6-6e177d9a67b0/scratchpad'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1500, height: 1300 } })
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(String(err)))

  // Security Alerts
  await page.goto('http://localhost:5183/field-operations/security-alerts', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/sec-tab1.png`, fullPage: true })
  await page.click('table tbody tr:first-child td:nth-child(4) p')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/sec-tab2.png`, fullPage: true })

  // Geo Fence List
  await page.goto('http://localhost:5183/field-operations/geo-fence-management', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/geofence-list.png`, fullPage: true })

  // Geo Fence Details
  await page.click('table tbody tr:first-child td:nth-child(2) p')
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/geofence-details.png`, fullPage: true })

  // Geo Fence Create
  await page.goto('http://localhost:5183/field-operations/geo-fence-management/new', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/geofence-create.png`, fullPage: true })

  console.log('Console errors:', JSON.stringify(consoleErrors, null, 2))
  await browser.close()
}

main()
