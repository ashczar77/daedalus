/**
 * Lightweight Java tokenizer for Languages lesson code panes.
 * Not a full parser - enough to color keywords, strings, comments, and annotations.
 */

export type JavaTokenKind =
  | 'text'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'type'
  | 'annotation'
  | 'punctuation'

export type JavaToken = {
  kind: JavaTokenKind
  value: string
}

const KEYWORDS = new Set([
  'abstract',
  'assert',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extends',
  'final',
  'finally',
  'float',
  'for',
  'goto',
  'if',
  'implements',
  'import',
  'instanceof',
  'int',
  'interface',
  'long',
  'native',
  'new',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'strictfp',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'try',
  'void',
  'volatile',
  'while',
  'true',
  'false',
  'null',
  'var',
  'record',
  'sealed',
  'permits',
  'yield',
  'when',
])

/** Common Spring / JDK type names that read better when tinted. */
const KNOWN_TYPES = new Set([
  'String',
  'Object',
  'Integer',
  'Long',
  'Boolean',
  'Double',
  'Float',
  'Short',
  'Byte',
  'Character',
  'List',
  'Map',
  'Set',
  'Optional',
  'Override',
  'Deprecated',
  'SuppressWarnings',
  'Component',
  'Service',
  'Repository',
  'Controller',
  'RestController',
  'Configuration',
  'Bean',
  'Autowired',
  'SpringBootApplication',
  'GetMapping',
  'PostMapping',
  'RequestMapping',
  'RequestBody',
  'PathVariable',
  'Valid',
  'ResponseEntity',
  'SpringApplication',
  'ApplicationContext',
  'AnnotationConfigApplicationContext',
  'ComponentScan',
  'Value',
  'ConfigurationProperties',
  'Transactional',
  'DataSource',
  'JdbcTemplate',
  'Entity',
  'Table',
  'Id',
  'GeneratedValue',
  'ManyToOne',
  'OneToMany',
  'SpringBootTest',
  'WebMvcTest',
  'DataJpaTest',
  'ExtendWith',
  'Test',
  'BeforeEach',
  'SecurityFilterChain',
  'HttpSecurity',
  'Greeter',
  'App',
  'AppConfig',
  'HelloController',
  'OrderService',
  'OrderRepository',
  'OrderController',
  'Order',
  'CreateOrder',
  'BillingApp',
])

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch)
}

function isIdentPart(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch)
}

function pushText(out: JavaToken[], value: string): void {
  if (!value) return
  const last = out[out.length - 1]
  if (last?.kind === 'text') {
    last.value += value
    return
  }
  out.push({ kind: 'text', value })
}

/** Tokenize a Java source string into highlightable pieces. */
export function tokenizeJava(source: string): JavaToken[] {
  const out: JavaToken[] = []
  let i = 0
  const n = source.length

  while (i < n) {
    const ch = source[i]!
    const next = source[i + 1]

    if (ch === '/' && next === '/') {
      let j = i + 2
      while (j < n && source[j] !== '\n') j++
      out.push({ kind: 'comment', value: source.slice(i, j) })
      i = j
      continue
    }

    if (ch === '/' && next === '*') {
      let j = i + 2
      while (j < n && !(source[j] === '*' && source[j + 1] === '/')) j++
      j = Math.min(n, j + 2)
      out.push({ kind: 'comment', value: source.slice(i, j) })
      i = j
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      let j = i + 1
      while (j < n) {
        if (source[j] === '\\') {
          j += 2
          continue
        }
        if (source[j] === quote) {
          j++
          break
        }
        j++
      }
      out.push({ kind: 'string', value: source.slice(i, j) })
      i = j
      continue
    }

    if (ch === '@' && i + 1 < n && isIdentStart(source[i + 1]!)) {
      let j = i + 1
      while (j < n && isIdentPart(source[j]!)) j++
      out.push({ kind: 'annotation', value: source.slice(i, j) })
      i = j
      continue
    }

    if (/[0-9]/.test(ch)) {
      let j = i + 1
      while (j < n && /[0-9xXa-fA-F_.lLfFdD]/.test(source[j]!)) j++
      out.push({ kind: 'number', value: source.slice(i, j) })
      i = j
      continue
    }

    if (isIdentStart(ch)) {
      let j = i + 1
      while (j < n && isIdentPart(source[j]!)) j++
      const word = source.slice(i, j)
      if (KEYWORDS.has(word)) {
        out.push({ kind: 'keyword', value: word })
      } else if (KNOWN_TYPES.has(word) || /^[A-Z][A-Za-z0-9_]*$/.test(word)) {
        out.push({ kind: 'type', value: word })
      } else {
        pushText(out, word)
      }
      i = j
      continue
    }

    if ('(){}[];,.<>?=:+-*/%|&!^~'.includes(ch)) {
      out.push({ kind: 'punctuation', value: ch })
      i++
      continue
    }

    pushText(out, ch)
    i++
  }

  return out
}
