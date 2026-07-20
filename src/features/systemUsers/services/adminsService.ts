import { mockAdmins, getAdminById, adminKpis } from '@/features/systemUsers/mockAdmins'
import type { Admin, AdminFormValues, AdminStatus } from '@/features/systemUsers/types/systemUsers.types'

// TODO: replace mock-backed implementations with apiClient calls once the
// admin management API is available. create/update/setStatus/deleteAdmin are
// currently no-ops resolving immediately so the UI/hook contract is stable
// ahead of time.

async function getAdmins(): Promise<Admin[]> {
  return Promise.resolve(mockAdmins)
}

async function getAdminDetail(id: string): Promise<Admin | undefined> {
  return Promise.resolve(getAdminById(id))
}

async function getAdminKpis() {
  return Promise.resolve(adminKpis)
}

async function getAdminFormOptions() {
  return Promise.resolve({
    regionOptions: ['Pan India', 'North', 'South', 'East', 'West'] as Admin['regionAccess'][],
    roleOptions: ['Super Admin', 'Admin'] as Admin['role'][],
    statusOptions: ['active', 'pending', 'inactive'] as Admin['status'][],
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function createAdmin(_values: AdminFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function updateAdmin(_id: string, _values: AdminFormValues): Promise<void> {
  return Promise.resolve()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params document the future real contract
async function setAdminStatus(_id: string, _status: AdminStatus): Promise<void> {
  return Promise.resolve()
}

export const adminsService = {
  getAdmins,
  getAdminDetail,
  getAdminKpis,
  getAdminFormOptions,
  createAdmin,
  updateAdmin,
  setAdminStatus,
}
