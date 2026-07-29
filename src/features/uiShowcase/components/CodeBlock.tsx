import { Box, IconButton, Tooltip } from '@mui/material'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { radius } from '@/theme/tokens'

interface CodeBlockProps {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          pr: 5,
          borderRadius: `${radius.md}px`,
          backgroundColor: '#1A1A1A',
          color: '#E5E5E5',
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          overflowX: 'auto',
          fontFamily:
            "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
        }}
      >
        <Box component="code">{code}</Box>
      </Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
        <IconButton
          onClick={handleCopy}
          size="small"
          aria-label="Copy code snippet"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#E5E5E5',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
