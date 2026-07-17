import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Grid, MenuItem, Stack, Typography, Button } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { giftRuleFormDefaults, giftRuleFormSchema, type GiftRuleFormValues } from '@/features/schemes/giftRuleFormSchema'
import { getRewardRuleById, ruleTypeOptions, schemeNameOptions } from '@/features/schemes/mockGiftRules'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2.5,
}

const fieldLabelProps = {
  slotProps: { inputLabel: { shrink: false, sx: { display: 'none' } } },
} as const

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'primary.main', mb: 0.75 }}>
      {children}
      {required ? ' *' : ''}
    </Typography>
  )
}

export function GiftRuleFormPage() {
  const navigate = useNavigate()
  const { ruleId } = useParams<{ ruleId: string }>()
  const isEdit = !!ruleId
  const rule = isEdit ? getRewardRuleById(ruleId) : undefined

  const { control, handleSubmit, watch } = useForm<GiftRuleFormValues>({
    resolver: zodResolver(giftRuleFormSchema),
    defaultValues: rule
      ? {
          rewardName: rule.rewardName,
          rewardTrack: rule.rewardTrack,
          ruleType: rule.ruleType,
          coinsRequired: String(rule.coinsRequired),
          rewardIcon: rule.rewardIcon,
          availabilityStatus: rule.availabilityStatus === 'expired' ? 'unavailable' : rule.availabilityStatus,
          schemeName: rule.activeScheme ?? '',
        }
      : giftRuleFormDefaults,
  })

  const rewardTrack = watch('rewardTrack')

  if (isEdit && !rule) {
    return (
      <EmptyState
        title="Reward rule not found"
        description="This reward rule may have been removed."
        actionLabel="Back to Gift Rules"
        onAction={() => navigate('/scheme-management/gift-rules')}
      />
    )
  }

  const backTo = isEdit ? `/scheme-management/gift-rules/${ruleId}` : '/scheme-management/gift-rules'

  const submit = handleSubmit(() => {
    navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Reward Rule' : 'Create Reward Rule'}</Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Reward Configuration</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Reward Name</FieldLabel>
              <FormField name="rewardName" control={control} placeholder="e.g. Gold Coin Reward" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Reward Icon</FieldLabel>
              <FormField name="rewardIcon" control={control} placeholder="e.g. 🏆" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Reward Track</FieldLabel>
              <FormField name="rewardTrack" control={control} select {...fieldLabelProps}>
                <MenuItem value="Permanent Catalog">Permanent Catalog</MenuItem>
                <MenuItem value="Scheme Track">Scheme Track</MenuItem>
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Rule Type</FieldLabel>
              <FormField name="ruleType" control={control} select {...fieldLabelProps}>
                {ruleTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Coins Required</FieldLabel>
              <FormField name="coinsRequired" control={control} placeholder="e.g. 2500" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Availability</FieldLabel>
              <FormField name="availabilityStatus" control={control} select {...fieldLabelProps}>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </FormField>
            </Grid>
            {rewardTrack === 'Scheme Track' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel required>Scheme Name</FieldLabel>
                <FormField name="schemeName" control={control} select {...fieldLabelProps}>
                  {schemeNameOptions.map((scheme) => (
                    <MenuItem key={scheme} value={scheme}>
                      {scheme}
                    </MenuItem>
                  ))}
                </FormField>
              </Grid>
            )}
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Create Reward Rule'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
