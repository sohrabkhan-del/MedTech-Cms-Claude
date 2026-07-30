import type { ScanRow } from '@/types/masterScanTable'

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

const CATEGORIES = ['Analgesics', 'Antibiotics', 'Cardiac Care', 'Vitamins']
const PRODUCTS: Record<string, { id: string; name: string }[]> = {
  Analgesics: [
    { id: 'PRD-1001', name: 'Painex 500mg' },
    { id: 'PRD-1002', name: 'Relidol Forte' },
  ],
  Antibiotics: [
    { id: 'PRD-2001', name: 'Amoxiclin 250mg' },
    { id: 'PRD-2002', name: 'Cefzin XR' },
  ],
  'Cardiac Care': [{ id: 'PRD-3001', name: 'Cardiostat 10mg' }],
  Vitamins: [
    { id: 'PRD-4001', name: 'Vitalux D3' },
    { id: 'PRD-4002', name: 'B-Complex Plus' },
  ],
}

const DISTRIBUTORS = ['Apex Distributors', 'Meridian Pharma Supply', 'Northgate Traders']
const DEALERS_BY_DISTRIBUTOR: Record<string, string[]> = {
  'Apex Distributors': ['Sunrise Medical Agency', 'Greenline Pharma Dealers'],
  'Meridian Pharma Supply': ['Capital Health Traders'],
  'Northgate Traders': ['Riverside Pharma Dealers', 'Hillview Medical Supply'],
}
const CHEMISTS_BY_DEALER: Record<string, string[]> = {
  'Sunrise Medical Agency': ['City Care Pharmacy', 'Wellness Point Chemist'],
  'Greenline Pharma Dealers': ['MedPlus Junction'],
  'Capital Health Traders': ['Capital Chemist', 'Downtown Drug Store'],
  'Riverside Pharma Dealers': ['Riverside Chemist'],
  'Hillview Medical Supply': ['Hillview Pharmacy', 'Northside Chemist'],
}

/**
 * Generates a deterministic flat Master Scan Table dataset — one row per scanned unit —
 * for demoing/testing ScanTreeTable without wiring a real API.
 */
export function generateMockScanRows(invoiceCount = 6): ScanRow[] {
  const rows: ScanRow[] = []
  let seed = 1
  let unitSeq = 0

  for (let inv = 0; inv < invoiceCount; inv++) {
    const invoiceNo = `INV-2026-${pad(1000 + inv * 7)}`
    const distributor = DISTRIBUTORS[inv % DISTRIBUTORS.length]!
    const dealers = DEALERS_BY_DISTRIBUTOR[distributor]!
    const dealerCountForInvoice = seededNumber(seed++, 1, dealers.length + 1)

    for (let d = 0; d < dealerCountForInvoice; d++) {
      const dealer = dealers[d % dealers.length]!
      const chemists = CHEMISTS_BY_DEALER[dealer]!
      const chemistCount = seededNumber(seed++, 1, chemists.length + 1)

      for (let c = 0; c < chemistCount; c++) {
        const chemist = chemists[c % chemists.length]!
        const categoryCount = seededNumber(seed++, 1, CATEGORIES.length + 1)

        for (let cat = 0; cat < categoryCount; cat++) {
          const category = CATEGORIES[cat % CATEGORIES.length]!
          const products = PRODUCTS[category]!
          const productCount = seededNumber(seed++, 1, products.length + 1)

          for (let p = 0; p < productCount; p++) {
            const product = products[p % products.length]!
            const batchCount = seededNumber(seed++, 1, 3)

            for (let b = 0; b < batchCount; b++) {
              const batchId = `BATCH-${product.id.slice(4)}-${pad(b + 1)}`
              const containerCount = seededNumber(seed++, 1, 4)

              for (let ct = 0; ct < containerCount; ct++) {
                const containerId = `CTR-${batchId.slice(6)}-${pad(ct + 1)}`
                const unitCount = seededNumber(seed++, 3, 12)

                for (let u = 0; u < unitCount; u++) {
                  unitSeq += 1
                  rows.push({
                    category,
                    productId: product.id,
                    productName: product.name,
                    batchId,
                    containerId,
                    productUid: `UID-${containerId.slice(4)}-${pad(unitSeq, 6)}`,
                    invoiceNo,
                    distributor,
                    dealer,
                    chemist,
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  return rows
}
