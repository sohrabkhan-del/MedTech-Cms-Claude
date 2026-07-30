import { useMemo, useState } from 'react'
import { Box, ClickAwayListener, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { Search, X } from 'lucide-react'
import { radius, shadows } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { TextField } from '@mui/material'
import { Search, X } from 'lucide-react'

<TextField
  size="small"
  placeholder="Search..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  slotProps={{
    input: {
      startAdornment: <Search size={16} />,
      endAdornment: query && (
        <IconButton size="small" onClick={() => setQuery('')}><X size={14} /></IconButton>
      ),
    },
  }}
/>`

const CATALOG = [
  'Product Master', 'Factory Inventory Upload', 'Distributor Upload', 'Product Categories',
  'Dealers', 'Chemists', 'Approval Requests', 'Rejected Requests', 'Marketing Catalogue',
  'Interested Users', 'Schemes', 'Gift Catalogue', 'Point Value Rules', 'Wallet Management',
  'Reward Redemptions', 'Scan Reports', 'Reward Reports', 'Wallet Reports',
]

function BasicSearch() {
  const [query, setQuery] = useState('')
  return (
    <TextField
      size="small"
      placeholder="Search..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      sx={{ width: 280 }}
      slotProps={{
        input: {
          startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.6 }} />,
        },
      }}
    />
  )
}

function SearchWithClear() {
  const [query, setQuery] = useState('Wallet')
  return (
    <TextField
      size="small"
      placeholder="Search..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      sx={{ width: 280 }}
      slotProps={{
        input: {
          startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.6 }} />,
          endAdornment: query ? (
            <IconButton size="small" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={14} />
            </IconButton>
          ) : undefined,
        },
      }}
    />
  )
}

function LiveSuggestSearch() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return CATALOG.filter((item) => item.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
  }, [query])

  const showDropdown = focused && query.trim().length > 0

  return (
    <ClickAwayListener onClickAway={() => setFocused(false)}>
      <Box sx={{ position: 'relative', width: 320 }}>
        <TextField
          size="small"
          placeholder="Search modules..."
          fullWidth
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.6 }} />,
              endAdornment: query ? (
                <IconButton size="small" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={14} />
                </IconButton>
              ) : undefined,
            },
          }}
        />
        {showDropdown && (
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 10,
              borderRadius: `${radius.md}px`,
              boxShadow: shadows.dropdown,
              overflow: 'hidden',
            }}
          >
            {results.length === 0 ? (
              <Typography variant="body1" sx={{ color: 'text.secondary', p: 1.5 }}>
                No matches for "{query}"
              </Typography>
            ) : (
              <Stack>
                {results.map((item) => (
                  <Box
                    key={item}
                    onClick={() => {
                      setQuery(item)
                      setFocused(false)
                    }}
                    sx={{
                      px: 1.5,
                      py: 1,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    {item}
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  )
}

export function SearchDemo() {
  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        No dedicated "SearchBar" component exists yet — <code>CommonTable</code> has an inline search TextField
        (instant client-side substring filter, no debounce). These demos reuse that same TextField + lucide{' '}
        <code>Search</code>/<code>X</code> icon styling.
      </Typography>

      <DemoSection title="Basic search bar" description="Plain controlled TextField with a search icon.">
        <BasicSearch />
      </DemoSection>

      <DemoSection title="With clear button" description="An X button appears once there's a query, clearing it on click.">
        <SearchWithClear />
      </DemoSection>

      <DemoSection title="Live filtered suggestions" description="Typing filters a dropdown of matches instantly (client-side, no debounce) — click a suggestion to select it.">
        <LiveSuggestSearch />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Notes">
        <PropsTable
          rows={[
            { name: '(none)', type: '—', description: 'Composed from MUI TextField + ClickAwayListener + Paper — no dedicated SearchBar component exists in the codebase yet.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
