import type {
  DistributorRecord,
  DistributorUploadRow,
  DistributorUploadSummary,
} from '@/types/distributorUpload'

const distributorNames = [
  'Apex Pharma Distributors',
  'Nova Health Supply Co.',
  'Sunrise Medical Traders',
  'Metro Pharma Logistics',
  'Everest Distribution House',
]
const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Kolkata', 'Chennai']
const regions: DistributorUploadRow['region'][] = [
  'North',
  'South',
  'East',
  'West',
]

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

export function generateMockDistributorRows(fileName: string): {
  rows: DistributorUploadRow[]
  summary: DistributorUploadSummary
} {
  const seed = fileName.length + fileName.charCodeAt(0)
  const rowCount = 6 + (seed % 4)

  const rows: DistributorUploadRow[] = Array.from({ length: rowCount }).map(
    (_, index) => {
      const isDuplicate = index === 3
      const isInvalidGst = index === 5 % rowCount
      const isValid = !isDuplicate && !isInvalidGst

      return {
        id: `distributor-row-${index}`,
        distributorName: distributorNames[index % distributorNames.length]!,
        distributorCode: isDuplicate
          ? 'DIST-1002'
          : `DIST-${pad(1000 + index, 4)}`,
        contactPerson: `Contact Person ${index + 1}`,
        phone: `98${pad(10000000 + index * 137, 8)}`,
        email: `distributor${index + 1}@example.com`,
        city: cities[index % cities.length]!,
        region: regions[index % regions.length]!,
        gstNumber: isInvalidGst
          ? 'INVALIDGST123'
          : `27AAAPL${pad(1234 + index, 4)}C1ZV`,
        isValid,
        validationNote: isDuplicate
          ? 'Duplicate distributor code'
          : isInvalidGst
            ? 'Invalid GST format'
            : undefined,
      }
    },
  )

  const summary: DistributorUploadSummary = {
    totalRows: rows.length,
    validRows: rows.filter((r) => r.isValid).length,
    duplicateCodes: rows.filter(
      (r) => r.validationNote === 'Duplicate distributor code',
    ).length,
    invalidGst: rows.filter((r) => r.validationNote === 'Invalid GST format')
      .length,
  }

  return { rows, summary }
}

const seedNames = [
  'Apex Pharma Distributors',
  'Nova Health Supply Co.',
  'Sunrise Medical Traders',
  'Metro Pharma Logistics',
  'Everest Distribution House',
  'Care Plus Distributors',
  'National Health Supply Co.',
  'Prime Medical Distributors',
  'Wellness Trade Partners',
  'Horizon Pharma Network',
  'Unity Health Distributors',
  'Zenith Medical Supply',
]
const seedCities = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Pune',
  'Hyderabad',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Bhopal',
]
const seedRegions: DistributorRecord['region'][] = [
  'North',
  'South',
  'East',
  'West',
]
const seedContacts = [
  'Rohan Mehta',
  'Priya Sharma',
  'Arjun Nair',
  'Sneha Kulkarni',
  'Vikram Rao',
  'Anita Desai',
  'Karan Malhotra',
  'Divya Iyer',
  'Sameer Khan',
  'Neha Joshi',
  'Rahul Verma',
  'Pooja Reddy',
]

function buildSeedDistributor(index: number): DistributorRecord {
  const name = seedNames[index % seedNames.length]!
  const city = seedCities[index % seedCities.length]!
  const region = seedRegions[index % seedRegions.length]!
  const contact = seedContacts[index % seedContacts.length]!
  const code = `DIST-${pad(2000 + index, 4)}`
  return {
    id: `distributor-seed-${index}`,
    distributorName: name,
    distributorCode: code,
    contactPerson: contact,
    phone: `98${pad(20000000 + index * 211, 8)}`,
    email: `${contact.toLowerCase().replace(' ', '.')}@${name.toLowerCase().replace(/[^a-z]+/g, '')}.com`,
    city,
    region,
    gstNumber: `27AAAPL${pad(5000 + index, 4)}C1ZV`,
    address: `${100 + index}, Industrial Estate, ${city}, ${region} Zone`,
    status: index % 7 === 0 ? 'inactive' : 'active',
    uploadFile: 'seed-data',
    uploadedDate: `2026-0${1 + (index % 6)}-${pad(10 + (index % 18), 2)}`,
  }
}

// Distributor Upload listing is pre-seeded with sample records; uploads append more on top.
let uploadedDistributors: DistributorRecord[] = Array.from(
  { length: 12 },
  (_, i) => buildSeedDistributor(i),
)

export function getMockDistributors(): DistributorRecord[] {
  return uploadedDistributors
}

export function getDistributorById(id: string): DistributorRecord | undefined {
  return uploadedDistributors.find((d) => d.id === id)
}

export function addDistributors(
  rows: DistributorUploadRow[],
  uploadFileName: string,
): DistributorRecord[] {
  const today = new Date().toISOString().slice(0, 10)
  const records: DistributorRecord[] = rows
    .filter((row) => row.isValid)
    .map((row) => ({
      id: `distributor-${row.distributorCode}-${Date.now()}`,
      distributorName: row.distributorName,
      distributorCode: row.distributorCode,
      contactPerson: row.contactPerson,
      phone: row.phone,
      email: row.email,
      city: row.city,
      region: row.region,
      gstNumber: row.gstNumber,
      address: `${row.city}, ${row.region} Zone`,
      status: 'active',
      uploadFile: uploadFileName,
      uploadedDate: today,
    }))
  uploadedDistributors = [...records, ...uploadedDistributors]
  return records
}
