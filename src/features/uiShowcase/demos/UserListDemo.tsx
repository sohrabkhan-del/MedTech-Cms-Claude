import { Avatar, Chip, Stack, Typography } from '@mui/material'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge, type BadgeStatus } from '@/components/common/StatusBadge/StatusBadge'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { CommonTable } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'

<CommonTable
  tableKey="ui-showcase-users"
  rows={users}
  getRowId={(u) => u.id}
  searchKeys={(u) => \`\${u.name} \${u.role}\`}
  columns={[
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32 }}>{u.name[0]}</Avatar>
          <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
        </Stack>
      ),
    },
    { key: 'role', header: 'Role', render: (u) => <Chip label={u.role} size="small" /> },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.status} /> },
  ]}
/>`

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  status: BadgeStatus
}

const users: DemoUser[] = [
  { id: '1', name: 'Aisha Khan', email: 'aisha.khan@medtech.in', role: 'Super Admin', status: 'active' },
  { id: '2', name: 'Rohan Mehta', email: 'rohan.mehta@medtech.in', role: 'Region Manager', status: 'active' },
  { id: '3', name: 'Priya Nair', email: 'priya.nair@medtech.in', role: 'Medical Rep', status: 'pending' },
  { id: '4', name: 'Vikram Singh', email: 'vikram.singh@medtech.in', role: 'Medical Rep', status: 'inactive' },
  { id: '5', name: 'Neha Verma', email: 'neha.verma@medtech.in', role: 'Admin', status: 'active' },
  { id: '6', name: 'Karan Joshi', email: 'karan.joshi@medtech.in', role: 'Region Manager', status: 'rejected' },
]

const columns: CommonTableColumn<DemoUser>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    sortValue: (u) => u.name,
    render: (u) => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8125rem' }}>
          {u.name.slice(0, 1)}
        </Avatar>
        <Stack>
          <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{u.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {u.email}
          </Typography>
        </Stack>
      </Stack>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    sortValue: (u) => u.role,
    render: (u) => <Chip label={u.role} size="small" variant="outlined" />,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    sortValue: (u) => u.status,
    render: (u) => <StatusBadge status={u.status} />,
  },
]

export function UserListDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection
        title="User list with search"
        description="CommonTable — the same avatar+name pattern used in DealerListPage/AdminListPage, plus a Role column and StatusBadge, with the built-in search box filtering by name/role."
      >
        <CommonTable
          tableKey="ui-showcase-users"
          columns={columns}
          rows={users}
          getRowId={(u) => u.id}
          searchPlaceholder="Search users..."
          searchKeys={(u) => `${u.name} ${u.role} ${u.status}`}
          rowsPerPageOptions={[5, 10]}
        />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset) — CommonTable">
        <PropsTable
          rows={[
            { name: 'tableKey', type: 'string', description: 'Unique key for persisting column-visibility prefs.' },
            { name: 'columns', type: 'CommonTableColumn<T>[]' },
            { name: 'rows', type: 'T[]' },
            { name: 'getRowId', type: '(row: T) => string' },
            { name: 'searchKeys', type: '(row: T) => string', description: 'String the built-in search box matches against.' },
            { name: 'loading', type: 'boolean', default: 'false' },
            { name: 'actions', type: 'CommonTableAction<T>[]', description: 'Per-row kebab menu actions.' },
            { name: 'createAction', type: '{ label: string; to: string }' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
