/// <reference types="vite/client" />

declare module '*.java?raw' {
  const src: string
  export default src
}

declare module '*.kt?raw' {
  const src: string
  export default src
}

declare module '*.py?raw' {
  const src: string
  export default src
}
