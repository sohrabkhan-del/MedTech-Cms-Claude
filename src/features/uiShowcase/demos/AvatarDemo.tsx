import { Avatar, Stack } from '@mui/material'
import { AvatarUpload } from '@/components/common/AvatarUpload/AvatarUpload'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Avatar } from '@mui/material'

<Avatar sx={{ width: 40, height: 40 }}>SK</Avatar>

// Editable upload variant used on the Profile page
import { AvatarUpload } from '@/components/common/AvatarUpload/AvatarUpload'
<AvatarUpload imageUrl={user.avatarUrl} fallbackText={user.avatarInitial} onChange={handleAvatarChange} />`

export function AvatarDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Sizes" description="Raw MUI Avatar, sized via sx — used in headers and user footer cards.">
        <DemoLabel label="24px">
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>SK</Avatar>
        </DemoLabel>
        <DemoLabel label="32px">
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>SK</Avatar>
        </DemoLabel>
        <DemoLabel label="40px (default)">
          <Avatar>SK</Avatar>
        </DemoLabel>
        <DemoLabel label="64px">
          <Avatar sx={{ width: 64, height: 64, fontSize: '1.5rem' }}>SK</Avatar>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Editable (AvatarUpload)" description="Upload-capable avatar used on the Profile Settings page.">
        <AvatarUpload fallbackText="SK" onChange={() => {}} />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props — AvatarUpload">
        <PropsTable
          rows={[
            { name: 'imageUrl', type: 'string' },
            { name: 'fallbackText', type: 'string', description: 'Initials shown when no image is set.' },
            { name: 'size', type: 'number', default: '96' },
            { name: 'onChange', type: '(dataUrl: string) => void' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
