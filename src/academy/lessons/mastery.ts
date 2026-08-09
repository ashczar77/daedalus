import type { LessonPack } from '../types'

const home = {
  notes: {
    'todo.txt': 'ship academy\nlearn globs\n',
    'draft.txt': 'scratch\n',
  },
  logs: {
    'app.log': 'INFO boot\nERROR disk\nWARN heat\nERROR timeout\nINFO ok\n',
    'access.log': 'GET /\nGET /a\nPOST /b\nGET /c\n',
    'debug.log': 'trace one\ntrace two\n',
    'mixed.log': 'error low\nERROR high\ninfo ok\n',
  },
  data: {
    'names.txt': 'ada\ngrace\nada\nalan\n',
    'users.csv': 'ada,90\ngrace,99\nalan,88\n',
    'hosts.txt': 'db:5432\napi:8080\ncache:6379\n',
  },
  'readme.txt': 'ops desk\n',
  'temp.bak': 'stale\n',
}

/**
 * Shell mastery: reinforce fundamentals with contrasts, then advanced tools.
 * Several lessons revisit ls/cat/grep/cd on purpose (spaced practice).
 */
export const masteryLessons: LessonPack[] = [
  {
    id: 'mast-globs',
    title: 'Shell globs',
    track: 'mastery',
    order: 16,
    level: 'core',
    summary: 'Match groups of files with * and ?.',
    prose: [
      'A glob is a pattern the shell expands into matching filenames before the command runs. * means "any string"; ? means "one character".',
      'So ls logs/*.log never literally searches for a star - the shell turns it into ls logs/app.log logs/access.log ... and ls receives the real names.',
      'List only the .log files in ~/logs using a glob (not by typing each name).',
    ],
    goals: [{ id: 'g1', label: 'ls ~/logs/*.log (or cd logs then ls *.log)' }],
    hints: [
      'Ask ls to expand a *.log pattern under logs/ - let the shell expand the star.',
    ],
    unlocks: ['mast-cp-rm'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'ls(\\s+(-\\w+\\s+)*)?(.*/)?\\*\\.log',
        message: 'Use ls with a *.log glob so the shell expands the matches.',
      },
      {
        type: 'stdoutContains',
        text: 'app.log',
        message: 'stdout should list app.log from the glob expansion.',
      },
    ],
  },
  {
    id: 'mast-cp-rm',
    title: 'Copy vs remove',
    track: 'mastery',
    order: 17,
    level: 'core',
    summary: 'cp keeps a source; rm deletes. Contrast with mv.',
    prose: [
      'You already used mv (relocate a name). cp duplicates a file and leaves the source in place. rm deletes a name.',
      'Rule of thumb: mv when the old location should disappear; cp when you need a backup; rm when you are done with a file.',
      'Copy readme.txt to backup.txt, then delete temp.bak.',
    ],
    goals: [
      { id: 'g1', label: 'cp readme.txt backup.txt' },
      { id: 'g2', label: 'rm temp.bak' },
    ],
    hints: [
      'Duplicate readme.txt to a new name backup.txt.',
      'Then delete temp.bak.',
    ],
    unlocks: ['mast-grep-flags'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      { type: 'fileEquals', path: '/home/cadet/backup.txt', content: 'ops desk\n' },
      { type: 'fileExists', path: '/home/cadet/readme.txt' },
      { type: 'fileMissing', path: '/home/cadet/temp.bak' },
    ],
  },
  {
    id: 'mast-grep-flags',
    title: 'grep -v (invert match)',
    track: 'mastery',
    order: 18,
    level: 'core',
    summary: 'Print lines that do not match.',
    prose: [
      'You already used grep PATTERN file to keep matching lines. The -v flag inverts that: print lines that do not match.',
      'Useful for "everything except noise" - for example, drop ERROR lines and keep INFO/WARN.',
      'From app.log, show every line that is not an ERROR line.',
    ],
    goals: [{ id: 'g1', label: 'grep -v ERROR logs/app.log' }],
    hints: [
      'Invert the match: keep lines that are not ERROR in logs/app.log.',
    ],
    unlocks: ['mast-grep-i'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'grep(?=[\\s\\S]*-v)(?=[\\s\\S]*ERROR).*(app\\.log|logs/app\\.log)',
        message: 'Run grep -v ERROR on logs/app.log',
      },
      {
        type: 'stdoutContains',
        text: 'INFO boot',
        message: 'Non-ERROR lines should appear (e.g. INFO boot).',
      },
    ],
  },
  {
    id: 'mast-grep-i',
    title: 'grep -i (ignore case)',
    track: 'mastery',
    order: 19,
    level: 'core',
    summary: 'Case-insensitive search - same tool, new flag.',
    prose: [
      'Logs are messy: sometimes error, sometimes ERROR. grep -i ignores case so both match.',
      'This is spaced practice of grep: same command you learned in fundamentals, new flag, new file (logs/mixed.log).',
      'Print every line in logs/mixed.log that matches error ignoring case.',
    ],
    goals: [{ id: 'g1', label: 'grep -i error logs/mixed.log' }],
    hints: [
      'Ignore case when searching for error in logs/mixed.log.',
    ],
    unlocks: ['mast-head-contrast'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'grep(?=[\\s\\S]*-i)(?=[\\s\\S]*error).*(mixed\\.log)',
        message: 'Run grep -i error on logs/mixed.log',
      },
      { type: 'stdoutContains', text: 'error low' },
      { type: 'stdoutContains', text: 'ERROR high' },
    ],
  },
  {
    id: 'mast-head-contrast',
    title: 'head vs tail',
    track: 'mastery',
    order: 20,
    level: 'core',
    summary: 'Same file, opposite ends - strengthen the pair.',
    prose: [
      'head and tail are a pair: start vs end of a file. Both take -n for a line count.',
      'Revisit them on purpose. You used tail in fundamentals; now use head on a different log.',
      'Print the first line of logs/access.log with head.',
    ],
    goals: [{ id: 'g1', label: 'head -n 1 logs/access.log' }],
    hints: [
      'Show only the first line of logs/access.log.',
    ],
    unlocks: ['mast-find'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'head.*-n\\s*1|head\\s+-1',
        message: 'Use head -n 1 on logs/access.log',
      },
      { type: 'stdoutEquals', text: 'GET /\n' },
    ],
  },
  {
    id: 'mast-find',
    title: 'find by name',
    track: 'mastery',
    order: 21,
    level: 'advanced',
    summary: 'Walk a tree with find -name.',
    prose: [
      'ls shows one directory. find walks a whole tree and prints paths.',
      'find . -name \'*.txt\' means: start here (.), keep paths whose basename matches the glob *.txt. Quote the pattern so the shell does not expand it before find runs.',
      'From home, find every *.txt file under . (including nested notes/).',
    ],
    goals: [{ id: 'g1', label: "find . -name '*.txt'" }],
    hints: [
      'Walk from . and keep paths whose basename matches *.txt.',
      'Quote the pattern so the shell does not expand it first.',
    ],
    unlocks: ['mast-find-pipe'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'find\\s+\\.\\s+-name\\s+[\'"]?\\*\\.txt[\'"]?',
        message: "Run: find . -name '*.txt'",
      },
      {
        type: 'stdoutContains',
        text: 'todo.txt',
        message: 'Output should include notes/todo.txt (or ./notes/todo.txt).',
      },
      {
        type: 'stdoutContains',
        text: 'readme.txt',
        message: 'Output should include ./readme.txt',
      },
    ],
  },
  {
    id: 'mast-find-pipe',
    title: 'find into grep',
    track: 'mastery',
    order: 22,
    level: 'advanced',
    summary: 'Compose find with a pipe to filter paths.',
    prose: [
      'find prints one path per line - perfect stdin for grep. This reuses pipes from fundamentals on a new left-hand command.',
      'Pattern: find START | grep WORD keeps only paths containing WORD.',
      'List paths under logs/, then keep only lines containing app.',
    ],
    goals: [{ id: 'g1', label: 'find logs | grep app' }],
    hints: [
      'Pipe find on logs into grep looking for the substring app.',
    ],
    unlocks: ['mast-cut'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'find\\s+logs.*\\|\\s*grep\\s+app',
        message: 'Pipe find logs into grep app',
      },
      { type: 'stdoutContains', text: 'app.log' },
    ],
  },
  {
    id: 'mast-cut',
    title: 'cut fields',
    track: 'mastery',
    order: 23,
    level: 'advanced',
    summary: 'Pull columns out of delimited text.',
    prose: [
      'cut picks fields (columns) from each line. -d sets the delimiter; -f N keeps field number N (1-based).',
      'CSV-ish example: cut -d\',\' -f1 data/users.csv keeps the name column before the comma.',
      'From data/users.csv, print only the names (field 1).',
    ],
    goals: [{ id: 'g1', label: "cut -d',' -f1 data/users.csv" }],
    hints: [
      'Split on commas and keep field 1 from data/users.csv.',
    ],
    unlocks: ['mast-tee'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'cut.*-d.*,.*-f\\s*1|cut.*-f\\s*1.*-d',
        message: "Use cut with -d',' and -f1 on data/users.csv",
      },
      { type: 'stdoutContains', text: 'ada' },
      { type: 'stdoutContains', text: 'grace' },
    ],
  },
  {
    id: 'mast-tee',
    title: 'tee a pipeline',
    track: 'mastery',
    order: 24,
    level: 'advanced',
    summary: 'Write a copy of the stream while piping onward.',
    prose: [
      'tee FILE copies stdin to FILE and still prints the same bytes on stdout. Think "T-junction" in a pipe.',
      'Common pattern: ... | grep PATTERN | tee out.txt so you both save and see the filtered lines.',
      'Filter ERROR lines from logs/app.log into errors.txt using a pipe and tee.',
    ],
    goals: [{ id: 'g1', label: 'cat logs/app.log | grep ERROR | tee errors.txt' }],
    hints: [
      'Filter ERROR lines, and tee them into errors.txt so they are saved and still printed.',
    ],
    unlocks: ['mast-env'],
    xp: 45,
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'fileContains',
        path: '/home/cadet/errors.txt',
        text: 'ERROR disk',
      },
      {
        type: 'fileContains',
        path: '/home/cadet/errors.txt',
        text: 'ERROR timeout',
      },
      {
        type: 'lastCommandMatches',
        pattern: 'tee\\s+errors\\.txt',
        message: 'Use tee errors.txt in your pipeline',
      },
    ],
  },
  {
    id: 'mast-env',
    title: 'Environment and $HOME',
    track: 'mastery',
    order: 25,
    level: 'advanced',
    summary: 'Read shell variables with $NAME.',
    prose: [
      'The shell keeps named variables (the environment). HOME is your home directory path. USER is your login name.',
      'echo $HOME asks the shell to expand $HOME into the real path, then echo prints it. env lists many variables at once.',
      'Print your home path with echo $HOME.',
    ],
    goals: [{ id: 'g1', label: 'echo $HOME' }],
    hints: [
      'Print the HOME variable with echo and a $ expansion.',
    ],
    unlocks: ['mast-quoting'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: home } },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'echo\\s+\\$HOME',
        message: 'Run: echo $HOME',
      },
      { type: 'stdoutEquals', text: '/home/cadet\n' },
    ],
  },
  {
    id: 'mast-quoting',
    title: 'Quoting spaces',
    track: 'mastery',
    order: 26,
    level: 'advanced',
    summary: 'Create and read a filename that contains a space.',
    prose: [
      'The shell splits command words on spaces. A filename like my notes.txt looks like two words unless you quote it.',
      'Double or single quotes keep the name together: "my notes.txt" or \'my notes.txt\'. Redirects and cat need the same quotes.',
      'Create my notes.txt containing the word ok, then cat it with a quoted path.',
    ],
    goals: [
      { id: 'g1', label: 'Create my notes.txt with content ok' },
      { id: 'g2', label: 'cat the file (quoted path)' },
    ],
    hints: [
      'Create a file whose name contains a space - quote that name.',
      'Then read it back with cat, still quoting the name.',
    ],
    unlocks: ['mast-paths'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: { 'readme.txt': 'ops desk\n' } } },
    },
    checks: [
      { type: 'fileEquals', path: '/home/cadet/my notes.txt', content: 'ok\n' },
      {
        type: 'lastCommandMatches',
        pattern: 'cat\\s+.*my notes\\.txt|cat\\s+[\'"].*notes',
        message: 'Finish by catting my notes.txt with quotes around the name.',
      },
    ],
  },
  {
    id: 'mast-paths',
    title: 'Relative paths and ..',
    track: 'mastery',
    order: 27,
    level: 'core',
    summary: 'Move with cd and climb with ..',
    prose: [
      'You used cd early; this is deliberate practice. .. always means "parent of the working directory".',
      'You start inside notes/. Climb to home with cd .. (not cd ~) so you practice relative navigation.',
      'When Check runs, cwd must be /home/cadet and your last command should be cd ..',
    ],
    goals: [{ id: 'g1', label: 'From ~/notes, cd .. so cwd is /home/cadet' }],
    hints: [
      'You start in notes/. Climb one level with a relative parent path (not ~).',
    ],
    unlocks: ['mast-review-nav'],
    setup: {
      cwd: '/home/cadet/notes',
      files: {
        home: {
          cadet: {
            notes: { 'todo.txt': 'climb up\n' },
            'readme.txt': 'home\n',
          },
        },
      },
    },
    checks: [
      { type: 'cwdIs', path: '/home/cadet' },
      {
        type: 'lastCommandMatches',
        pattern: '^cd\\s+\\.\\.(/home/cadet)?\\s*$',
        message: 'Use cd .. from notes/ (not cd ~) so the parent path sticks.',
      },
    ],
  },
  {
    id: 'mast-review-nav',
    title: 'Drill: navigate and list',
    track: 'mastery',
    order: 28,
    level: 'core',
    summary: 'Reuse pwd, cd, and ls together.',
    prose: [
      'Spaced practice: combine three early commands without learning a new tool.',
      'You start in logs/. Go home with cd .. (or cd ~), then list the directory so readme.txt appears. Finish with pwd showing /home/cadet.',
      'Check looks at your final cwd and that the last successful listing/pwd path makes sense - end by running pwd in home.',
    ],
    goals: [
      { id: 'g1', label: 'Return to /home/cadet' },
      { id: 'g2', label: 'Finish with pwd there' },
    ],
    hints: [
      'Leave logs/ and return home, then finish by printing the working directory.',
    ],
    unlocks: ['mast-review-text'],
    setup: {
      cwd: '/home/cadet/logs',
      files: {
        home: {
          cadet: {
            'readme.txt': 'back home\n',
            logs: { 'app.log': 'INFO only\n' },
          },
        },
      },
    },
    checks: [
      { type: 'cwdIs', path: '/home/cadet' },
      {
        type: 'lastCommandIs',
        command: 'pwd',
        message: 'Finish with pwd once you are in /home/cadet',
      },
      { type: 'stdoutEquals', text: '/home/cadet\n' },
    ],
  },
  {
    id: 'mast-review-text',
    title: 'Drill: read, filter, count',
    track: 'mastery',
    order: 29,
    level: 'core',
    summary: 'Reuse cat, grep, and wc in one pipeline.',
    prose: [
      'Another reinforcement set: cat prints a file, grep keeps matching lines, wc -l counts them. You have used each alone; now chain all three.',
      'Count how many ERROR lines are in logs/app.log using a pipe ending in wc -l. Expect 2.',
    ],
    goals: [{ id: 'g1', label: 'cat logs/app.log | grep ERROR | wc -l' }],
    hints: [
      'Pipe the log through grep for ERROR, then count those lines with wc -l.',
    ],
    unlocks: ['mast-compose'],
    setup: {
      cwd: '/home/cadet',
      files: {
        home: {
          cadet: {
            logs: {
              'app.log': 'INFO boot\nERROR disk\nWARN heat\nERROR timeout\nINFO ok\n',
            },
          },
        },
      },
    },
    checks: [
      {
        type: 'lastCommandMatches',
        pattern: 'grep.*ERROR|ERROR.*grep',
        message: 'Include grep ERROR in the pipeline',
      },
      {
        type: 'lastCommandMatches',
        pattern: 'wc\\s+-l',
        message: 'End with wc -l',
      },
      {
        type: 'stdoutEquals',
        text: '2\n',
        message: 'There are 2 ERROR lines',
      },
    ],
  },
  {
    id: 'mast-compose',
    title: 'Compose: archive a report',
    track: 'mastery',
    order: 30,
    level: 'advanced',
    summary: 'mkdir, redirect, and ls - one small ops story.',
    prose: [
      'Mini lab before the capstone: create out/, write a one-line report with echo and >, then prove the file exists with ls out.',
      'This reuses mkdir, echo, redirects, and ls - no new commands.',
    ],
    goals: [
      { id: 'g1', label: 'mkdir out' },
      { id: 'g2', label: 'echo ready > out/status.txt' },
      { id: 'g3', label: 'ls out shows status.txt' },
    ],
    hints: [
      'Create out/, write a one-line status file into it, then list out/.',
    ],
    unlocks: ['mast-capstone'],
    setup: {
      cwd: '/home/cadet',
      files: { home: { cadet: { 'readme.txt': 'ops\n' } } },
    },
    checks: [
      { type: 'fileEquals', path: '/home/cadet/out/status.txt', content: 'ready\n' },
      {
        type: 'lastCommandMatches',
        pattern: '^ls(\\s+|-)',
        message: 'Finish with ls so status.txt is listed (e.g. ls out)',
      },
      { type: 'stdoutContains', text: 'status.txt' },
    ],
  },
  {
    id: 'mast-capstone',
    title: 'Mastery capstone',
    track: 'mastery',
    order: 31,
    level: 'advanced',
    xp: 60,
    summary: 'Combine mkdir, redirects, grep, and wc in one lab.',
    prose: [
      'Final mastery drill: create reports/, filter ERROR lines from logs/app.log into reports/errors.txt (grep + >), then count those lines with wc -l.',
      'You have practiced each piece. Check wants the directory, the file contents, and a finishing wc -l that reports 2. Passing unlocks the jq workshop.',
    ],
    goals: [
      { id: 'g1', label: 'mkdir reports' },
      { id: 'g2', label: 'Write ERROR lines to reports/errors.txt' },
      { id: 'g3', label: 'wc -l reports/errors.txt shows 2' },
    ],
    hints: [
      'Create reports/, redirect ERROR lines into reports/errors.txt, then count them.',
      'Finish with wc -l so Check sees the count 2.',
    ],
    unlocks: ['jq-identity'],
    setup: {
      cwd: '/home/cadet',
      files: {
        home: {
          cadet: {
            logs: {
              'app.log': 'INFO boot\nERROR disk\nWARN heat\nERROR timeout\nINFO ok\n',
            },
          },
        },
      },
    },
    checks: [
      { type: 'fileExists', path: '/home/cadet/reports' },
      {
        type: 'fileEquals',
        path: '/home/cadet/reports/errors.txt',
        content: 'ERROR disk\nERROR timeout\n',
      },
      {
        type: 'lastCommandMatches',
        pattern: 'wc\\s+(-l\\s+)?reports/errors\\.txt|wc\\s+-l',
        message: 'Finish with wc -l on reports/errors.txt',
      },
      { type: 'stdoutContains', text: '2' },
    ],
  },
]
