import { useEffect, useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Plus } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { Modal } from '@/components/common/Modal/Modal'
import { radius } from '@/theme/tokens'
import { useToast } from '@/contexts/ToastContext'
import { useGiftForm } from '@/features/schemeManagement/hooks/useGiftForm'
import { useCreateRewardCategoryMutation } from '@/features/schemeManagement/services/giftsApi'
import {
  giftFormDefaults,
  giftFormSchema,
  type GiftFormValues,
} from '@/features/schemeManagement/types/schemeManagement.types'
import type { GiftPartnerType } from '@/types/gift'

const ALL_PARTNER_TYPES: GiftPartnerType[] = ['Dealer', 'Chemist']
const ALL_REGIONS = ['East', 'West', 'North', 'South']

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

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'primary.main',
        mb: 0.75,
      }}
    >
      {children}
      {required ? ' *' : ''}
    </Typography>
  )
}

// file upload helpers (uses presigned URL + PUT)
import {
  uploadPartnerFile,
  deletePartnerFile,
} from '@/features/userManagement/services/fileUploadService'

export function GiftFormPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { giftId } = useParams<{ giftId: string }>()
  const { isEdit, gift, options, isLoading, isSubmitting, submit } =
    useGiftForm(giftId)
  const [createRewardCategory, { isLoading: isCreatingCategory }] =
    useCreateRewardCategoryMutation()

  const { control, handleSubmit, watch, reset, setValue } =
    useForm<GiftFormValues>({
      resolver: zodResolver(giftFormSchema),
      defaultValues: giftFormDefaults,
    })

  const imageUrl = watch('giftImage')
  const [customCategories, setCustomCategories] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const categoryOptions = [
    ...(options?.giftCategorySelectOptions ?? []),
    ...customCategories,
  ]
  const regionChoices =
    options?.regionOptions.filter((region) =>
      ['East', 'West', 'North', 'South'].includes(region.name),
    ) ?? []

  useEffect(() => {
    if (!gift) return
    reset({
      giftName: gift.giftName,
      category: gift.categoryId ?? gift.category,
      brand: gift.brand,
      giftImage: gift.giftImage,
      description: gift.description,
      price: gift.price ? String(gift.price) : '',

      requiredPoints: String(gift.requiredPoints),
      availableQuantity: String(gift.availableQuantity),
      status: gift.status,
      eligibleUserType: gift.eligibleUserType,
      partnerTypes: gift.partnerTypes,
      dealerRegions: gift.dealerRegionIds ?? gift.dealerRegions,
      chemistRegions: gift.chemistRegionIds ?? gift.chemistRegions,
      dealerBasePoints:
        gift.dealerBasePoints === null ? '' : String(gift.dealerBasePoints),
      chemistBasePoints:
        gift.chemistBasePoints === null ? '' : String(gift.chemistBasePoints),
    })
  }, [gift, reset])

  const [uploading, setUploading] = useState(false)
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null)

  if (isEdit && !isLoading && !gift) {
    return (
      <EmptyState
        title="Gift not found"
        description="This gift may have been removed."
        actionLabel="Back to Gift Catalogue"
        onAction={() => navigate('/scheme-management/gift-catalogue')}
      />
    )
  }

  const backTo = isEdit
    ? `/scheme-management/gift-catalogue/${giftId}`
    : '/scheme-management/gift-catalogue'

  const onSubmit = handleSubmit(
    async (values) => {
      const success = await submit(values)
      if (success) navigate(backTo)
    },
    () => {
      toast.error('Please complete the required gift fields.')
    },
  )

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    try {
      const category = await createRewardCategory(name).unwrap()
      setCustomCategories((prev) =>
        prev.some((option) => option.id === category.id)
          ? prev
          : [...prev, category],
      )
      setValue('category', category.id, { shouldValidate: true })
      setCategoryDialogOpen(false)
      toast.success('Reward category created successfully.')
    } catch {
      toast.error('Failed to create reward category.')
    }
  }

  return (
    <>
      <Stack sx={{ mb: 3 }}>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h1">
            {isEdit ? 'Edit Gift' : 'Create Gift'}
          </Typography>
        </Stack>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Gift Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Gift Name</FieldLabel>
              <FormField
                name="giftName"
                control={control}
                placeholder="e.g. Smart Watch"
                {...fieldLabelProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Category</FieldLabel>
              <Controller
                name="category"
                control={control}
                render={({ field, fieldState }) => (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'flex-center', width: '100%' }}
                  >
                    <Autocomplete
                      fullWidth
                      size="small"
                      options={categoryOptions}
                      value={
                        categoryOptions.find(
                          (option) => option.id === field.value,
                        ) ??
                        categoryOptions.find(
                          (option) => option.name === field.value,
                        ) ??
                        null
                      }
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      onChange={(_, selected) =>
                        field.onChange(selected?.id ?? '')
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search category…"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                    <Tooltip title="Add new category">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setNewCategoryName('')
                          setCategoryDialogOpen(true)
                        }}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: `${radius.md}px`,
                          mt: 0.25,
                          width: 40,
                        }}
                      >
                        <Plus size={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Brand</FieldLabel>
              <FormField
                name="brand"
                control={control}
                placeholder="e.g. Philips"
                {...fieldLabelProps}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Available Quantity</FieldLabel>
              <FormField
                name="availableQuantity"
                control={control}
                numeric
                placeholder="e.g. 50"
                {...fieldLabelProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>Price</FieldLabel>
              <FormField
                name="price"
                control={control}
                decimal
                placeholder="e.g. 999.99"
                {...fieldLabelProps}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Gift Image</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 12 }}>
              <Controller
                name="giftImage"
                control={control}
                render={({ field }) => (
                  <>
                    <FileDropzone
                      file={null}
                      accept="image/*"
                      helperText="PNG or JPG, square thumbnail recommended"
                      existingPreview={
                        imageUrl ? { url: imageUrl, name: 'Gift image' } : null
                      }
                      onSelect={async (file) => {
                        setUploading(true)
                        try {
                          const uploaded = await uploadPartnerFile(
                            file,
                            'gifts',
                          )
                          const resolved =
                            uploaded.viewUrl ||
                            uploaded.url ||
                            uploaded.path ||
                            ''
                          field.onChange(resolved)
                          setUploadedFilePath(uploaded.path || null)
                        } catch {
                          toast.error('Failed to upload gift image.')
                        } finally {
                          setUploading(false)
                        }
                      }}
                      onRemove={async () => {
                        try {
                          if (uploadedFilePath)
                            await deletePartnerFile(uploadedFilePath)
                        } catch {
                          // ignore
                        }
                        setUploadedFilePath(null)
                        field.onChange('')
                      }}
                    />
                    {uploading && (
                      <Box sx={{ mt: 1 }}>
                        <CircularProgress size={18} />
                      </Box>
                    )}
                  </>
                )}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Description</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FieldLabel>Gift Description</FieldLabel>
              <FormField
                name="description"
                control={control}
                multiline
                minRows={3}
                {...fieldLabelProps}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>
            Partner Type &amp; Base Points
          </Typography>
          <Controller
            name="partnerTypes"
            control={control}
            render={({ field, fieldState }) => (
              <Grid container spacing={2}>
                {ALL_PARTNER_TYPES.map((partnerType) => {
                  const checked = field.value.includes(partnerType)
                  const regionsFieldName =
                    partnerType === 'Dealer'
                      ? 'dealerRegions'
                      : 'chemistRegions'
                  const basePointsFieldName =
                    partnerType === 'Dealer'
                      ? 'dealerBasePoints'
                      : 'chemistBasePoints'
                  return (
                    <Grid key={partnerType} size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: `${radius.lg}px`,
                          border: '1px solid',
                          borderColor: checked ? 'primary.main' : 'divider',
                          backgroundColor: checked
                            ? 'primary.light'
                            : 'transparent',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={(e) => {
                                field.onChange(
                                  e.target.checked
                                    ? [...field.value, partnerType]
                                    : field.value.filter(
                                        (p) => p !== partnerType,
                                      ),
                                )
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                            >
                              {partnerType}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            pl: 4,
                            mb: checked ? 1.5 : 0,
                          }}
                        >
                          {checked
                            ? `Configure regions and base points for ${partnerType}.`
                            : `Enable to allow ${partnerType} partners to redeem this gift.`}
                        </Typography>
                        {checked && (
                          <Box sx={{ pl: 4 }}>
                            <FieldLabel required>
                              Regions for {partnerType}
                            </FieldLabel>
                            <Controller
                              name={regionsFieldName}
                              control={control}
                              render={({
                                field: regionField,
                                fieldState: regionFieldState,
                              }) => (
                                <>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ flexWrap: 'wrap', mb: 1.5 }}
                                  >
                                    {(regionChoices.length
                                      ? regionChoices.map((region) => ({
                                          label: region.name,
                                          value: region.id,
                                        }))
                                      : ALL_REGIONS.map((region) => ({
                                          label: region,
                                          value: region,
                                        }))
                                    ).map((region) => (
                                      <FormControlLabel
                                        key={region.value}
                                        control={
                                          <Checkbox
                                            size="small"
                                            checked={regionField.value.includes(
                                              region.value,
                                            )}
                                            onChange={(e) => {
                                              regionField.onChange(
                                                e.target.checked
                                                  ? [
                                                      ...regionField.value,
                                                      region.value,
                                                    ]
                                                  : regionField.value.filter(
                                                      (value: string) =>
                                                        value !== region.value,
                                                    ),
                                              )
                                            }}
                                          />
                                        }
                                        label={region.label}
                                      />
                                    ))}
                                  </Stack>
                                  {regionFieldState.error && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'error.main',
                                        display: 'block',
                                        mb: 1.5,
                                      }}
                                    >
                                      {regionFieldState.error.message}
                                    </Typography>
                                  )}
                                </>
                              )}
                            />
                            <FieldLabel required>Base Points</FieldLabel>
                            <FormField
                              name={basePointsFieldName}
                              control={control}
                              numeric
                              placeholder="e.g. 500"
                              {...fieldLabelProps}
                            />
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )
                })}
                {fieldState.error && (
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ color: 'error.main' }}>
                      {fieldState.error.message}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          />
        </Card>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Gift'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(backTo)}
          >
            Cancel
          </Button>
        </Stack>
      </form>

      <Modal
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        title="Add Category"
        description="Quickly add a new category name for this gift."
        primaryActionLabel="Add Category"
        onPrimaryAction={handleAddCategory}
        loading={isCreatingCategory}
      >
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Category Name"
          placeholder="e.g. Home Appliances"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddCategory()
            }
          }}
        />
      </Modal>
    </>
  )
}
