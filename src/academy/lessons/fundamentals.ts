import type { LessonPack } from '../types'

const home = {
  cadet: {
    'readme.txt': 'Welcome to Daedalus Terminal Academy.\nType help to begin.\n',
    notes: {
      'todo.txt': '1. learn pwd\n2. learn ls\n3. learn cd\n',
    },
    '.secret': 'classified: phosphor-green\n',
    logs: {
      'app.log': 'INFO start\nWARN disk\nINFO ok\nERROR boom\nINFO done\n',
      'access.log': 'GET /\nGET /api\nPOST /login\nGET /\n',
    },
    data: {
      'names.txt': 'zeta\nalpha\nbeta\nalpha\ngamma\n',
      'numbers.txt': '3\n1\n4\n1\n5\n',
    },
  },
}

/**
 * Unix fundamentals: one micro-concept per lesson, with prose that teaches
 * the "why" before the check. New commands are named and defined before use.
 */
export const fundamentalLessons: LessonPack[] = [
  {
    id: 'fund-pwd',
    title: 'Where am I?',
    track: 'fundamentals',
    order: 1,
    level: 'intro',
    startUnlocked: true,
    summary: 'Print the working directory with pwd.',
    prose: [
      'The shell always has a current folder - called the working directory. Commands that use relative paths (like notes/todo.txt) are resolved from here.',
      'pwd means "print working directory". It writes the absolute path of that folder to the terminal (stdout).',
      'Run pwd once so you can see where this lesson starts.',
    ],
    goals: [{ id: 'g1', label: 'Run pwd and show your location' }],
    hints: [
      'The command name is three letters and means print working directory.',
    ],
    unlocks: ['fund-ls'],
    setup: {
      cwd: '/home/cadet',
      files: { home },
    },
    checks: [
      {
        type: 'lastCommandIs',
        command: 'pwd',
        message: 'Run the pwd command (exactly), then Check',
      },
      {
        type: 'stdoutEquals',
        text: '/home/cadet\n',
        message: 'pwd should print /home/cadet',
      },
      { type: 'lastExit', code: 0 },
    ],
  },
  {
    id: 'fund-ls',
    title: 'List files',
    track: 'fundamentals',
    order: 2,
    level: 'intro',
    summary: 'Use ls to see what is in a directory.',
    prose: [
      'ls lists the names inside a directory. With no path, it lists the working directory you just printed with pwd.',
      'You will see folders (notes, logs, data) and files (readme.txt). Folder names look like files in plain ls - later lessons show richer views.',
      'Run ls in your home directory so readme.txt appears in the output.',
    ],
    goals: [{ id: 'g1', label: 'List home with ls' }],
    hints: [
      'List the names in the current directory - short command, no path needed.',
    ],
    unlocks: ['fund-cd'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: '^ls(\\s|$)',
        message: 'Run ls (optionally with flags/paths), then Check',
      },
      {
        type: 'stdoutContains',
        text: 'readme.txt',
        message: 'Run ls in /home/cadet so readme.txt appears',
      },
      { type: 'lastExit', code: 0 },
    ],
  },
  {
    id: 'fund-cd',
    title: 'Change directory',
    track: 'fundamentals',
    order: 3,
    level: 'intro',
    summary: 'Move into notes/ with cd.',
    prose: [
      'cd means "change directory". It updates the working directory for the rest of the session. After cd, pwd and ls operate from the new place.',
      'cd notes moves into the notes folder relative to where you are. cd .. goes up one level. cd ~ (or bare cd) jumps home.',
      'Navigate into the notes directory. The Check only cares that you end in /home/cadet/notes.',
    ],
    goals: [{ id: 'g1', label: 'cd into ~/notes' }],
    hints: [
      'Change into the notes folder with a relative path from home.',
      'When you are done, Check looks at your working directory - not stdout.',
    ],
    unlocks: ['fund-cat'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [{ type: 'cwdIs', path: '/home/cadet/notes' }],
  },
  {
    id: 'fund-cat',
    title: 'Read a file',
    track: 'fundamentals',
    order: 4,
    level: 'intro',
    summary: 'Print a file with cat.',
    prose: [
      'cat writes a file\'s contents to the terminal. The name is historical ("concatenate"), but day to day you use it to read short files.',
      'Paths can be relative to your working directory (todo.txt if you are already in notes/) or from home (notes/todo.txt).',
      'Read notes/todo.txt so its text shows up in stdout.',
    ],
    goals: [{ id: 'g1', label: 'cat notes/todo.txt (from home or inside notes)' }],
    hints: [
      'Print the contents of the todo file under notes/.',
      'You can do this from home with a relative path notes/...',
    ],
    unlocks: ['fund-hidden'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: '^cat\\s+',
        message: 'Use cat to read the file, then Check',
      },
      {
        type: 'stdoutContains',
        text: 'learn pwd',
        message: 'cat the todo file so its text appears in stdout',
      },
      { type: 'lastExit', code: 0 },
    ],
  },
  {
    id: 'fund-hidden',
    title: 'List hidden files',
    track: 'fundamentals',
    order: 5,
    level: 'intro',
    summary: 'Reveal dotfiles with ls -a.',
    prose: [
      'Names that start with a dot (.) are hidden from plain ls. That is a convention for config and secret files, not real invisibility.',
      'ls -a means "all": include hidden names. Flags can combine, so ls -la is fine too.',
      'There is a .secret file in your home. Reveal it with ls -a.',
    ],
    goals: [{ id: 'g1', label: 'ls -a and show .secret' }],
    hints: [
      'Plain ls hides dotfiles. Add the flag that means "all".',
    ],
    unlocks: ['fund-mkdir-mv'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: '^ls\\s+-[a-zA-Z]*a',
        message: 'Run ls with -a (e.g. ls -a or ls -la), then Check',
      },
      {
        type: 'stdoutContains',
        text: '.secret',
        message: 'Use ls -a so .secret is listed',
      },
      { type: 'lastExit', code: 0 },
    ],
  },
  {
    id: 'fund-mkdir-mv',
    title: 'Make a directory and move a file',
    track: 'fundamentals',
    order: 6,
    level: 'core',
    summary: 'mkdir archive, then mv readme.txt into it.',
    prose: [
      'mkdir creates a new directory. mv moves or renames a file (same command for both jobs).',
      'Unlike copying, move removes the name from the old location. After mv readme.txt archive/, home no longer lists readme.txt at the top level.',
      'Create archive/ in your home, then move readme.txt into it.',
    ],
    goals: [
      { id: 'g1', label: 'Create ~/archive' },
      { id: 'g2', label: 'Move readme.txt into archive/' },
    ],
    hints: [
      'First create a directory named archive.',
      'Then relocate readme.txt into that directory (move, do not copy).',
    ],
    unlocks: ['fund-echo-redir'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      { type: 'fileExists', path: '/home/cadet/archive' },
      {
        type: 'fileExists',
        path: '/home/cadet/archive/readme.txt',
        message: 'readme.txt should live under archive/',
      },
      { type: 'fileMissing', path: '/home/cadet/readme.txt' },
    ],
  },
  {
    id: 'fund-echo-redir',
    title: 'Write with echo and >',
    track: 'fundamentals',
    order: 7,
    level: 'core',
    summary: 'Create hello.txt using echo and a redirect.',
    prose: [
      'echo prints text to stdout. On its own, that text appears in the terminal.',
      'The > operator redirects stdout into a file instead. If the file exists, > overwrites it. Example shape: echo some words > file.txt',
      'Create hello.txt containing exactly: hello daedalus',
    ],
    goals: [{ id: 'g1', label: 'Write hello.txt via redirect' }],
    hints: [
      'echo prints text; > sends that text into a new file.',
      'The file should contain exactly: hello daedalus',
    ],
    unlocks: ['fund-append'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'fileEquals',
        path: '/home/cadet/hello.txt',
        content: 'hello daedalus\n',
      },
    ],
  },
  {
    id: 'fund-append',
    title: 'Append with >>',
    track: 'fundamentals',
    order: 8,
    level: 'core',
    summary: 'Append a second line with >>.',
    prose: [
      '>> is like >, but it appends. Existing content stays; new stdout is added at the end.',
      'Use > when you want a fresh file. Use >> when you are building a log or adding a line.',
      'hello.txt already says hello. Append the line: more text',
    ],
    goals: [{ id: 'g1', label: 'Append to hello.txt' }],
    hints: [
      'Use the append redirect (two greater-than signs), not a single >.',
      'Append the words: more text',
    ],
    unlocks: ['fund-grep'],
    setup: {
      cwd: '/home/cadet',
      files: {
        home: {
          cadet: {
            'hello.txt': 'hello\n',
          },
        },
      },
    },
    checks: [
      {
        type: 'fileEquals',
        path: '/home/cadet/hello.txt',
        content: 'hello\nmore text\n',
      },
    ],
  },
  {
    id: 'fund-grep',
    title: 'Search lines with grep',
    track: 'fundamentals',
    order: 9,
    level: 'core',
    summary: 'Filter a file for matching lines.',
    prose: [
      'grep searches text line by line. It prints every line that contains a pattern you give it.',
      'Basic shape: grep PATTERN file. PATTERN is often a plain word (ERROR). Later you will pipe other commands into grep; for now, pass the file directly.',
      'From home, show only the ERROR line in logs/app.log.',
    ],
    goals: [{ id: 'g1', label: 'grep ERROR logs/app.log' }],
    hints: [
      'grep PATTERN file keeps matching lines. Pattern is ERROR; file is under logs/.',
    ],
    unlocks: ['fund-pipe-grep'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'grep\\s+.*ERROR',
        message: 'Run grep with the pattern ERROR against the log file',
      },
      {
        type: 'stdoutEquals',
        text: 'ERROR boom\n',
        message: 'Stdout should be only the ERROR line',
      },
    ],
  },
  {
    id: 'fund-pipe-grep',
    title: 'Connect commands with pipes',
    track: 'fundamentals',
    order: 10,
    level: 'core',
    summary: 'Send one command\'s output into grep.',
    prose: [
      'A pipe | connects two commands: the left command\'s stdout becomes the right command\'s stdin (keyboard-like input). Nothing is saved to a file unless you redirect.',
      'You already used grep FILE. The pipe form is: cat file | grep PATTERN. cat prints the file; grep filters that stream. Same result as grep PATTERN file for this case - the point is to practice the connection.',
      'Filter ERROR lines from logs/app.log using a pipe (or grep on the file again). Stdout should be only the ERROR line.',
    ],
    goals: [{ id: 'g1', label: 'Show ERROR lines from app.log via pipe or grep' }],
    hints: [
      'Connect cat into grep with a pipe, or call grep on the file directly.',
      'Stdout should be only the ERROR line.',
    ],
    unlocks: ['fund-wc'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      { type: 'stdoutContains', text: 'ERROR boom' },
      {
        type: 'stdoutEquals',
        text: 'ERROR boom\n',
        message: 'Stdout should be only the ERROR line',
      },
    ],
  },
  {
    id: 'fund-wc',
    title: 'Count lines with wc',
    track: 'fundamentals',
    order: 11,
    level: 'core',
    summary: 'Use wc -l on a log file.',
    prose: [
      'wc means "word count", but flags pick what to measure: -l lines, -w words, -c bytes.',
      'wc -l file prints how many lines are in the file. You can also pipe into wc: cat file | wc -l.',
      'How many lines are in logs/access.log? Print the count with wc -l.',
    ],
    goals: [{ id: 'g1', label: 'wc -l logs/access.log' }],
    hints: [
      'Count lines with wc and the line flag on logs/access.log.',
    ],
    unlocks: ['fund-sort-uniq'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'stdoutContains',
        text: '4',
        message: 'access.log has 4 lines - use wc -l',
      },
    ],
  },
  {
    id: 'fund-sort-uniq',
    title: 'sort and uniq',
    track: 'fundamentals',
    order: 12,
    level: 'core',
    summary: 'Sort names and collapse duplicates.',
    prose: [
      'sort orders lines alphabetically (by default). uniq removes adjacent duplicate lines - it only collapses runs of the same value next to each other.',
      'That is why the usual pattern is sort file | uniq: sort groups duplicates together, then uniq drops the repeats.',
      'Produce the unique sorted names from data/names.txt.',
    ],
    goals: [{ id: 'g1', label: 'sort data/names.txt | uniq' }],
    hints: [
      'Sort first so duplicates sit next to each other, then collapse them.',
      'Pipe sort into uniq on data/names.txt.',
    ],
    unlocks: ['fund-head-tail'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'stdoutEquals',
        text: 'alpha\nbeta\ngamma\nzeta\n',
      },
    ],
  },
  {
    id: 'fund-head-tail',
    title: 'head and tail',
    track: 'fundamentals',
    order: 13,
    level: 'core',
    summary: 'Read the ends of a file.',
    prose: [
      'head shows the start of a file; tail shows the end. Both accept -n N to pick how many lines (default is often 10).',
      'Use head when you want a preview. Use tail for recent log lines. You already used cat for the whole file - these are the "just a slice" tools.',
      'Print the last 2 lines of logs/app.log.',
    ],
    goals: [{ id: 'g1', label: 'tail -n 2 logs/app.log' }],
    hints: [
      'You want the end of the file, last 2 lines, on logs/app.log.',
    ],
    unlocks: ['fund-chmod'],
    setup: { cwd: '/home/cadet', files: { home } },
    checks: [
      {
        type: 'stdoutEquals',
        text: 'ERROR boom\nINFO done\n',
      },
    ],
  },
  {
    id: 'fund-chmod',
    title: 'Permissions with chmod',
    track: 'fundamentals',
    order: 14,
    level: 'advanced',
    summary: 'Make a script executable (755).',
    prose: [
      'Every file has permission bits: who can read, write, or execute it. chmod MODE file sets those bits.',
      '755 is a common mode for scripts: owner can read/write/execute; group and others can read/execute. You can confirm later with ls -l.',
      'tool.sh is in your home. Make it mode 755, then Check.',
    ],
    goals: [{ id: 'g1', label: 'chmod 755 tool.sh' }],
    hints: [
      'Set mode 755 on tool.sh with chmod.',
    ],
    unlocks: ['fund-ps-kill'],
    setup: {
      cwd: '/home/cadet',
      files: {
        home: {
          cadet: {
            'tool.sh': '#!/bin/sh\necho ready\n',
          },
        },
      },
    },
    checks: [{ type: 'modeIs', path: '/home/cadet/tool.sh', mode: '755' }],
  },
  {
    id: 'fund-ps-kill',
    title: 'Processes: ps and kill',
    track: 'fundamentals',
    order: 15,
    level: 'advanced',
    summary: 'List fake processes and stop one.',
    prose: [
      'A process is a running program. ps lists processes (here: a tiny simulated table, not your real machine).',
      'kill PID asks a process to stop. In this academy, kill marks the process stopped so Check can verify.',
      'Use ps if you want to inspect, then stop the rogue worker with pid 4242. That unlocks the Shell mastery track.',
    ],
    goals: [{ id: 'g1', label: 'Stop pid 4242' }],
    hints: [
      'List processes if you want, then stop pid 4242.',
    ],
    unlocks: ['mast-globs'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: { 'readme.txt': 'ops desk\n' } } },
      processes: [
        { pid: 1, name: 'init', status: 'running' },
        { pid: 4242, name: 'rogue-worker', status: 'running' },
        { pid: 7, name: 'sshd', status: 'running' },
      ],
    },
    checks: [{ type: 'processStopped', pid: 4242 }],
  },
]
