export type CheckSpec =
  | { type: 'cwdIs'; path: string; message?: string }
  | { type: 'fileExists'; path: string; message?: string }
  | { type: 'fileMissing'; path: string; message?: string }
  | { type: 'fileEquals'; path: string; content: string; message?: string }
  | { type: 'fileContains'; path: string; text: string; message?: string }
  | { type: 'stdoutEquals'; text: string; message?: string }
  | { type: 'stdoutContains'; text: string; message?: string }
  | { type: 'modeIs'; path: string; mode: string; message?: string }
  | { type: 'processStopped'; pid: number; message?: string }
  | { type: 'lastExit'; code: number; message?: string }
  /** Exact last command line (trimmed), e.g. "pwd". */
  | { type: 'lastCommandIs'; command: string; message?: string }
  /** RegExp (no flags) tested against the last command line. */
  | { type: 'lastCommandMatches'; pattern: string; message?: string }
