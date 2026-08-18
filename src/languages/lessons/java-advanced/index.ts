import type { LanguageLesson } from '../../types'

export const javaMemoryGcLesson: LanguageLesson = {
  id: 'java-memory-gc',
  title: 'Stack, heap, and reachability',
  pathId: 'java-advanced',
  order: 1,
  level: 'advanced',
  summary:
    'Stack vs heap, primitives vs references, the two Errors, and GC roots / reachability.',
  insight:
    'Stack holds frames (primitives and reference arrows). Heap holds objects. GC follows references from roots; it does not "collect" bare ints on the stack.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Picture two places memory lives. The stack is per thread: each method call pushes a frame with local variables and the return address. When the method returns, that frame pops off. The heap is shared: this is where new objects live (new User(), lists, maps, Spring beans). A local variable on the stack often holds only a reference (an arrow) to an object on the heap.',
      why: 'If you only remember one split: short-lived method bookkeeping = stack; objects = heap.',
    },
    {
      narrative:
        'Primitives vs references - this is how locals relate to GC. A primitive local (int count = 3, boolean ok = true) lives in the stack frame itself. There is no separate heap object for that int, so the GC does not collect "the int" - when the method returns, the frame pops and those bits are simply gone. A reference local (User u = new User()) also lives in the stack frame, but it only stores an arrow to a heap object. The User instance sits on the heap. GC cares about objects, and it follows references to decide which objects are still reachable. When u goes out of scope and nothing else points at that User, the object becomes eligible for collection. Same idea for fields: a primitive field is just bytes inside an object; a reference field is another arrow the GC can walk. Boxing matters in interviews: Integer boxed = 3 may create a heap object (with caching caveats for small values), while int x = 3 does not.',
      why: 'Interview line: "Primitives in a frame are not GC-managed objects; references are what keep heap objects alive."',
    },
    {
      narrative:
        'Two Errors point at those two spaces. StackOverflowError means a thread\'s stack ran out of room - usually endless or very deep recursion (too many frames). OutOfMemoryError (the common heap kind) means the heap could not fit another object. Say it in interviews: StackOverflowError → stack; OutOfMemoryError → heap (usually).',
      why: 'Naming the space shows you know where the failure happened, not only that "memory broke."',
    },
    {
      narrative:
        'GC roots are the starting points the collector uses to decide what is still alive. Typical roots: local variables on thread stacks, static fields, and some JNI references. JNI (Java Native Interface) is the bridge that lets Java call native C/C++ code - and lets native code hold onto Java objects. While native code holds a JNI reference to a Java object, that object acts like a GC root so the collector will not free it out from under native code. From each root the GC walks references (like following arrows). Anything it can reach is live. Anything it cannot reach is garbage. Example: method ends, local User u is gone, and nothing else points at that User → freeable. Example leak: a static Map keeps entries forever → still reachable → not freeable.',
      why: 'Everyday roots are stacks and statics. JNI refs show up when native libraries are involved - more detail lives in the classloading / native lesson.',
    },
    {
      narrative:
        'Spring and Boot do not invent a separate memory model. Beans, caches, and listeners are still ordinary heap objects kept alive by references (often from a long-lived Spring context acting like a root). A singleton that keeps a growing list of listeners is a Java reachability leak. The next lesson covers how the heap is subdivided (Eden, Survivors, Old) and how collectors reclaim unreachable objects in practice.',
      why: 'This module answers what stays alive. The generations module answers where objects live and how GC frees them.',
    },
  ],
  codePanes: [
    {
      id: 'prim-vs-ref',
      label: 'Primitives vs references',
      language: 'java',
      code: `void demo() {
  int count = 3;              // primitive in the stack frame
  User u = new User("Ada");   // reference on stack → object on heap

  // When demo() returns:
  // - count disappears with the frame (nothing for GC to free)
  // - if nothing else points at that User, the heap object is garbage
}`,
    },
  ],
  diagrams: [
    {
      id: 'reachability',
      title: 'Reachability from roots',
      caption:
        'GC starts at roots (stack locals, statics, JNI refs) and walks reference arrows. Unreachable heap objects are garbage. Stack primitives are not heap objects.',
      columns: 4,
      rows: 2,
      nodes: [
        {
          id: 'stack',
          label: 'Stack frame',
          detail: 'locals',
          tone: 'muted',
          col: 1,
          row: 1,
        },
        {
          id: 'prim',
          label: 'int count',
          detail: 'in the frame',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'ref',
          label: 'User u',
          detail: 'reference arrow',
          tone: 'accent',
          col: 2,
          row: 2,
        },
        {
          id: 'heap',
          label: 'Heap object',
          detail: 'new User()',
          tone: 'good',
          col: 3,
          row: 2,
        },
        {
          id: 'static',
          label: 'static Map',
          detail: 'GC root',
          tone: 'warn',
          col: 4,
          row: 1,
        },
        {
          id: 'leak',
          label: 'Kept alive',
          detail: 'still reachable',
          tone: 'warn',
          col: 4,
          row: 2,
        },
      ],
      edges: [
        { from: 'stack', to: 'prim', label: 'primitive' },
        { from: 'stack', to: 'ref', label: 'local' },
        { from: 'ref', to: 'heap', label: 'points to' },
        { from: 'static', to: 'leak', label: 'holds refs' },
        { from: 'leak', to: 'heap', label: 'can retain' },
      ],
    },
  ],
  compare: [
    'Java: stack frames hold primitives and references; heap holds objects; GC uses reachability from roots.',
    'Spring: the application context keeps beans reachable - same rule as any static or long-lived root.',
    'Boot: Actuator can show heap pressure; it does not change stack/heap or root rules.',
  ],
  tradeoffs: [
    'Boxing (Integer vs int) can allocate heap objects you did not intend.',
    'Static caches and listener lists are classic accidental roots (leaks).',
    'Deep recursion burns stack (StackOverflowError) long before heap OOMs.',
  ],
  walkthrough: {
    statement:
      'Explain stack vs heap, primitives vs references, the two Errors, and GC roots / reachability.',
    keyIdea:
      'GC manages heap objects reached via references. Stack primitives vanish with the frame. Unreachable from roots → garbage.',
    approach: [
      'Stack vs heap.',
      'Primitives vs references and how that ties to GC.',
      'StackOverflowError vs OutOfMemoryError.',
      'Define GC roots and walk a reachability example (including a static leak).',
      'Bridge: generations and collector mechanics live in the next lesson.',
    ],
  },
  quiz: [
    {
      id: 'q-soe',
      type: 'multipleChoice',
      prompt: 'StackOverflowError usually means which space ran out?',
      choices: [
        'The heap',
        'That thread\'s stack (too many method frames)',
        'Disk space for class files',
        'The Spring container only',
      ],
      answer: 1,
      explain:
        'StackOverflowError is about the call stack filling up - classic deep or infinite recursion.',
    },
    {
      id: 'q-prim',
      type: 'multipleChoice',
      prompt: 'How do local primitives relate to GC?',
      choices: [
        'Every int local is a heap object the GC must free',
        'A local int lives in the stack frame; GC manages heap objects reached via references, not that bare int',
        'Primitives cannot exist on the stack',
        'GC only runs on boolean locals',
      ],
      answer: 1,
      explain:
        'Local primitives are frame data. References are arrows to heap objects - those objects are what GC collects when unreachable.',
    },
    {
      id: 'q-ref',
      type: 'trueFalse',
      prompt:
        'A local reference variable stores an arrow to a heap object; when no references can reach that object anymore, it becomes eligible for GC.',
      answer: true,
      explain:
        'Reachability through references (from GC roots) is the rule. The reference slot itself may live on the stack or inside another object.',
    },
    {
      id: 'q-roots',
      type: 'multipleChoice',
      prompt: 'What are GC roots?',
      choices: [
        'Only objects in the old generation',
        'Starting points (stacks, statics, JNI refs, ...) from which the GC walks to find live objects',
        'Maven dependencies',
        'YAML property keys',
      ],
      answer: 1,
      explain:
        'Roots are where reachability analysis starts. Unreachable from all roots → garbage.',
    },
    {
      id: 'q-oom',
      type: 'trueFalse',
      prompt:
        'OutOfMemoryError (the common heap kind) usually means the heap could not fit another object - not that the call stack ran out of frames.',
      answer: true,
      explain:
        'Heap OOM vs StackOverflowError is the classic stack-vs-heap Error pair.',
    },
  ],
}

