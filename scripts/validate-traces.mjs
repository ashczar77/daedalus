#!/usr/bin/env node
/**
 * Validates curated step traces against algorithm sources.
 *
 * Catches bugs where a step's story takes the else branch (or similar)
 * but codeFocus still points at the if line — and out-of-range focuses.
 *
 * Usage: npm run validate:traces
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const problemsDir = path.join(root, 'src/problems')
const LANGS = ['java', 'kotlin', 'python']

/** @type {{ file: string, stepId: number | string, lang: string, message: string }[]} */
const errors = []
/** @type {{ file: string, stepId: number | string, lang: string, message: string }[]} */
const warnings = []

function linesOf(source) {
  return source.replace(/\n$/, '').split('\n')
}

function readAlgo(relFromProblemsImport) {
  return path.resolve(problemsDir, relFromProblemsImport.replace(/\?raw$/, ''))
}

function extractImports(src) {
  const out = {}
  const re = /import\s+(javaSrc|kotlinSrc|pythonSrc)\s+from\s+'([^']+)'/g
  let m
  while ((m = re.exec(src))) {
    out[m[1].replace('Src', '')] = readAlgo(m[2])
  }
  return out
}

/** Parse `const L = { name: { java: n, ... }, ... }` maps used by packs. */
function extractFocusMaps(src) {
  /** @type {Record<string, Record<string, Record<string, number>>>} */
  const maps = {}
  const mapRe =
    /const\s+([A-Za-z_][\w]*)\s*=\s*\{([\s\S]*?)\}\s*as\s+const/g
  let m
  while ((m = mapRe.exec(src))) {
    const mapName = m[1]
    const body = m[2]
    maps[mapName] = {}
    const entryRe =
      /([A-Za-z_][\w]*)\s*:\s*\{([^}]+)\}/g
    let e
    while ((e = entryRe.exec(body))) {
      const focus = {}
      for (const lang of LANGS) {
        const fm = e[2].match(new RegExp(`${lang}:\\s*(\\d+)`))
        if (fm) focus[lang] = Number(fm[1])
      }
      maps[mapName][e[1]] = focus
    }
  }
  return maps
}

function parseInlineFocus(raw) {
  const focus = {}
  for (const lang of LANGS) {
    const fm = raw.match(new RegExp(`${lang}:\\s*(\\d+)`))
    if (fm) focus[lang] = Number(fm[1])
  }
  return focus
}

