import type { VfsSpec } from '../types'

export type VfsFile = {
  kind: 'file'
  content: string
  mode: number
}

export type VfsDir = {
  kind: 'dir'
  children: Record<string, VfsNode>
  mode: number
}

export type VfsNode = VfsFile | VfsDir

export const DEFAULT_FILE_MODE = 0o644
export const DEFAULT_DIR_MODE = 0o755

export function createEmptyRoot(): VfsDir {
  return { kind: 'dir', children: {}, mode: DEFAULT_DIR_MODE }
}

/** Build a VFS tree from a nested string/object spec. */
export function buildVfs(spec: VfsSpec): VfsDir {
  const root = createEmptyRoot()
  for (const [name, value] of Object.entries(spec)) {
    root.children[name] =
      typeof value === 'string'
        ? { kind: 'file', content: value, mode: DEFAULT_FILE_MODE }
        : buildVfs(value)
  }
  return root
}

export function cloneVfs(node: VfsNode): VfsNode {
  if (node.kind === 'file') {
    return { kind: 'file', content: node.content, mode: node.mode }
  }
  const children: Record<string, VfsNode> = {}
  for (const [name, child] of Object.entries(node.children)) {
    children[name] = cloneVfs(child)
  }
  return { kind: 'dir', children, mode: node.mode }
}

/** Normalize path segments; resolves `.` and `..`. */
export function normalizePath(path: string, cwd: string): string {
  const absolute = path.startsWith('/') ? path : joinPath(cwd, path)
  const parts = absolute.split('/').filter(Boolean)
  const stack: string[] = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      stack.pop()
      continue
    }
    stack.push(part)
  }
  return '/' + stack.join('/')
}

export function joinPath(base: string, rel: string): string {
  if (rel.startsWith('/')) return rel
  if (base === '/') return `/${rel}`
  return `${base.replace(/\/$/, '')}/${rel}`
}

export function dirname(path: string): string {
  if (path === '/') return '/'
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return parts.length === 0 ? '/' : '/' + parts.join('/')
}

export function basename(path: string): string {
  if (path === '/') return '/'
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? '/'
}

export function getNode(root: VfsDir, path: string): VfsNode | null {
  const normalized = normalizePath(path, '/')
  if (normalized === '/') return root
  const parts = normalized.split('/').filter(Boolean)
  let current: VfsNode = root
  for (const part of parts) {
    if (current.kind !== 'dir') return null
    const next: VfsNode | undefined = current.children[part]
    if (!next) return null
    current = next
  }
  return current
}

export function ensureParent(root: VfsDir, path: string): VfsDir | null {
  const parentPath = dirname(path)
  const parent = getNode(root, parentPath)
  if (!parent || parent.kind !== 'dir') return null
  return parent
}

export function listNames(dir: VfsDir, all: boolean): string[] {
  const names = Object.keys(dir.children).sort((a, b) => a.localeCompare(b))
  return all ? names : names.filter((name) => !name.startsWith('.'))
}

export function modeString(node: VfsNode): string {
  const type = node.kind === 'dir' ? 'd' : '-'
  const mode = node.mode
  const bits = (mask: number, ch: string) => ((mode & mask) !== 0 ? ch : '-')
  return (
    type +
    bits(0o400, 'r') +
    bits(0o200, 'w') +
    bits(0o100, 'x') +
    bits(0o040, 'r') +
    bits(0o020, 'w') +
    bits(0o010, 'x') +
    bits(0o004, 'r') +
    bits(0o002, 'w') +
    bits(0o001, 'x')
  )
}

export function parseMode(raw: string): number | null {
  if (!/^[0-7]{3,4}$/.test(raw)) return null
  return Number.parseInt(raw, 8)
}