export const javaGcGenerationsLesson: LanguageLesson = {
  id: 'java-gc-generations',
  title: 'GC generations and collectors',
  pathId: 'java-advanced',
  order: 2,
  level: 'advanced',
  summary:
    'Eden/Survivor/Old, minor GC, mark/sweep/compact, STW vs concurrent, and JVM flags.',
  insight:
    'Young gen is Eden + two Survivors. Most objects die in Eden. Collectors free what roots cannot reach; long STW pauses hurt production latency.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Prerequisite mindset (from the previous lesson): GC frees heap objects that are unreachable from GC roots. This lesson is about heap layout and how collectors reclaim that space. The heap is split into a young generation and an old generation (tenured). Young is where most new objects start; old holds longer-lived data (caches, session state, many Spring singletons). Mid/senior interviews usually expect the young-gen layout: Eden + two Survivor spaces (often called S0 and S1, or From/To). Eden is where most brand-new allocations land. The two Survivors hold objects that lived through at least one young GC. Only one Survivor is "to-space" at a time; the other is empty and waiting.',
      why: 'Saying only "young vs old" is junior-complete. Naming Eden and Survivors signals you understand how a minor GC actually moves objects.',
    },
    {
      narrative:
        'Minor / young GC walk-through: (1) Objects are allocated in Eden (thread-local allocation buffers aside). (2) When Eden fills, a young GC runs - typically a short stop-the-world pause. (3) Live objects in Eden (and in the current From survivor) are copied into the empty To survivor. Dead objects are simply abandoned - that is why young GC is cheap when most objects die young. (4) The Survivors swap roles (To becomes the next From). (5) If an object survives enough young collections (its age threshold), or if Survivor is too full (overflow), it is promoted into the Old generation. Old collections (major / mixed / full, depending on collector) are less frequent and usually more expensive. See the Eden/Survivor and Object path diagrams.',
      why: 'Interview story: allocate in Eden → copy live to Survivor → promote to Old when aged enough. Dying in Eden is the common, cheap path.',
    },
    {
      narrative:
        'GC phases (simplified lifecycle of a collection): Mark - starting from GC roots, find every reachable object. Sweep - reclaim memory used by objects that were not marked (the garbage). Compact (often) - slide live objects together so free space is one contiguous block and large allocations can succeed. Young collections are often copy collectors (live objects copied to Survivor) rather than mark-sweep in place - same idea of "keep live, drop dead," different mechanics. That mark → sweep → (compact) story plus the Eden→Survivor→Old path is a strong answer to "GC lifecycle." See the GC phases diagram.',
      why: 'Sweep means: free unmarked space. Young gen often copies survivors instead of sweeping Eden in place.',
    },
    {
      narrative:
        'Concurrent vs stop-the-world (STW). Stop-the-world means the JVM pauses application threads while GC does some work - your HTTP handlers and jobs freeze for that pause. Example: a young / Eden collection is often STW but short when the live set in young is small. A full GC or long remark can STW for much longer under pressure. Concurrent GC work means the collector does part of marking or reclaiming while your app still runs - lower pause time, but it uses CPU alongside traffic. Example: G1/ZGC-style collectors try to keep most work concurrent so p99 latency stays smoother. Production impact: long STW pauses show up as latency spikes, timed-out requests, overloaded load balancers, and "the service froze for 800ms." Allocation spikes that thrash Eden cause frequent young GCs and CPU burn even when each pause is small. Tuning starts with allocation rate and live set size, not random flags.',
      why: 'Interview line: "Young/Eden GCs are frequent and should stay short; long STW or promotion failures hurt production latency."',
    },
    {
      narrative:
        'Flags are JVM command-line options that configure memory and collectors. Common ones for mid/senior chats: -Xms / -Xmx (heap size); -Xmn or NewRatio / NewSize family (young size relative to heap - affects how often Eden fills); -XX:SurvivorRatio (Eden vs each Survivor size); -XX:MaxTenuringThreshold (how many young GCs before promotion to Old); -XX:+UseG1GC (common collector); -Xlog:gc* for pause logs. Flags do not invent a second memory model - they size Eden/Survivor/Old and pick collector behavior. Prefer measuring (GC logs, allocation profiles, promotion rate) before flipping flags in production.',
      why: 'Flags = knobs on Eden/Survivor/Old and the collector. Know what you are sizing, not a cargo-cult list.',
    },
    {
      narrative:
        'Spring and Boot use the same JVM regions. Short-lived request DTOs usually die in Eden; long-lived singletons and caches often live in Old. Boot Actuator can expose heap and GC metrics; it does not replace understanding Eden, promotion, and STW. If Old fills with retained listeners or unbounded caches, you still debug reachability first (previous lesson), then generation pressure and pause behavior.',
      why: 'Framework code allocates on the heap too. Request churn hits Eden; caches and singletons pressure Old.',
    },
  ],
  diagrams: [
    {
      id: 'eden-survivor',
      title: 'Young generation layout',
      caption:
        'Eden takes new allocations. Live objects are copied into the empty Survivor (To). After enough survivals, objects promote to Old.',
      columns: 4,
      rows: 2,
      nodes: [
        {
          id: 'alloc',
          label: 'new Object()',
          detail: 'most allocations',
          tone: 'accent',
          col: 1,
          row: 1,
        },
        {
          id: 'eden',
          label: 'Eden',
          detail: 'nursery',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 's0',
          label: 'Survivor S0',
          detail: 'From / To',
          tone: 'warn',
          col: 3,
          row: 1,
        },
        {
          id: 's1',
          label: 'Survivor S1',
          detail: 'From / To',
          tone: 'warn',
          col: 4,
          row: 1,
        },
        {
          id: 'minor',
          label: 'Young GC',
          detail: 'copy live → To',
          tone: 'accent',
          col: 2,
          row: 2,
        },
        {
          id: 'old',
          label: 'Old',
          detail: 'promotion',
          tone: 'good',
          col: 4,
          row: 2,
        },
      ],
      edges: [
        { from: 'alloc', to: 'eden', label: 'allocate' },
        { from: 'eden', to: 'minor' },
        { from: 'minor', to: 's0', label: 'copy live' },
        { from: 'minor', to: 's1', label: 'swap roles' },
        { from: 's0', to: 'old', label: 'aged enough' },
        { from: 's1', to: 'old', label: 'or overflow' },
      ],
    },
    {
      id: 'object-path',
      title: 'Object path',
      caption:
        'Die in Eden (common) → survive via Survivors → promote to Old → reclaim when unreachable from GC roots.',
      columns: 4,
      rows: 2,
      nodes: [
        {
          id: 'eden2',
          label: 'Eden',
          detail: 'born here',
          tone: 'window',
          col: 1,
          row: 1,
        },
        {
          id: 'surv',
          label: 'Survivors',
          detail: 'S0 ↔ S1',
          tone: 'warn',
          col: 2,
          row: 1,
        },
        {
          id: 'old2',
          label: 'Old',
          detail: 'long-lived',
          tone: 'accent',
          col: 3,
          row: 1,
        },
        {
          id: 'reclaim',
          label: 'Reclaim',
          detail: 'unreachable',
          tone: 'good',
          col: 4,
          row: 1,
        },
        {
          id: 'die',
          label: 'Die in Eden',
          detail: 'most objects',
          tone: 'muted',
          col: 1,
          row: 2,
        },
        {
          id: 'roots2',
          label: 'GC roots',
          detail: 'decide live',
          tone: 'muted',
          col: 3,
          row: 2,
        },
      ],
      edges: [
        { from: 'eden2', to: 'surv', label: 'survive GC' },
        { from: 'surv', to: 'old2', label: 'promote' },
        { from: 'old2', to: 'reclaim' },
        { from: 'eden2', to: 'die', label: 'common' },
        { from: 'roots2', to: 'old2', label: 'keep alive' },
      ],
    },
    {
      id: 'gc-phases',
      title: 'GC phases',
      caption:
        'Mark finds live objects from roots. Sweep frees the rest. Compact packs live data. Young GCs often copy to Survivor instead of sweeping Eden in place.',
      columns: 4,
      rows: 2,
      nodes: [
        {
          id: 'roots',
          label: 'GC roots',
          detail: 'stacks · statics · JNI',
          tone: 'muted',
          col: 1,
          row: 1,
        },
        {
          id: 'mark',
          label: 'Mark',
          detail: 'find live',
          tone: 'accent',
          col: 2,
          row: 1,
        },
        {
          id: 'sweep',
          label: 'Sweep',
          detail: 'free garbage',
          tone: 'window',
          col: 3,
          row: 1,
        },
        {
          id: 'compact',
          label: 'Compact',
          detail: 'pack live',
          tone: 'good',
          col: 4,
          row: 1,
        },
        {
          id: 'stw',
          label: 'STW pauses',
          detail: 'app threads freeze',
          tone: 'warn',
          col: 2,
          row: 2,
        },
        {
          id: 'concurrent',
          label: 'Concurrent',
          detail: 'app still runs',
          tone: 'window',
          col: 3,
          row: 2,
        },
      ],
      edges: [
        { from: 'roots', to: 'mark', label: 'walk' },
        { from: 'mark', to: 'sweep' },
        { from: 'sweep', to: 'compact' },
        { from: 'mark', to: 'stw', label: 'some work' },
        { from: 'mark', to: 'concurrent', label: 'some work' },
      ],
    },
  ],
  compare: [
    'Java: young = Eden + S0/S1; old = tenured; mark/sweep (or copy) + STW vs concurrent.',
    'Spring: request objects often die in Eden; singletons/caches often live in Old.',
    'Boot: same JVM regions; metrics help observe heap/GC, they do not change the model.',
  ],
  tradeoffs: [
    'Small young/Eden → frequent young GCs; oversized young → longer young pauses when live set is big.',
    'Low tenuring threshold → premature promotion and Old pressure; high threshold → Survivor overflow risk.',
    'Unbounded caches risk heap OutOfMemoryError in Old.',
    'Lower STW (more concurrent GC) usually costs more CPU alongside traffic.',
  ],
  walkthrough: {
    statement:
      'Explain Eden/Survivor/Old, minor GC, mark/sweep (or copy), STW vs concurrent, and flags.',
    keyIdea:
      'Allocate in Eden; copy live to Survivors; promote to Old; reclaim when unreachable. Young GCs should stay short or production latency suffers.',
    approach: [
      'Young vs old; Eden + S0/S1 layout.',
      'Minor-GC copy story and promotion.',
      'Mark / sweep / compact (and young copy collectors).',
      'STW vs concurrent + production impact.',
      'Flags that size young/Survivor/tenuring - measure before tuning.',
    ],
  },
  quiz: [
    {
      id: 'q-eden',
      type: 'multipleChoice',
      prompt: 'Where do most brand-new Java objects get allocated first?',
      choices: [
        'Old generation only',
        'Eden (inside the young generation)',
        'The native stack frame itself',
        'Survivor To-space only',
      ],
      answer: 1,
      explain:
        'Eden is the nursery. Survivors hold objects that already lived through a young GC.',
    },
    {
      id: 'q-surv',
      type: 'multipleChoice',
      prompt: 'What are the Survivor spaces for?',
      choices: [
        'Storing class files on disk',
        'Holding objects that survived young GCs, copying live objects between S0 and S1',
        'Replacing GC roots',
        'Only Spring singleton beans',
      ],
      answer: 1,
      explain:
        'Two Survivors (From/To) let a young GC copy live objects into the empty space; aged objects promote to Old.',
    },
    {
      id: 'q-sweep',
      type: 'multipleChoice',
      prompt: 'In mark/sweep, what does sweep do?',
      choices: [
        'Allocates new stack frames',
        'Reclaims memory from objects that were not marked live',
        'Compiles Java to native code',
        'Starts Tomcat',
      ],
      answer: 1,
      explain: 'Mark finds live objects; sweep frees the unmarked garbage.',
    },
    {
      id: 'q-stw',
      type: 'trueFalse',
      prompt:
        'A long stop-the-world GC pause can cause request latency spikes in a production HTTP service.',
      answer: true,
      explain:
        'STW freezes app threads. Tail latency and timeouts are the usual production symptom.',
    },
    {
      id: 'q-flags',
      type: 'multipleChoice',
      prompt: 'SurvivorRatio / MaxTenuringThreshold mainly affect:',
      choices: [
        'HTTP status codes',
        'Young-gen sizing and how quickly objects promote from Survivors to Old',
        'SQL isolation only',
        'Whether Java needs a JVM',
      ],
      answer: 1,
      explain:
        'Those flags tune Eden/Survivor shape and promotion age - mid/senior interview territory.',
    },
    {
      id: 'q-promote',
      type: 'trueFalse',
      prompt:
        'Objects that survive enough young GCs (or overflow Survivors) are typically promoted into the Old generation.',
      answer: true,
      explain:
        'Promotion is the bridge from young to Old - important for understanding Old pressure.',
    },
  ],
}