function extractSteps(src, focusMaps) {
  const steps = []
  // Match from id: through codeFocus (inline object or L.key / Focus.key).
  const stepRe =
    /\{\s*id:\s*(\d+)[\s\S]*?codeFocus:\s*(?:\{([^}]+)\}|([A-Za-z_][\w]*)\.([A-Za-z_][\w]*))/g
  let m
  while ((m = stepRe.exec(src))) {
    const id = Number(m[1])
    const block = m[0]
    let focus = {}
    if (m[2]) {
      focus = parseInlineFocus(m[2])
    } else if (m[3] && m[4]) {
      focus = focusMaps[m[3]]?.[m[4]] ?? {}
      if (Object.keys(focus).length === 0) {
        errors.push({
          file: '(pending)',
          stepId: id,
          lang: '-',
          message: `Unresolved codeFocus ${m[3]}.${m[4]}`,
        })
      }
    }

    const narrative =
      block.match(/narrative:\s*'((?:\\'|[^'])*)'/)?.[1] ??
      block.match(/narrative:\s*"((?:\\"|[^"])*)"/)?.[1] ??
      ''
    const caption =
      block.match(/caption:\s*'((?:\\'|[^'])*)'/)?.[1] ??
      block.match(/caption:\s*"((?:\\"|[^"])*)"/)?.[1] ??
      ''

    steps.push({
      id,
      focus,
      narrative,
      caption,
      text: `${narrative} ${caption}`,
      focusRef: m[3] && m[4] ? `${m[3]}.${m[4]}` : 'inline',
    })
  }
  return steps
}

function lineAt(filePath, lineNo) {
  if (!fs.existsSync(filePath)) return null
  const lines = linesOf(fs.readFileSync(filePath, 'utf8'))
  if (lineNo < 1 || lineNo > lines.length) {
    return { outOfRange: true, total: lines.length }
  }
  return { text: lines[lineNo - 1], total: lines.length }
}

function looksLikeIfCondition(line) {
  return /^\s*if\s*\(/.test(line) || /^\s*if\s+/.test(line)
}

function looksLikeElse(line) {
  return /^\s*\}?\s*else\b/.test(line) || /^\s*else\b/.test(line)
}

function storyImpliesElse(text) {
  return (
    /\belse\b/i.test(text) ||
    /list2['’]s head is smaller/i.test(text) ||
    /take list2/i.test(text) ||
    /else:\s*runner\.next\s*=\s*list2/i.test(text) ||
    /\bfalse\s*→\s*else\b/i.test(text)
  )
}

function storyImpliesIfTake1(text) {
  return (
    /\bif branch\b/i.test(text) ||
    /take list1/i.test(text) ||
    /if:\s*runner\.next\s*=\s*list1/i.test(text)
  )
}

/** Indices the demo must visit — only when pack opts in via demoCoverage.indices. */
function requiredDemoLength(src) {
  const explicit = src.match(/demoCoverage:\s*\{[^}]*indices:\s*(\d+)/)
  if (explicit) return Number(explicit[1])
  return null
}

function twoPointersArrayName(src) {
  return src.match(/demoCoverage:\s*\{[^}]*twoPointers:\s*\{\s*array:\s*'([^']+)'/)?.[1] ?? null
}

function extractNumericArray(src, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*\\[([^\\]]+)\\]`)
  const m = src.match(re)
  if (!m) return null
  return m[1].split(',').map((part) => Number(part.trim())).filter((n) => !Number.isNaN(n))
}

/** Classic opposite-end two-pointer for container / similar move-shorter patterns. */
function simulateMoveShorter(arr) {
  const states = []
  let left = 0
  let right = arr.length - 1
  while (left < right) {
    states.push({ left, right })
    if (arr[left] <= arr[right]) left += 1
    else right -= 1
  }
  return states
}

function collectLeftRightPairs(src) {
  const pairs = new Set()
  const re = /pointers:\s*\{[^}]*left:\s*(\d+)[^}]*right:\s*(\d+)/g
  let m
  while ((m = re.exec(src))) {
    pairs.add(`${m[1]},${m[2]}`)
  }
  // also right before left order
  const re2 = /pointers:\s*\{[^}]*right:\s*(\d+)[^}]*left:\s*(\d+)/g
  while ((m = re2.exec(src))) {
    pairs.add(`${m[2]},${m[1]}`)
  }
  // Helper form used by bar-mode packs: heightBars(left, right, …)
  const helper = /heightBars\(\s*(\d+)\s*,\s*(\d+)/g
  while ((m = helper.exec(src))) {
    pairs.add(`${m[1]},${m[2]}`)
  }
  return pairs
}

/** Collect indices marked current via pointers.i or role:'current' highlights. */
function collectVisitedIndices(src) {
  const visited = new Set()
  const pointerI = /pointers:\s*\{[^}]*\bi:\s*(\d+)/g
  let m
  while ((m = pointerI.exec(src))) visited.add(Number(m[1]))

  const currentHighlight =
    /index:\s*(\d+)\s*,\s*role:\s*'current'|role:\s*'current'\s*,\s*index:\s*(\d+)/g
  while ((m = currentHighlight.exec(src))) {
    visited.add(Number(m[1] ?? m[2]))
  }
  return visited
}

function validateCoverage(file, src) {
  const rel = path.relative(root, file)

  const needed = requiredDemoLength(src)
  if (needed != null && needed > 0) {
    // Generators walk indices at runtime; require a for/while scan instead of literal i: N.
    if (src.includes('generateSteps')) {
      if (!/for\s*\(|while\s*\(/.test(src)) {
        errors.push({
          file: rel,
          stepId: '-',
          lang: 'coverage',
          message: `demoCoverage.indices=${needed} but generator has no for/while scan`,
        })
      }
    } else {
      const visited = collectVisitedIndices(src)
      const missing = []
      for (let i = 0; i < needed; i++) {
        if (!visited.has(i)) missing.push(i)
      }
      if (missing.length > 0) {
        errors.push({
          file: rel,
          stepId: '-',
          lang: 'coverage',
          message: `Demo has ${needed} indices but steps never focus: [${missing.join(', ')}] — every character/index must be stepped`,
        })
      }
    }
  }

  const tpName = twoPointersArrayName(src)
  if (tpName) {
    const arr = extractNumericArray(src, tpName)
    if (!arr || arr.length === 0) {
      errors.push({
        file: rel,
        stepId: '-',
        lang: 'coverage',
        message: `demoCoverage.twoPointers.array='${tpName}' but const ${tpName} = [...] not found`,
      })
      return
    }

    // Generator packs rebuild pairs at runtime — require a full left<right loop instead of literals.
    const isGenerator =
      src.includes('generateSteps') && /while\s*\(\s*left\s*<\s*right\s*\)/.test(src)
    if (isGenerator) {
      if (simulateMoveShorter(arr).length === 0 && arr.length >= 2) {
        errors.push({
          file: rel,
          stepId: '-',
          lang: 'coverage',
          message: `two-pointer generator: default ${tpName} should admit at least one loop state`,
        })
      }
      return
    }

    const required = simulateMoveShorter(arr)
    const present = collectLeftRightPairs(src)
    const missing = required.filter((s) => !present.has(`${s.left},${s.right}`))
    if (missing.length > 0) {
      errors.push({
        file: rel,
        stepId: '-',
        lang: 'coverage',
        message: `two-pointer trace incomplete — missing loop states: ${missing
          .map((s) => `(left=${s.left},right=${s.right})`)
          .join(', ')}`,
      })
    }
  }
}

function validatePack(file) {
  const src = fs.readFileSync(file, 'utf8')
  if (!src.includes('codeFocus')) return

  const rel = path.relative(root, file)
  const imports = extractImports(src)
  const focusMaps = extractFocusMaps(src)
  const steps = extractSteps(src, focusMaps)

  for (const err of errors) {
    if (err.file === '(pending)') err.file = rel
  }

  if (Object.keys(imports).length < 3) {
    warnings.push({
      file: rel,
      stepId: '-',
      lang: '-',
      message: 'Could not resolve all language source imports',
    })
  }

  if (steps.length === 0) {
    warnings.push({
      file: rel,
      stepId: '-',
      lang: '-',
      message: 'No steps with codeFocus extracted',
    })
  }

  validateCoverage(file, src)

  for (const step of steps) {
    for (const lang of LANGS) {
      const lineNo = step.focus[lang]
      if (lineNo == null) {
        errors.push({
          file: rel,
          stepId: step.id,
          lang,
          message: `Missing codeFocus (${step.focusRef})`,
        })
        continue
      }
      const algoPath = imports[lang]
      if (!algoPath) continue
      const hit = lineAt(algoPath, lineNo)
      if (!hit) {
        errors.push({
          file: rel,
          stepId: step.id,
          lang,
          message: `Missing algorithm file`,
        })
        continue
      }
      if (hit.outOfRange) {
        errors.push({
          file: rel,
          stepId: step.id,
          lang,
          message: `codeFocus ${lineNo} out of range (1–${hit.total}) via ${step.focusRef}`,
        })
        continue
      }
      const trimmed = hit.text.trim()
      if (trimmed === '' || trimmed === '{' || trimmed === '}') {
        warnings.push({
          file: rel,
          stepId: step.id,
          lang,
          message: `Focus line ${lineNo} is empty/brace-only`,
        })
      }

      if (lang === 'java') {
        if (storyImpliesElse(step.text) && looksLikeIfCondition(trimmed)) {
          errors.push({
            file: rel,
            stepId: step.id,
            lang,
            message: `Story takes else path but focus is if: "${trimmed}" (${step.focusRef})`,
          })
        }
        if (storyImpliesIfTake1(step.text) && looksLikeElse(trimmed)) {
          errors.push({
            file: rel,
            stepId: step.id,
            lang,
            message: `Story takes if/list1 path but focus is else: "${trimmed}" (${step.focusRef})`,
          })
        }
      }
    }
  }
}

const files = fs
  .readdirSync(problemsDir)
  .filter((name) => /^(\d.+|sort-.+)\.ts$/.test(name))
  .map((name) => path.join(problemsDir, name))

for (const file of files) validatePack(file)

function print(label, items) {
  if (items.length === 0) return
  console.log(`\n${label} (${items.length})`)
  for (const item of items) {
    console.log(`  ${item.file} step ${item.stepId} [${item.lang}] ${item.message}`)
  }
}

print('ERRORS', errors)
print('WARNINGS', warnings)

if (errors.length === 0) {
  console.log(
    `\nvalidate-traces: ok — ${files.length} packs, ${warnings.length} warning(s)`,
  )
  process.exit(0)
}

console.error(`\nvalidate-traces: failed — ${errors.length} error(s)`)
process.exit(1)
