import { useState } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { ChevronRight, ChevronDown } from 'lucide-react'

export interface HierarchyTreeNode {
  id: string
  label: string
  sublabel?: string
  badge?: { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }
  children?: HierarchyTreeNode[]
  onClick?: () => void
}

interface HierarchyTreeProps {
  nodes: HierarchyTreeNode[]
  defaultExpandedDepth?: number
}

function collectExpandable(nodes: HierarchyTreeNode[], depth: number, maxDepth: number, acc: Set<string>) {
  for (const node of nodes) {
    if (node.children?.length) {
      if (depth < maxDepth) acc.add(node.id)
      collectExpandable(node.children, depth + 1, maxDepth, acc)
    }
  }
}

function TreeNode({ node, depth, expanded, toggle }: { node: HierarchyTreeNode; depth: number; expanded: Set<string>; toggle: (id: string) => void }) {
  const hasChildren = !!node.children?.length
  const isExpanded = expanded.has(node.id)

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          py: 0.875,
          pl: depth * 3,
          borderRadius: '8px',
          cursor: hasChildren || node.onClick ? 'pointer' : 'default',
          '&:hover': hasChildren || node.onClick ? { backgroundColor: 'background.default' } : undefined,
        }}
        onClick={() => {
          if (hasChildren) toggle(node.id)
          node.onClick?.()
        }}
      >
        <Box sx={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {hasChildren ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'divider' }} />
          )}
        </Box>
        <Typography
          sx={{
            fontWeight: depth === 0 ? 700 : 600,
            fontSize: depth === 0 ? '0.875rem' : '0.8125rem',
            color: node.onClick ? 'primary.main' : 'text.primary',
            '&:hover': node.onClick ? { textDecoration: 'underline' } : undefined,
          }}
        >
          {node.label}
        </Typography>
        {node.sublabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {node.sublabel}
          </Typography>
        )}
        {node.badge && <Chip size="small" label={node.badge.label} color={node.badge.color === 'default' ? undefined : node.badge.color} variant={node.badge.color === 'default' ? 'outlined' : 'filled'} />}
      </Stack>
      {hasChildren && isExpanded && (
        <Box sx={{ borderLeft: depth === 0 ? 'none' : '1px dashed', borderColor: 'divider', ml: depth * 3 + 2.25 }}>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} expanded={expanded} toggle={toggle} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export function HierarchyTree({ nodes, defaultExpandedDepth = 1 }: HierarchyTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const acc = new Set<string>()
    collectExpandable(nodes, 0, defaultExpandedDepth, acc)
    return acc
  })

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Box>
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} expanded={expanded} toggle={toggle} />
      ))}
    </Box>
  )
}