export const javaConcurrencyLesson: LanguageLesson = {
  id: 'java-concurrency',
  title: 'Concurrency and happens-before',
  pathId: 'java-advanced',
  order: 3,
  level: 'advanced',
  summary: 'volatile, synchronized, locks, and concurrent collection traps.',
  insight:
    'Visibility and atomicity are different. Happens-before is the contract; guessing about timing is not.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Without synchronization, one thread\'s writes may be invisible to another (CPU caches, reordering). The JMM defines happens-before edges that restore visibility and ordering.',
      why: 'Interviewers want "visibility" vocabulary, not "sometimes it works on my laptop."',
    },
    {
      narrative:
        'synchronized / Lock give mutual exclusion and happen-before between unlock and later lock on the same monitor. volatile gives visibility for that variable\'s reads/writes, not atomic compound actions (i++).',
      why: 'volatile boolean flag is fine; volatile counter++ is not enough.',
    },
    {
      narrative:
        'ConcurrentHashMap allows concurrent readers/writers safely for single ops. Iterators are weakly consistent. Compound actions (check-then-act) still need care (compute, putIfAbsent).',
      why: 'Collections.synchronizedMap locks the whole map; CHM is usually preferred for concurrency.',
    },
    {
      narrative:
        'Spring @Transactional and singletons do not make your code thread-safe. Controllers are typically singleton-scoped - mutable fields are shared across requests.',
      why: 'Framework concurrency ≠ language concurrency. State in request scope or keep services stateless.',
    },
  ],
  compare: [
    'Java: JMM, monitors, j.u.c utilities.',
    'Spring: often one singleton bean per type - shared mutable fields are racy.',
    'Boot: thread pools for web/async; still your job to avoid shared mutable state.',
  ],
  tradeoffs: [
    'Coarse locks are simple and can limit throughput.',
    'Lock-free structures are harder to reason about.',
    'Immutable designs reduce races at the cost of allocation.',
  ],
  walkthrough: {
    statement: 'Two threads update shared state; results look impossible.',
    keyIdea: 'Missing happens-before or non-atomic check-then-act.',
    approach: [
      'Identify shared mutable state.',
      'Pick synchronized/Lock/atomic/CHM appropriately.',
      'Avoid mutable fields on singleton Spring beans.',
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'Declaring int count volatile makes count++ atomic.',
      answer: false,
      explain: 'volatile helps visibility; ++ is read-modify-write. Use AtomicInteger or lock.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Default Spring @Service beans are usually:',
      choices: ['Prototype per call', 'Singleton shared across requests', 'Thread-scoped automatically', 'Stack-allocated'],
      answer: 1,
      explain: 'Singleton is the default scope - shared across threads handling requests.',
    },
  ],
}

export const javaEqualsHashLesson: LanguageLesson = {
  id: 'java-equals-hash',
  title: 'Equals, hashCode, immutability, records',
  pathId: 'java-advanced',
  order: 4,
  level: 'advanced',
  summary: 'Contract for maps/sets, and why records help.',
  insight:
    'Equal objects must share hashCode. Prefer immutable keys. Records give canonical equals/hashCode.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'equals must be reflexive, symmetric, transitive, consistent, and false for null. hashCode must agree: if a.equals(b) then a.hashCode()==b.hashCode().',
      why: 'Break the contract and HashMap/HashSet behave randomly under load.',
    },
    {
      narrative:
        'Mutable keys are dangerous: mutate a field used in hashCode after insert and you lose the entry. Prefer records or final fields for map keys.',
      why: 'Classic interview bug demonstration.',
    },
    {
      narrative:
        'record Person(String name, int age) {} generates ctor, accessors, equals, hashCode, toString. Great for plain data; not for JPA entities with proxies/lazy fields.',
      why: 'Know when records fit - and when frameworks want JavaBeans-style entities.',
    },
  ],
  compare: [
    'Java: language contract for equality.',
    'Spring: bean identity ≠ equals; container cares about bean names/types.',
    'Boot/JPA: entity equality is a separate debate (id vs fields) - do not casually use records as entities.',
  ],
  tradeoffs: [
    'Business-key equals vs id equals for entities.',
    'Records reduce boilerplate but limit inheritance.',
  ],
  walkthrough: {
    statement: 'Objects disappear from a HashSet after mutation.',
    keyIdea: 'hashCode changed; bucket no longer matches.',
    approach: ['Keep keys immutable', 'Honor equals/hashCode contract', 'Consider record'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'If a.equals(b) is true, a.hashCode() must equal b.hashCode().',
      answer: true,
      explain: 'Required contract for hash-based collections.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Safest HashMap key style?',
      choices: [
        'Mutable object you keep changing',
        'Immutable value / record',
        'Anonymous class with random hashCode',
        'Thread itself',
      ],
      answer: 1,
      explain: 'Immutable keys keep hashCode stable after insertion.',
    },
  ],
}

export const javaGenericsLesson: LanguageLesson = {
  id: 'java-generics',
  title: 'Generics, erasure, PECS',
  pathId: 'java-advanced',
  order: 5,
  level: 'advanced',
  summary: 'Type erasure, wildcards, producer-extends consumer-super.',
  insight:
    'Generics are compile-time. At runtime most of the type arguments are erased. PECS guides wildcards.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'List<String> and List<Integer> erase to List at runtime. You cannot new T() or create generic arrays cleanly. Overloads cannot differ only by type parameters.',
      why: 'Explains ClassCastExceptions at the edges and why reified generics are a Kotlin/other discussion.',
    },
    {
      narrative:
        'PECS: producer extends (List<? extends Number> - you read Numbers), consumer super (List<? super Integer> - you write Integers). Use exact type when you read and write.',
      why: 'Wildcard interviews are common; PECS is the short answer.',
    },
    {
      narrative:
        'Spring APIs (RestTemplate/WebClient, ConversionService) use generics heavily. Boot does not remove erasure - JSON binding still needs TypeReference for generic types.',
      why: 'Layer reminder: framework sugar, same JVM erasure.',
    },
  ],
  compare: [
    'Java: erasure + wildcards.',
    'Spring: generic ApplicationContext.getBean(Class<T>) still needs Class tokens.',
    'Boot: Jackson TypeReference for List<Foo> etc.',
  ],
  tradeoffs: [
    'Wildcards increase API flexibility and reading cost.',
    'Raw types silence the compiler and invite heap pollution.',
  ],
  walkthrough: {
    statement: 'Design a copy method between typed lists.',
    keyIdea: 'PECS: src extends T, dest super T.',
    approach: ['Avoid raw types', 'Apply PECS', 'Remember erasure limits'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'PECS says a producer wildcard should use:',
      choices: ['? super T', '? extends T', 'T only', 'Object only'],
      answer: 1,
      explain: 'Producer-extends: you pull T (or subtype) out.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'At runtime you can normally distinguish List<String> from List<Integer> via the List object\'s class.',
      answer: false,
      explain: 'Both erase to List; runtime class does not carry the type argument.',
    },
  ],
}

export const javaStreamsOptionalLesson: LanguageLesson = {
  id: 'java-streams-optional',
  title: 'Streams and Optional pitfalls',
  pathId: 'java-advanced',
  order: 6,
  level: 'advanced',
  summary: 'Laziness, checked exceptions, parallel abuse, Optional as fields.',
  insight:
    'Streams are lazy until a terminal op. Optional is for return types, not a bean field fashion.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Intermediate ops are lazy; nothing runs until collect/forEach/etc. Side effects inside map are a smell - prefer pure transforms.',
      why: 'Debugging "why didn\'t map run?" → missing terminal operation.',
    },
    {
      narrative:
        'Checked exceptions do not nest cleanly in lambdas. Parallel streams share a common ForkJoinPool by default - easy to starve under load.',
      why: 'Interview: when not to parallelize (small data, blocking IO).',
    },
    {
      narrative:
        'Optional should wrap return values that may be absent. Avoid Optional fields, Optional parameters, and Optional.get() without isPresent/orElse.',
      why: 'Spring Data returns Optional for findById - good. Optional everywhere else - noisy.',
    },
  ],
  compare: [
    'Java: Stream/Optional in java.util.',
    'Spring Data: Optional for maybe-empty queries.',
    'Boot: same libraries; no special Stream runtime.',
  ],
  tradeoffs: [
    'Parallel helps CPU-bound large datasets; hurts tiny lists and blocking calls.',
    'Optional clarifies absence vs null; overuse clutters APIs.',
  ],
  walkthrough: {
    statement: 'Candidate parallelizes a stream that calls a remote HTTP API per element.',
    keyIdea: 'Blocking work on ForkJoinPool is a trap.',
    approach: ['Prefer sequential or dedicated pool', 'Keep map pure', 'Use Optional at API boundaries'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'stream.map(...) runs immediately when map is called.',
      answer: false,
      explain: 'Intermediate ops are lazy until a terminal operation.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Best use of Optional?',
      choices: [
        'Field on every JPA entity',
        'Return type for "maybe missing"',
        'Replace all null checks in the JVM',
        'Method parameter for every String',
      ],
      answer: 1,
      explain: 'Return types are the sweet spot.',
    },
  ],
}

export const javaClassloadingModernLesson: LanguageLesson = {
  id: 'java-classloading-modern',
  title: 'Classloading, reflection, JNI, modern Java',
  pathId: 'java-advanced',
  order: 7,
  level: 'advanced',
  summary:
    'ClassLoaders, JNI (native bridge), reflection costs, sealed types and pattern matching.',
  insight:
    'Frameworks use reflection and proxies heavily. JNI is how Java talks to native code. Modern Java adds sealed hierarchies and pattern matching.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Classes are loaded by ClassLoaders (bootstrap, platform, app). Spring Boot fat jars use a custom loader to nest jars. ClassNotFound vs NoClassDefFound differ (load fail vs earlier init fail).',
      why: 'Useful when Boot "works in IDE, fails in jar."',
    },
    {
      narrative:
        'JNI (Java Native Interface) is the standard way for Java to call native libraries written in C/C++ (and for native code to call back into Java). You declare a native method in Java; a matching native library implements it; System.loadLibrary (or similar) loads that library. Examples you may meet: compression/crypto libraries, older database drivers, OS-specific hooks. Costs and risks: leaving the managed Java world (crashes in native code can take down the JVM), harder debugging, and GC interactions - native code that keeps a JNI reference to a Java object keeps that object alive (those references are GC roots, covered in Stack, heap, and reachability).',
      why: 'Interview one-liner: "JNI is the bridge between Java and native C/C++." Most Spring Boot services never write JNI, but you should recognize the acronym when GC roots or "native method" come up.',
    },
    {
      narrative:
        'Reflection breaks encapsulation and is slower; Spring uses it for wiring and Boot for auto-config conditions. Prefer constructors and interfaces in your own code.',
      why: 'Know why frameworks need it; avoid it in hot app logic.',
    },
    {
      narrative:
        'Sealed classes restrict who may extend. Pattern matching switch reduces casts. Good interview signal that you follow current LTS features without cargo-culting.',
      why: 'Advanced Java is not only Java 8 streams.',
    },
  ],
  compare: [
    'Java: ClassLoaders, JNI for native interop, reflection, modern language features.',
    'Spring: reflection + CGLIB/JDK proxies for AOP - rarely hand-written JNI.',
    'Boot: nested jar ClassLoader; auto-config uses classpath conditions.',
  ],
  tradeoffs: [
    'JNI unlocks native speed/OS APIs but loses memory safety and crash isolation.',
    'Reflection flexibility vs clarity and speed.',
    'Sealed hierarchies vs open extension for plugins.',
  ],
  walkthrough: {
    statement: 'App fails only when launched from the Boot fat jar - or someone asks what JNI is.',
    keyIdea:
      'ClassLoader / packaging differences explain jar issues. JNI is the Java↔native bridge; JNI refs can pin objects for GC.',
    approach: [
      'Compare IDE classpath vs nested jars for ClassNotFound.',
      'Define JNI as Java Native Interface (call C/C++ / callbacks).',
      'Tie JNI references back to GC roots if memory comes up.',
    ],
  },
  quiz: [
    {
      id: 'q-jni',
      type: 'multipleChoice',
      prompt: 'What is JNI?',
      choices: [
        'A Spring Boot starter for JSON',
        'Java Native Interface - the bridge between Java and native C/C++ code',
        'A garbage collector algorithm',
        'A Maven BOM',
      ],
      answer: 1,
      explain:
        'JNI lets Java call native libraries and lets native code interact with Java objects. JNI references can act as GC roots.',
    },
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Spring AOP often relies on:',
      choices: [
        'Manual goto',
        'Proxies (JDK or CGLIB)',
        'Editing bytecode by hand each request',
        'Deleting the JVM verifier',
      ],
      answer: 1,
      explain: 'Proxies intercept calls for transactions/security/etc.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'Sealed classes let any classpath type extend them freely.',
      answer: false,
      explain: 'Sealed hierarchies explicitly permit subclasses.',
    },
  ],
}

export const javaCollectionsHashMapLesson: LanguageLesson = {
  id: 'java-collections-hashmap',
  title: 'Collections and HashMap talking points',
  pathId: 'java-advanced',
  order: 8,
  level: 'advanced',
  summary: 'Fail-fast iterators, CHM, and HashMap internals at interview depth.',
  insight:
    'HashMap is array + trees for collided bins. Structural modification during fail-fast iteration throws CME.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'ArrayList/HashMap iterators are fail-fast: concurrent structural change (same thread or not) can throw ConcurrentModificationException. ConcurrentHashMap iterators are weakly consistent.',
      why: 'Know which collection you are iterating under concurrency.',
    },
    {
      narrative:
        'HashMap: hash → tab index, linked list or tree bins (after collisions grow). Capacity powers of two; resize is costly. null key allowed in HashMap, not in ConcurrentHashMap / Hashtable.',
      why: 'Enough internals for interviews without claiming you wrote HotSpot.',
    },
    {
      narrative:
        'Spring singleton maps as caches need bounds and concurrency policy - a raw HashMap field is a bug under web traffic.',
      why: 'Tie advanced Java back to real service mistakes.',
    },
  ],
  compare: [
    'Java: collection contracts and implementations.',
    'Spring: do not store request state in unsynchronized HashMap fields on singletons.',
    'Boot: same advice; actuators will not save a racy cache.',
  ],
  tradeoffs: [
    'HashMap speed vs ConcurrentHashMap concurrency.',
    'Treeify bins help worst-case lookups, cost memory.',
  ],
  walkthrough: {
    statement: 'CME while iterating a list you also modify.',
    keyIdea: 'Fail-fast iterator detected structural change.',
    approach: ['Use iterator.remove', 'Collect then remove', 'Or concurrent collection if multi-threaded'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'ConcurrentHashMap allows a null key.',
      answer: false,
      explain: 'CHM disallows null keys and null values.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Fail-fast iterators in ArrayList react to structural modification by:',
      choices: ['Silently skipping', 'Throwing ConcurrentModificationException (typically)', 'Locking the JVM', 'Switching to CHM'],
      answer: 1,
      explain: 'Best-effort CME is the documented behavior.',
    },
  ],
}
