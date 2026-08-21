import type { LanguageLesson } from '../../types'

export const javaMemoryGcLesson: LanguageLesson = {
  id: 'java-memory-gc',
  title: 'Stack, heap, and reachability',
  pathId: 'java-advanced',
  order: 1,
  level: 'advanced',
  summary:
    'Restaurant analogy for stack vs heap, what lives where, GC roots, and the two Errors.',
  insight:
    'Stack is the waiter\'s notepad (per method, automatic). Heap is the kitchen store room (objects, shared). GC is the porter who throws out ingredients nobody points to anymore.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'The analogy. Think of your program as a restaurant. The stack is the waiter\'s notepad: small, fast, temporary. Each method call is an order - it gets a page (a stack frame). When the method returns, that page is ripped off and gone. No cleanup crew needed. The heap is the kitchen storage room: big, shared, longer-lived. Objects (ingredients) live here. Anyone with a reference can use them. Nobody cleans the room automatically except the garbage collector - the kitchen porter who periodically throws out ingredients that no waiter\'s notepad (and no other root) still points to.',
      why: 'Stack = notepad pages. Heap = store room. GC = porter for unused ingredients.',
    },
    {
      narrative:
        'Stack memory - what lives here. Primitive locals (int quantity = 3), method parameters, and local references (the pointer/arrow, not the object itself). Each thread has its own stack - waiters do not share notepads. The stack is small and very fast. Lifetime is automatic: when the method ends, the frame is destroyed. If you nest too many calls (usually infinite recursion), you get StackOverflowError - the notepad ran out of pages.',
      why: 'Stack: small, fast, per-thread, dies with the method. Overflow → StackOverflowError.',
    },
    {
      narrative:
        'Heap memory - what lives here. Everything created with new: objects, arrays, most Strings. The heap is large (you size it with -Xms / -Xmx in the tuning lesson). It is shared by all threads, so concurrent access needs care later. Objects live until nothing reachable points at them and GC reclaims them. If the heap cannot fit another allocation, you get OutOfMemoryError. Interview pair: StackOverflowError → stack; OutOfMemoryError → heap (usually).',
      why: 'Heap: large, shared, holds objects. Overflow → OutOfMemoryError.',
    },
    {
      narrative:
        'Primitives vs references on the notepad. int quantity = 3 sits on the stack page itself - not a heap object, so GC does not collect "the int." Pizza pizza = new Pizza() puts a reference (arrow) on the stack page and the actual Pizza in the heap store room. When the method ends, the arrow is gone with the page. If nothing else still points at that Pizza, it is garbage.',
      why: 'Reference on stack, object on heap. GC only manages heap objects.',
    },
    {
      narrative:
        'How GC decides garbage. An object is garbage if no chain of references can reach it from a GC root. Roots include: local variables on live stacks, static fields, and a few special cases (JNI). Example: Pizza a = new Pizza(); Pizza b = new Pizza(); a = b; - the first Pizza is unreachable and freeable. Classic leak: a static Map that keeps growing - still reachable from a root, so GC will not free it. Spring beans follow the same rule: the application context keeps them reachable (see Beans, scopes, and the GC).',
      why: 'Alive = reachable from a root. Unreachable = garbage. Statics can accidentally keep things forever.',
    },
  ],
  codePanes: [
    {
      id: 'stack-heap',
      label: 'Stack notepad vs heap store room',
      language: 'java',
      code: `public void makeOrder() {
  int quantity = 3;            // on the stack (notepad)
  double price = 9.99;         // on the stack
  Pizza pizza = new Pizza();   // reference on stack → Pizza object on HEAP
}
// method ends → stack frame gone; Pizza is garbage if nothing else points to it

Pizza a = new Pizza();  // Pizza@1 reachable via a
Pizza b = new Pizza();  // Pizza@2 reachable via b
a = b;                  // Pizza@1 unreachable → garbage`,
    },
  ],
  diagrams: [
    {
      id: 'reachability',
      title: 'Notepad and store room',
      caption:
        'Stack holds primitives and arrows. Heap holds objects. Roots (stack locals, statics) decide what the porter may throw away.',
      columns: 3,
      rows: 2,
      nodes: [
        {
          id: 'stack',
          label: 'Stack (notepad)',
          detail: 'per method / thread',
          tone: 'muted',
          col: 1,
          row: 1,
        },
        {
          id: 'prim',
          label: 'int quantity',
          detail: 'on the page',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'ref',
          label: 'Pizza pizza',
          detail: 'arrow only',
          tone: 'accent',
          col: 2,
          row: 2,
        },
        {
          id: 'heap',
          label: 'Heap (store room)',
          detail: 'new Pizza()',
          tone: 'good',
          col: 3,
          row: 2,
        },
        {
          id: 'static',
          label: 'static Map',
          detail: 'keeps arrows',
          tone: 'warn',
          col: 3,
          row: 1,
        },
      ],
      edges: [
        { from: 'stack', to: 'prim' },
        { from: 'stack', to: 'ref' },
        { from: 'ref', to: 'heap', label: 'points to' },
        { from: 'static', to: 'heap', label: 'may retain' },
      ],
    },
  ],
  compare: [
    'Java: stack notepad vs heap store room; GC frees unreachable heap objects.',
    'Spring: context keeps beans reachable - same reachability rule.',
    'Boot: same JVM model; metrics observe it, they do not change it.',
  ],
  tradeoffs: [
    'Static collections that grow forever are still reachable - GC cannot help.',
    'Deep recursion exhausts the notepad (StackOverflowError) before the store room fills.',
  ],
  walkthrough: {
    statement: 'Explain stack vs heap with the restaurant analogy, then reachability and the two Errors.',
    keyIdea:
      'Notepad = stack (automatic). Store room = heap (objects). Porter = GC for unreachable objects.',
    approach: [
      'Analogy: notepad vs store room vs porter.',
      'What lives on stack vs heap; primitives vs references.',
      'StackOverflowError vs OutOfMemoryError.',
      'GC roots and a static-map leak.',
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
      explain: 'Too many frames on the call stack - the notepad ran out of pages.',
    },
    {
      id: 'q-prim',
      type: 'multipleChoice',
      prompt: 'How do local primitives relate to GC?',
      choices: [
        'Every int local is a heap object the GC must free',
        'A local int lives in the stack frame; GC manages heap objects reached via references',
        'Primitives cannot exist on the stack',
        'GC only runs on boolean locals',
      ],
      answer: 1,
      explain:
        'Locals like int sit on the notepad. Heap objects reached by arrows are what GC collects.',
    },
    {
      id: 'q-roots',
      type: 'multipleChoice',
      prompt: 'What makes a heap object stay alive?',
      choices: [
        'It was created with new, so it lives forever',
        'It is still reachable from a GC root by following references',
        'It lives on the stack frame itself',
        'Spring Boot auto-config protects it',
      ],
      answer: 1,
      explain: 'Reachability from roots (stacks, statics, ...) is the rule.',
    },
    {
      id: 'q-oom',
      type: 'trueFalse',
      prompt:
        'OutOfMemoryError (the common heap kind) usually means the heap could not fit another object.',
      answer: true,
      explain: 'Heap OOM vs StackOverflowError is the store-room vs notepad Error pair.',
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
    'Why GC exists, young/old layout (Eden/Survivors), object lifecycle, STW, and named collectors.',
  insight:
    'Most objects die young. Eden → Survivors → Old. Minor GC is frequent and cheap; full GC is rarer and can pause the app. Collectors trade throughput vs pause time.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Why the garbage collector exists. In C/C++ you manually free memory. Forget → leak. Free twice → crash. Java\'s GC automatically reclaims heap objects that are no longer reachable from any GC root. Continuing the restaurant picture: the porter walks the store room and throws out ingredients nobody\'s notepad (or other root) still points to. You do not call free(). System.gc() is only a suggestion - the JVM may ignore it; never rely on it in production.',
      why: 'GC removes a whole class of manual free bugs. Reachability still decides what stays.',
    },
    {
      narrative:
        'Generational heap (most objects die young). The store room is split so the porter can clean the busy front shelves often and the back shelves rarely. Young generation (small, cleaned often): Eden - where new objects land; Survivor S0 and S1 - holding objects that lived through at least one young GC. Old generation (larger, cleaned less often): long-lived objects promoted from young (caches, session state, many Spring singletons). Minor GC cleans young gen - usually fast. Major/Full GC deals with old gen - slower, can pause the app longer.',
      why: 'Young = front shelves (Eden + Survivors). Old = back stock. Most pizzas never leave Eden.',
    },
    {
      narrative:
        'Lifecycle of an object. (1) Created in Eden. (2) Survives a Minor GC → copied into a Survivor space. (3) Survives enough young GCs (or overflows Survivors) → promoted to Old. (4) Becomes unreachable → reclaimed in a later collection. Dead objects in Eden are simply abandoned - that is why young GC is cheap when most objects die young. See the diagrams below.',
      why: 'Eden → Survivor → Old → reclaim when unreachable.',
    },
    {
      narrative:
        'Mark / sweep / compact (and STW). Mark: from GC roots, find every reachable object. Sweep: free memory of unmarked objects. Compact (often): slide live objects together so free space is one block. Stop-the-world (STW) means the JVM pauses your app threads while some GC work runs - handlers freeze for that moment. Young GCs are often short STW. Concurrent collectors do more work while the app still runs (G1/ZGC style) - shorter pauses, more CPU. Long STW shows up as latency spikes and timeouts.',
      why: 'Mark finds live; sweep frees dead. STW = app paused. Concurrent = app keeps running during more of the work.',
    },
    {
      narrative:
        'Named collectors (senior interview cheat sheet). Serial: simple, single-threaded, fine for tiny apps - stops the world. Parallel (throughput): many GC threads, still STW - good when you care about batch throughput more than the shortest pause. G1 (common default): heap in regions, aims at pause-time goals - balanced general purpose. ZGC / Shenandoah: ultra-low pause, most work concurrent - for latency-sensitive services, at some CPU cost. CMS is a historical low-pause name; know it existed. Same reachability rule for all - the algorithm changes pauses, not what counts as garbage. Select with flags like -XX:+UseG1GC or -XX:+UseZGC (tuning lesson).',
      why: 'Parallel = throughput. G1 = balanced default. ZGC/Shenandoah = very low pause.',
    },
    {
      narrative:
        'Common follow-ups. Memory leaks in Java are objects still reachable but no longer needed: static collections that grow forever, listeners never unregistered, ThreadLocals not cleared, unclosed resources. Spring request DTOs usually die in Eden; singletons/caches often live in Old. Actuator shows pressure - it does not fix a retaining reference. Next lesson: flags and code habits.',
      why: 'Leak = still reachable. Force GC? System.gc() is a hint, not a guarantee.',
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
    {
      id: 'named-collectors',
      title: 'Named collectors (sketch)',
      caption:
        'Same garbage rule for all. Serial/Parallel lean STW; G1 balances; ZGC/Shenandoah chase very short pauses.',
      columns: 5,
      rows: 1,
      nodes: [
        {
          id: 'serial',
          label: 'Serial',
          detail: 'simple · tiny heaps',
          tone: 'muted',
          col: 1,
          row: 1,
        },
        {
          id: 'parallel',
          label: 'Parallel',
          detail: 'throughput',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'g1',
          label: 'G1',
          detail: 'common default',
          tone: 'accent',
          col: 3,
          row: 1,
        },
        {
          id: 'zgc',
          label: 'ZGC',
          detail: 'ultra-low pause',
          tone: 'good',
          col: 4,
          row: 1,
        },
        {
          id: 'shen',
          label: 'Shenandoah',
          detail: 'ultra-low pause',
          tone: 'good',
          col: 5,
          row: 1,
        },
      ],
      edges: [
        { from: 'serial', to: 'parallel', label: 'more threads' },
        { from: 'parallel', to: 'g1', label: 'pause goals' },
        { from: 'g1', to: 'zgc', label: 'lower pause' },
        { from: 'g1', to: 'shen', label: 'lower pause' },
      ],
    },
  ],
  compare: [
    'Java: young = Eden + S0/S1; collectors trade throughput vs pause (Parallel, G1, ZGC/Shenandoah).',
    'Spring: request objects often die in Eden; singletons/caches often live in Old.',
    'Boot: same JVM; pick collector from latency needs, not from fashion.',
  ],
  tradeoffs: [
    'Small young/Eden → frequent young GCs; oversized young → longer young pauses when live set is big.',
    'Unbounded caches risk heap OutOfMemoryError in Old.',
    'Lower STW (G1/ZGC/Shenandoah-style concurrency) usually costs more CPU alongside traffic.',
  ],
  walkthrough: {
    statement:
      'Explain why GC exists, Eden/Survivor/Old, object lifecycle, STW, and name a few collectors.',
    keyIdea:
      'Most objects die in Eden. Porter cleans young often and old rarely. Collectors trade throughput vs pause.',
    approach: [
      'Why GC (no manual free); System.gc() is a hint.',
      'Young = Eden + Survivors; Old = long-lived.',
      'Lifecycle: Eden → Survivor → Old → reclaim.',
      'Mark/sweep/STW vs concurrent.',
      'Serial, Parallel, G1, ZGC/Shenandoah one-liners.',
      'Leaks = still reachable; bridge to tuning.',
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
      id: 'q-promote',
      type: 'trueFalse',
      prompt:
        'Objects that survive enough young GCs (or overflow Survivors) are typically promoted into the Old generation.',
      answer: true,
      explain:
        'Promotion is the bridge from young to Old - important for understanding Old pressure.',
    },
    {
      id: 'q-collectors',
      type: 'multipleChoice',
      prompt: 'Which pairing is the best interview one-liner?',
      choices: [
        'ZGC is only for Android phones',
        'Parallel favors throughput; G1 is a common balanced default; ZGC/Shenandoah chase very low pauses',
        'Serial GC is required for every Spring Boot app',
        'CMS is the only modern JDK default',
      ],
      answer: 1,
      explain:
        'Know the tradeoff sketch. Same reachability rules; different pause/throughput behavior.',
    },
  ],
}

export const javaGcTuningLesson: LanguageLesson = {
  id: 'java-gc-tuning',
  title: 'GC tuning and healthy allocation',
  pathId: 'java-advanced',
  order: 3,
  level: 'advanced',
  summary:
    'Simple JVM flags, measure-first mindset, and code practices that ease GC pressure.',
  insight:
    'Flags are launch options that size the heap and pick a collector. Most GC pain is too much allocation or objects kept alive too long - fix that before copying random flags from the internet.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Measure before you tune. GC logs and metrics tell you whether the pain is frequent young collections (high allocation rate), long STW pauses, or Old filling up (objects kept reachable). Look at pause times, how often young GC runs, and whether Old is growing. Boot Actuator and -Xlog:gc* help you see that. Copying a long list of -XX options from a blog without matching them to your symptom is cargo-cult tuning - named after "cargo cults," where people copied the surface ritual (flags) hoping for the outcome (smooth GC) without understanding the cause.',
      why: 'Interview line: "I measure allocation and pauses first; flags come after I know what is wrong."',
    },
    {
      narrative:
        'How you use a flag: it is a JVM command-line option you pass when starting the process - not something you put inside a Java class. Examples: java -Xmx512m -jar app.jar, or JAVA_OPTS / your Dockerfile / systemd unit / IDE run config. -Xms and -Xmx set starting and maximum heap size (often set equal in production so the heap does not resize under load). -XX:+UseG1GC picks a common modern collector (many JDKs already default to G1). -Xlog:gc* writes GC pause logs. Young-gen size options (-Xmn, NewRatio, ...) exist but are advanced; learn Eden vs Old first. Flags only size regions and choose collector behavior - they do not invent a second memory model.',
      why: 'Flags live on the launch line (or JAVA_OPTS). Know heap size, collector, and logging first.',
    },
    {
      narrative:
        'Habits that help without flags: keep fewer objects alive (drop references when done), do not let caches or lists grow forever, prefer short-lived request objects that die in Eden, and avoid creating huge bursts of objects on every request. Right-size the heap so the app has room, but a giant heap full of live data makes long pauses worse.',
      why: 'Healthy apps allocate calmly and forget data early. Flags cannot fix a list that never shrinks.',
    },
    {
      narrative:
        'Code-level wins, kept simple. (1) In hot loops, avoid building strings with + in a loop - use StringBuilder so you create one growing buffer instead of many temporary Strings. (2) Do not store large request data on a static field or a Spring singleton field - that keeps it reachable forever. (3) When you finish with a big ArrayList or byte[], clear it or let it go out of scope. Profile before micro-optimizing streams and lambdas; they can allocate, but clarity usually wins until metrics say otherwise.',
      why: 'Less garbage and fewer accidental roots beat a clever flag list.',
    },
    {
      narrative:
        'Spring "cache" means a named store of computed values so you skip repeating expensive work (DB, remote call). You enable it with @EnableCaching, configure a CacheManager (often Caffeine or Redis via Boot starters), and mark methods with @Cacheable("users") - Spring stores the return value under a key. You should still bound that store: max size and/or TTL (time-to-live, how long an entry may stay). Without bounds, a cache is just another growing map of reachable objects. A listener is an object that registers to be called on events (ApplicationListener, @EventListener, or a hand-rolled list of callbacks). If a singleton keeps a List<Listener> and you add forever without remove, those listeners (and anything they point at) never become garbage. Unregister means remove that listener from the list or registry when the owner is done - for example listeners.remove(this) or ContextClosedEvent cleanup.',
      why: 'Spring cache = named, managed map of results. Listeners must be removable or they become leaks.',
    },
    {
      narrative:
        'When Old grows, ask "what still points at this?" before raising -Xmx. A bigger heap can hide a leak briefly and make the eventual pause worse. Actuator shows pressure; it does not fix reachability.',
      why: 'Bigger heap is not a substitute for finding the retaining reference.',
    },
  ],
  codePanes: [
    {
      id: 'flags-simple',
      label: 'How to pass flags',
      language: 'java',
      code: `// Flags go on the JVM launch line (or JAVA_OPTS), not in your .java files:
// java -Xms512m -Xmx512m -XX:+UseG1GC -Xlog:gc*:file=gc.log -jar app.jar
//
// Same idea in Docker / K8s:
// ENV JAVA_OPTS="-Xms512m -Xmx512m -XX:+UseG1GC"
//
// -Xms / -Xmx  → heap size (often equal in prod)
// -XX:+UseG1GC → common collector
// -Xlog:gc*    → write GC pause logs
// Change further only after you read those logs.`,
    },
    {
      id: 'alloc-hot',
      label: 'Fewer temporary Strings',
      language: 'java',
      code: `// Costly in a loop: many temporary String objects
String bad(String[] parts) {
  String out = "";
  for (String p : parts) {
    out = out + p + ",";
  }
  return out;
}

// Better: one StringBuilder
String better(String[] parts) {
  StringBuilder sb = new StringBuilder();
  for (String p : parts) {
    sb.append(p).append(',');
  }
  return sb.toString();
}`,
    },
    {
      id: 'spring-cache',
      label: 'Spring cache with a bound',
      language: 'java',
      code: `@EnableCaching
@Configuration
public class CacheConfig {
  @Bean
  public CacheManager cacheManager() {
    CaffeineCacheManager mgr = new CaffeineCacheManager("users");
    mgr.setCaffeine(
        Caffeine.newBuilder()
            .maximumSize(10_000)              // bound: at most 10k entries
            .expireAfterWrite(Duration.ofMinutes(10))); // TTL
    return mgr;
  }
}

@Service
public class UserService {
  @Cacheable("users")
  public User find(long id) {
    return repo.findById(id); // result stored in the "users" cache
  }
}
// Without max size / TTL, @Cacheable can keep growing like any map.`,
    },
    {
      id: 'listeners',
      label: 'Register and unregister a listener',
      language: 'java',
      code: `public final class AlarmBus {
  private final List<Runnable> listeners = new CopyOnWriteArrayList<>();

  public void register(Runnable listener) {
    listeners.add(listener);
  }

  public void unregister(Runnable listener) {
    listeners.remove(listener); // drop the reference → GC can free it
  }

  public void fire() {
    for (Runnable r : listeners) r.run();
  }
}

@Component
public class OrderAlerts implements DisposableBean {
  private final AlarmBus bus;
  private final Runnable listener = () -> notifyOps();

  public OrderAlerts(AlarmBus bus) {
    this.bus = bus;
    bus.register(listener);
  }

  @Override
  public void destroy() {
    bus.unregister(listener); // important on shutdown / bean destroy
  }
}`,
    },
  ],
  diagrams: [
    {
      id: 'tune-order',
      title: 'Tune in this order',
      caption:
        'Fix what the app retains and allocates first. Flags and collector choice come after you can name the symptom.',
      columns: 4,
      rows: 1,
      nodes: [
        {
          id: 'measure',
          label: 'Measure',
          detail: 'logs · pauses · Old growth',
          tone: 'accent',
          col: 1,
          row: 1,
        },
        {
          id: 'code',
          label: 'Fix code',
          detail: 'less alloc · drop refs',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'heap',
          label: 'Size heap',
          detail: '-Xms / -Xmx',
          tone: 'warn',
          col: 3,
          row: 1,
        },
        {
          id: 'collector',
          label: 'Collector',
          detail: 'G1 / advanced knobs',
          tone: 'good',
          col: 4,
          row: 1,
        },
      ],
      edges: [
        { from: 'measure', to: 'code' },
        { from: 'code', to: 'heap' },
        { from: 'heap', to: 'collector' },
      ],
    },
  ],
  compare: [
    'Java: allocation rate and live set dominate GC cost; flags only size and steer the collector.',
    'Spring: singletons and caches are common accidental roots - bound them.',
    'Boot: Actuator shows heap/GC pressure; raising -Xmx without fixing a leak makes pauses worse later.',
  ],
  tradeoffs: [
    'Larger heap can delay OOM but lengthen pauses when the live set is huge.',
    'Lower allocation is usually better than exotic flags.',
    'An unbounded @Cacheable store is still a growing map of reachable objects.',
  ],
  walkthrough: {
    statement:
      'How do you talk about GC tuning without dumping a flag list?',
    keyIdea:
      'Measure → fix allocation and reachability → size the heap → pick or tune the collector.',
    approach: [
      'Name the symptom (young churn, long STW, Old growth).',
      'Explain flags as launch options: -Xms/-Xmx, UseG1GC, GC logging.',
      'Code habits: StringBuilder in loops, no forever-growing singleton lists.',
      'Spring: bound caches (@Cacheable + max/TTL); unregister listeners.',
      'Warn: bigger -Xmx is not a leak fix.',
    ],
  },
  quiz: [
    {
      id: 'q-measure',
      type: 'multipleChoice',
      prompt: 'Best first step when GC pauses hurt production?',
      choices: [
        'Randomly change every -XX flag you find online',
        'Measure (GC logs/metrics): allocation, pause times, Old growth - then act',
        'Disable GC',
        'Move all objects to the stack',
      ],
      answer: 1,
      explain: 'Flags without a symptom are cargo-cult. Measure first.',
    },
    {
      id: 'q-xmx',
      type: 'multipleChoice',
      prompt: 'What do -Xms and -Xmx mainly control?',
      choices: [
        'HTTP thread pool size',
        'Starting and maximum heap size',
        'SQL connection timeouts',
        'Whether Spring uses singletons',
      ],
      answer: 1,
      explain: 'They size the heap. They do not replace fixing leaks or allocation spikes.',
    },
    {
      id: 'q-cache',
      type: 'trueFalse',
      prompt:
        'An unbounded list on a Spring singleton that keeps every request body can force Old growth and eventual OutOfMemoryError even if GC is "working correctly."',
      answer: true,
      explain:
        'GC cannot free reachable objects. Bounding or dropping references is the fix.',
    },
    {
      id: 'q-bigger',
      type: 'trueFalse',
      prompt:
        'Raising -Xmx is always the right fix for a memory leak.',
      answer: false,
      explain:
        'A larger heap can hide the leak briefly and make a later full collection more expensive. Find the retaining reference.',
    },
  ],
}

export const javaStaticLesson: LanguageLesson = {
  id: 'java-static',
  title: 'static in Java',
  pathId: 'java-advanced',
  order: 4,
  level: 'core',
  summary:
    'static fields, methods, blocks, and nested types - what belongs to the class, not an instance.',
  insight:
    'static means "belongs to the class." One shared field for everyone; methods you can call without new. Useful - and easy to turn into accidental shared state.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Instance vs static, plain picture. When you write new User(), you get an object with its own copy of instance fields (name, id). A static field lives on the class itself - there is one shared copy for the whole JVM (per ClassLoader). Every User instance sees the same static counter. Mental model: instance = per object; static = per class.',
      why: 'static = shared on the class, not copied per new.',
    },
    {
      narrative:
        'Static fields. Example: private static int created; incremented in the constructor - counts how many User objects were made. Constants are often public static final (String API_VERSION = "1"). Because static fields are shared, they are also long-lived GC roots while the class is loaded - a static Map that keeps growing is a classic memory leak (see Stack, heap, and reachability). In Spring apps, prefer a bean or a bounded cache over a big static store.',
      why: 'Shared data is powerful. Unbounded static collections are leaks.',
    },
    {
      narrative:
        'Static methods. Call them on the class: Math.max(a, b), Objects.equals(a, b) - no instance required. They can only use static fields of that class directly (unless you pass an instance in). They cannot use this or call instance methods without an object. Good for pure helpers and factories (User.of(...)). Bad as a dump for all app logic - harder to mock and easy to hide global state.',
      why: 'Static method = class-level function. No this.',
    },
    {
      narrative:
        'Static blocks and initialization. A static { ... } block runs once when the class is first loaded/initialized - useful for setting up a static field. Field initializers and static blocks run in order top to bottom. If initialization fails, you can get ExceptionInInitializerError. Keep static init simple and fast; heavy work at class-load time surprises startup.',
      why: 'static {} runs once per class load, not once per new.',
    },
    {
      narrative:
        'static nested class vs inner class. A static nested class is declared static class Helper inside Outer - it does not hold a hidden reference to an Outer instance. A non-static inner class does hold that reference (and can keep Outer alive for GC). Prefer static nested classes unless you truly need the outer instance. (Top-level classes cannot be static.)',
      why: 'static nested = no hidden Outer pointer. Safer for GC and clearer.',
    },
    {
      narrative:
        'Spring angle. @Service beans are instances managed by the container. static fields on a @Service are still plain Java statics - shared across all threads and not "injected." Do not put request data in static fields. main in Boot is static because the JVM needs a starting method before any Spring bean exists.',
      why: 'Spring wires instances. static bypasses that and shares globally.',
    },
  ],
  codePanes: [
    {
      id: 'static-field',
      label: 'Static field vs instance field',
      language: 'java',
      code: `public class User {
  private final String name;          // per instance
  private static int created = 0;     // one shared counter

  public User(String name) {
    this.name = name;
    created++;                        // all constructors share this
  }

  public static int createdCount() {
    return created;
  }
}

User a = new User("Ada");
User b = new User("Bob");
User.createdCount(); // 2 - not a.createdCount needed, but that also works`,
    },
    {
      id: 'static-method',
      label: 'Static method',
      language: 'java',
      code: `public final class Ids {
  private Ids() {} // no instances

  public static String normalize(String raw) {
    return raw.trim().toLowerCase();
  }
}

String id = Ids.normalize("  AbC "); // call on the class

// Illegal inside a static method without an object:
//   this.name;
//   instanceMethod();`,
    },
    {
      id: 'static-block',
      label: 'Static block',
      language: 'java',
      code: `public class Config {
  public static final Map<String, String> DEFAULTS;

  static {
    Map<String, String> m = new HashMap<>();
    m.put("region", "eu");
    DEFAULTS = Map.copyOf(m); // runs once when class initializes
  }
}`,
    },
    {
      id: 'nested',
      label: 'Static nested class',
      language: 'java',
      code: `public class Order {
  private final String id;

  // Preferred: no hidden link back to Order
  public static final class Line {
    private final String sku;
    public Line(String sku) { this.sku = sku; }
  }

  // Non-static inner class secretly holds Order.this
  // public class Line { ... }  // can keep Order alive longer than you expect
}`,
    },
  ],
  diagrams: [
    {
      id: 'static-vs-instance',
      title: 'Class vs instance',
      caption:
        'Instance fields live on each object. A static field is one shared slot on the class.',
      columns: 3,
      rows: 2,
      nodes: [
        {
          id: 'cls',
          label: 'Class User',
          detail: 'static created',
          tone: 'accent',
          col: 2,
          row: 1,
        },
        {
          id: 'a',
          label: 'User a',
          detail: 'name = Ada',
          tone: 'window',
          col: 1,
          row: 2,
        },
        {
          id: 'b',
          label: 'User b',
          detail: 'name = Bob',
          tone: 'window',
          col: 3,
          row: 2,
        },
      ],
      edges: [
        { from: 'a', to: 'cls', label: 'shares' },
        { from: 'b', to: 'cls', label: 'shares' },
      ],
    },
  ],
  compare: [
    'Java: static is language-level shared class state and helpers.',
    'Spring: prefer injected beans over static holders for app services.',
    'Boot: public static void main starts the JVM; then Spring creates instance beans.',
  ],
  tradeoffs: [
    'Static helpers are simple; static mutable state is global and hard to test.',
    'Static collections are easy GC roots - bound them or avoid them.',
    'Non-static inner classes can pin the outer instance in memory.',
  ],
  walkthrough: {
    statement: 'Explain what static means for fields, methods, blocks, and nested classes.',
    keyIdea:
      'static belongs to the class. Shared field, no-this method, one-time class init, nested type without Outer.this.',
    approach: [
      'Instance vs class ownership.',
      'Static field + GC/leak warning.',
      'Static method rules (no this).',
      'static {} runs once on class init.',
      'Prefer static nested classes; Spring: avoid static app state.',
    ],
  },
  quiz: [
    {
      id: 'q-mean',
      type: 'multipleChoice',
      prompt: 'What does a static field mean?',
      choices: [
        'A new copy is created for every instance',
        'One shared field for the class (not per instance)',
        'The field lives only on the stack frame',
        'Spring will inject a different value per request automatically',
      ],
      answer: 1,
      explain: 'static fields are shared on the class.',
    },
    {
      id: 'q-this',
      type: 'trueFalse',
      prompt: 'A static method can use this to read instance fields of the current object.',
      answer: false,
      explain: 'There is no current instance in a static method unless you pass one in.',
    },
    {
      id: 'q-block',
      type: 'multipleChoice',
      prompt: 'When does a static { } block run?',
      choices: [
        'Every time you call new',
        'Once when the class is initialized',
        'On every GC cycle',
        'Only if Spring Boot is on the classpath',
      ],
      answer: 1,
      explain: 'Class initialization runs static field initializers and static blocks once.',
    },
    {
      id: 'q-nested',
      type: 'trueFalse',
      prompt:
        'A static nested class does not hold an implicit reference to an instance of the outer class.',
      answer: true,
      explain:
        'That is a main reason to prefer static nested classes over non-static inner classes.',
    },
  ],
}

export const javaConcurrencyLesson: LanguageLesson = {
  id: 'java-concurrency',
  title: 'Concurrency and happens-before',
  pathId: 'java-advanced',
  order: 5,
  level: 'advanced',
  summary:
    'What concurrency is (many threads / waiters), why we use it, then visibility, atomicity, and tools.',
  insight:
    'Concurrency means several threads can each handle their own task - like several waiters serving different tables - so one slow wait does not freeze the whole restaurant. The hard part starts when those threads share data.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'What concurrency is (restaurant again). One waiter serving every table in order means when they wait on the kitchen for table 1, every other table waits too. Concurrency means several waiters (threads) - each can serve a different table. While waiter A waits on the kitchen (a slow DB or network call), waiter B can still take table 2\'s order. In Java, a thread is one line of execution inside the same process. Parallelism is when multiple CPU cores truly run those waiters at the same instant; concurrency is the broader idea of having more than one waiter in the restaurant. Spring Boot web apps already use a pool of waiter threads for HTTP requests.',
      why: 'Concurrency = many threads (waiters) handling different tasks. One slow wait should not freeze everyone else.',
    },
    {
      narrative:
        'Why use it. So many users can be helped at once instead of standing in a single-file line. So a slow database call for one request does not stop every other request. So background jobs (email, reports) can run without freezing the HTTP response. CPU-heavy work can also use multiple cores. You usually inherit this: Tomcat (or similar) hands each request to a worker thread from a pool.',
      why: 'Many waiters → many customers served. Boot web apps already run this way.',
    },
    {
      narrative:
        'The catch. Threads that never share data are easy. Pain starts when they share mutable state - a counter, a cache Map, a field on a Spring singleton. Then you need rules so updates are not lost and writes are actually seen. The rest of this lesson names those problems (visibility and atomicity) and the Java tools that fix them.',
      why: 'Concurrency is useful. Shared mutable state is what makes it hard.',
    },
    {
      narrative:
        'Visibility means: when thread A writes a field, will thread B see that new value when it reads? On modern CPUs, each core has caches. A write may sit in one core\'s cache and not show up for another thread yet. The compiler and CPU may also reorder instructions for speed. So without a synchronization rule, "I wrote it, so they must see it" is not guaranteed. Visibility is about seeing the latest value (and related ordering), not about two threads bumping a counter at once.',
      why: 'Plain English: visibility = "can the other thread see my write?"',
    },
    {
      narrative:
        'Atomicity means: a step happens as one indivisible unit - no other thread can see it half-done or interleave in the middle. Example: count++ looks like one line, but it is read → add 1 → write. Two threads can both read 5, both write 6, and you lost an update. That is an atomicity bug, even if both threads eventually "see" some value. Visibility and atomicity are different: a field can be visible but still not safe for compound updates.',
      why: 'Plain English: atomicity = "this update is one complete step, not three raceable steps."',
    },
    {
      narrative:
        'JMM means Java Memory Model. It is the language rulebook that says which writes one thread is allowed to see, and in what order, when you use tools like synchronized, volatile, and locks. The central idea is happens-before: a relationship the JMM defines between actions. If action X happens-before action Y, then Y is guaranteed to see the effects of X (visibility + ordering). Without a happens-before edge, the JMM does not promise Y sees X\'s writes. You do not memorize every edge - you learn the tools that create them.',
      why: 'JMM = the contract. Happens-before = "Y is guaranteed to see what X did."',
    },
    {
      narrative:
        'synchronized and Lock (for example ReentrantLock), simply. Mutual exclusion: only one thread at a time runs the protected block for that lock/monitor - so compound updates inside the block can be made atomic relative to other threads using the same lock. Happens-before bonus: when thread A unlocks, and later thread B locks the same monitor, B is guaranteed to see writes A made before the unlock. So locks give you both "one at a time" and "the next locker sees what I wrote." Use the same lock for related fields.',
      why: 'Lock = take turns + hand off visibility to the next thread that takes the same lock.',
    },
    {
      narrative:
        'volatile, simply. Marking a field volatile creates happens-before between a write to that field and a later read of that same field. So if thread A writes volatile ready = true and thread B reads ready and sees true, B is guaranteed to see that write (and certain related writes A made before it). What volatile does not do: make count++ atomic. ++ is still read-modify-write. Two threads can still lose updates. Use volatile for flags and safe publication of a reference; use AtomicInteger, synchronized, or Lock when you need atomic updates.',
      why: 'volatile = visibility for that field\'s reads/writes. Not a lock. Not atomic ++.',
    },
    {
      narrative:
        'ConcurrentHashMap (CHM) lets many threads read/write safely for single operations (get, put). Iterators are weakly consistent - they may show later updates and do not throw ConcurrentModificationException like ArrayList. Compound actions (check-then-act: if absent then put) still need care - use putIfAbsent or compute. Collections.synchronizedMap locks the whole map on every call; CHM is usually preferred for concurrent maps.',
      why: 'CHM helps single ops. Your multi-step logic still needs an atomic API or a lock.',
    },
    {
      narrative:
        'Spring trap. @Transactional and "it is a @Service" do not make fields thread-safe. Controllers and services are usually singletons - one shared instance for many request threads. A mutable int counter or HashMap field on that bean is shared mutable state. Keep services stateless, use request scope for per-request data, or protect shared state with locks/atomics/CHM deliberately.',
      why: 'Framework features ≠ JMM tools. Singleton + mutable field = concurrent bug waiting to happen.',
    },
  ],
  codePanes: [
    {
      id: 'why-concurrency',
      label: 'Why concurrency (sketch)',
      language: 'java',
      code: `// One waiter (one thread): table B waits until table A is fully done
// A: order → wait on kitchen ........ → serve
// B:                              then start

// Many waiters (thread pool): B is served while A still waits on the kitchen
// Waiter-1: A waits on kitchen ........
// Waiter-2: B waits on kitchen ........

// Spring Boot HTTP: worker threads = waiters sharing your @Service beans`,
    },
    {
      id: 'visibility',
      label: 'Visibility problem (sketch)',
      language: 'java',
      code: `// Shared flag - without volatile/synchronized, thread B may never see true
boolean ready = false;
int value = 0;

// Thread A
value = 42;
ready = true;

// Thread B
if (ready) {
  System.out.println(value); // may still see 0 without a happens-before
}

// Fix flag visibility:
volatile boolean ready = false; // B seeing ready==true sees A's write`,
    },
    {
      id: 'atomicity',
      label: 'Atomicity: why ++ is not enough',
      language: 'java',
      code: `int count = 0; // shared

// count++ is really:
//   int tmp = count;  // read
//   tmp = tmp + 1;    // modify
//   count = tmp;      // write
// Two threads can both read 5 and both write 6 → lost update

// Visibility-only fix - still not atomic:
volatile int count = 0;
count++; // still racy

// Atomic update:
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();

// Or lock the compound action:
synchronized (lock) {
  count++;
}`,
    },
    {
      id: 'sync-vs-volatile',
      label: 'synchronized vs volatile',
      language: 'java',
      code: `// synchronized: mutual exclusion + happens-before on same monitor
synchronized (lock) {
  // only one thread here at a time
  balance -= amount;
}

// Lock API - same idea
lock.lock();
try {
  balance -= amount;
} finally {
  lock.unlock(); // next lock() on same lock sees these writes
}

// volatile: visibility for this field, not mutual exclusion
volatile boolean shutdown;
// good for: if (shutdown) return;
// bad for:  counter++ on a volatile int`,
    },
    {
      id: 'spring-trap',
      label: 'Spring singleton trap',
      language: 'java',
      code: `@Service
public class StatsService {
  private int hits; // shared by all request threads - racy

  public void hit() {
    hits++; // not atomic, not safely published
  }
}

// Better: no shared mutable counter, or use AtomicInteger / metrics library
@Service
public class StatsService {
  private final AtomicInteger hits = new AtomicInteger();

  public void hit() {
    hits.incrementAndGet();
  }
}`,
    },
  ],
  diagrams: [
    {
      id: 'why-then-hard',
      title: 'Concurrency: useful, then careful',
      caption:
        'Many threads (waiters) handle different tasks. Hard part: shared mutable data needs visibility and atomicity rules.',
      columns: 4,
      rows: 1,
      nodes: [
        {
          id: 'tasks',
          label: 'Many tasks',
          detail: 'requests · jobs',
          tone: 'accent',
          col: 1,
          row: 1,
        },
        {
          id: 'threads',
          label: 'Threads',
          detail: 'many waiters',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'share',
          label: 'Shared data?',
          detail: 'counter · cache',
          tone: 'warn',
          col: 3,
          row: 1,
        },
        {
          id: 'rules',
          label: 'Need rules',
          detail: 'vis · atomic · JMM',
          tone: 'good',
          col: 4,
          row: 1,
        },
      ],
      edges: [
        { from: 'tasks', to: 'threads', label: 'why' },
        { from: 'threads', to: 'share' },
        { from: 'share', to: 'rules', label: 'then' },
      ],
    },
    {
      id: 'vis-vs-atomic',
      title: 'Two different problems',
      caption:
        'Visibility: does B see A\'s write? Atomicity: is the update one indivisible step? Locks can help both; volatile mainly helps visibility.',
      columns: 3,
      rows: 2,
      nodes: [
        {
          id: 'write',
          label: 'Thread A writes',
          detail: 'field = 42',
          tone: 'accent',
          col: 1,
          row: 1,
        },
        {
          id: 'vis',
          label: 'Visibility',
          detail: 'does B see 42?',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'read',
          label: 'Thread B reads',
          detail: 'use the value',
          tone: 'good',
          col: 3,
          row: 1,
        },
        {
          id: 'inc',
          label: 'count++',
          detail: 'read · add · write',
          tone: 'warn',
          col: 1,
          row: 2,
        },
        {
          id: 'atomic',
          label: 'Atomicity',
          detail: 'one indivisible step?',
          tone: 'warn',
          col: 2,
          row: 2,
        },
        {
          id: 'tools',
          label: 'Tools',
          detail: 'lock / Atomic* / volatile',
          tone: 'muted',
          col: 3,
          row: 2,
        },
      ],
      edges: [
        { from: 'write', to: 'vis' },
        { from: 'vis', to: 'read' },
        { from: 'inc', to: 'atomic' },
        { from: 'atomic', to: 'tools' },
      ],
    },
  ],
  compare: [
    'Java: threads give concurrency; JMM tools protect shared state.',
    'Spring: the web tier is already concurrent - singleton beans are shared across request threads.',
    'Boot: thread pools for web/async; still your job to protect shared state.',
  ],
  tradeoffs: [
    'More threads overlap I/O and can use more cores - and create coordination bugs if they share data carelessly.',
    'Coarse locks are simple and can limit throughput.',
    'volatile is cheap for flags but does not make ++ safe.',
    'Immutable / stateless designs avoid many races at the cost of allocation or redesign.',
  ],
  walkthrough: {
    statement: 'What is concurrency, why use it, and what goes wrong with shared data?',
    keyIdea:
      'Many threads handle different tasks (your Boot app already does). Shared mutable state needs visibility and atomicity tools.',
    approach: [
      'Define concurrency with the waiter analogy.',
      'Why: serve many users; one slow wait should not freeze others.',
      'Catch: shared mutable state.',
      'Then visibility, atomicity, JMM, locks vs volatile.',
      'Spring singletons are shared across request threads.',
    ],
  },
  quiz: [
    {
      id: 'q-what',
      type: 'multipleChoice',
      prompt: 'What is concurrency in this lesson?',
      choices: [
        'Only running on a single CPU forever',
        'Using multiple threads so different tasks can proceed - one slow wait need not freeze everything',
        'A Spring annotation that replaces the JVM',
        'Deleting shared state automatically',
      ],
      answer: 1,
      explain:
        'Think several waiters: each handles a task. In Java that is typically multiple threads in one process.',
    },
    {
      id: 'q-why',
      type: 'multipleChoice',
      prompt: 'Why do typical Spring Boot web apps use concurrency?',
      choices: [
        'So that only one user can ever be served',
        'To overlap waiting (DB/network) and handle many requests on a thread pool',
        'Because static methods require it',
        'Because GC cannot run otherwise',
      ],
      answer: 1,
      explain:
        'The embedded server uses worker threads so many requests progress while others wait on I/O.',
    },
    {
      id: 'q-vis',
      type: 'multipleChoice',
      prompt: 'In this lesson, what does visibility mean?',
      choices: [
        'Whether a variable is public or private',
        'Whether one thread\'s write to a field is guaranteed to be seen by another thread\'s read',
        'Whether the GC can collect the object',
        'Whether Spring shows the field in Actuator',
      ],
      answer: 1,
      explain:
        'Visibility is about cross-thread observation of writes, governed by the JMM / happens-before.',
    },
    {
      id: 'q-atomic',
      type: 'multipleChoice',
      prompt: 'What does atomicity mean here?',
      choices: [
        'The field is declared atomic in the source file name',
        'The update happens as one indivisible step - other threads cannot interleave in the middle',
        'The value is always visible without any tools',
        'Only Spring beans can be atomic',
      ],
      answer: 1,
      explain: 'count++ is not atomic; use AtomicInteger or a lock for safe increments.',
    },
    {
      id: 'q-jmm',
      type: 'multipleChoice',
      prompt: 'What is the JMM?',
      choices: [
        'Java Module Maven - a build tool',
        'Java Memory Model - rules for when one thread\'s writes become visible/ordered to others',
        'JVM Metrics Monitor in Spring Boot',
        'A garbage collector algorithm',
      ],
      answer: 1,
      explain: 'JMM is the language memory rulebook; happens-before is its key relationship.',
    },
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'Declaring int count volatile makes count++ atomic.',
      answer: false,
      explain: 'volatile helps visibility for that field; ++ is still read-modify-write. Use AtomicInteger or a lock.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Default Spring @Service beans are usually:',
      choices: [
        'Prototype per call',
        'Singleton shared across requests',
        'Thread-scoped automatically',
        'Stack-allocated',
      ],
      answer: 1,
      explain: 'Singleton is the default scope - shared across threads handling requests.',
    },
  ],
}

export const javaEqualsHashLesson: LanguageLesson = {
  id: 'java-equals-hash',
  title: '==, equals, hashCode, and HashMap',
  pathId: 'java-advanced',
  order: 6,
  level: 'advanced',
  summary:
    'Same object vs same meaning, why equals and hashCode must agree, and how HashMap finds a key.',
  insight:
    '== asks "same object?" equals asks "same meaning?" hashCode is a number HashMap uses to pick a shelf. If two keys are equal, they must share that number.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Start with ==. For objects, == asks: are these two variables pointing at the exact same heap object? Same arrow, same box. Example: User a = new User(); User b = a; then a == b is true. User c = new User(); then a == c is false - two different objects, even if every field looks the same. For primitives (int, boolean, ...), there is no equals - you only compare with ==.',
      why: '== = same object in memory (identity).',
    },
    {
      narrative:
        'equals asks a different question: should we treat these as the same value? You (or the class author) decide what "same" means. Example: two new String("hi") objects are different objects (== is false), but String.equals says they are equal because the characters match. Tip: prefer Objects.equals(a, b) when either side might be null - calling a.equals(b) crashes if a is null.',
      why: 'equals = same meaning (logical equality). You define the meaning.',
    },
    {
      narrative:
        'hashCode returns an int "fingerprint" of the object. HashMap uses it as a shortcut to find where to look (next beat). The hard rule that trips people: whenever equals says two objects are the same, their hashCode values must be the same number. Why? If equals says "same key" but hashCodes differ, HashMap may look on the wrong shelf and miss the entry. The other direction is fine: two different objects can accidentally share the same hashCode (a collision). HashMap then uses equals to tell them apart. Plain English: equal objects → same hashCode. Same hashCode → not necessarily equal.',
      why: 'hashCode is a fingerprint for speed. equals is the real "are we the same?" check.',
    },
    {
      narrative:
        'How HashMap uses both (mailbox picture). Imagine an array of shelves (buckets). On put(key, value) or get(key): (1) call key.hashCode() to pick which shelf, (2) look only on that shelf, (3) on that shelf, use equals to find the matching key. If equals finds it, replace or return the value; if not, add a new entry on that shelf. When many keys share a shelf (collisions), the shelf holds a short list - or a tree if it gets long. So: hashCode = which shelf; equals = which item on the shelf. HashMap allows one null key; ConcurrentHashMap does not allow null keys.',
      why: 'You only need: hash picks the shelf, equals finds the key.',
    },
    {
      narrative:
        'Do not change a key after you put it in a HashMap. If hashCode/equals depend on fields you mutate later, the map may look on a different shelf and never find the entry. Prefer immutable keys: final fields, or a record like record UserId(String value) {} which writes equals and hashCode for you. Records are great for plain data; be careful using them as JPA entities (proxies and lazy fields complicate equality).',
      why: 'Stable keys. Mutating a HashMap key after put is a classic bug.',
    },
  ],
  codePanes: [
    {
      id: 'eq-vs-eq',
      label: '== vs equals',
      language: 'java',
      code: `String a = new String("hi");
String b = new String("hi");

a == b;        // false - two different objects
a.equals(b);   // true  - same characters (same meaning)

User u1 = new User();
User u2 = u1;
u1 == u2;      // true - same object

int x = 3, y = 3;
x == y;        // true - primitives only use ==`,
    },
    {
      id: 'contract',
      label: 'equals and hashCode agree',
      language: 'java',
      code: `public final class UserId {
  private final String value;
  public UserId(String value) { this.value = value; }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;                 // same object
    if (!(o instanceof UserId other)) return false;
    return value.equals(other.value);           // same meaning
  }

  @Override
  public int hashCode() {
    return value.hashCode(); // if equals is true, this must match
  }
}

// Shorter: record UserId(String value) {}  // generates equals + hashCode`,
    },
    {
      id: 'hashmap-flow',
      label: 'HashMap: shelf then equals',
      language: 'java',
      code: `Map<UserId, String> map = new HashMap<>();
map.put(new UserId("42"), "Ada");

// Rough steps for get(new UserId("42")):
// 1) hashCode() → pick a shelf (bucket)
// 2) on that shelf, ask equals until a key matches
// 3) return that entry's value ("Ada")

String name = map.get(new UserId("42")); // works because equals + hashCode agree`,
    },
  ],
  diagrams: [
    {
      id: 'hashmap-buckets',
      title: 'HashMap: shelf, then equals',
      caption:
        'hashCode chooses the shelf. equals finds the right key on that shelf. Equal keys must share a hashCode so they land on the same shelf.',
      columns: 4,
      rows: 1,
      nodes: [
        {
          id: 'key',
          label: 'key',
          detail: 'hashCode()',
          tone: 'accent',
          col: 1,
          row: 1,
        },
        {
          id: 'idx',
          label: 'Pick shelf',
          detail: 'bucket index',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'bin',
          label: 'On that shelf',
          detail: 'few candidates',
          tone: 'warn',
          col: 3,
          row: 1,
        },
        {
          id: 'eq',
          label: 'equals',
          detail: 'match?',
          tone: 'good',
          col: 4,
          row: 1,
        },
      ],
      edges: [
        { from: 'key', to: 'idx', label: 'which shelf?' },
        { from: 'idx', to: 'bin' },
        { from: 'bin', to: 'eq', label: 'which key?' },
      ],
    },
  ],
  compare: [
    'Java: == same object; equals same meaning; hashCode helps HashMap pick a shelf.',
    'Spring: the container\'s bean identity is not the same as equals on your domain types.',
    'Boot/JPA: how entities define equals is a separate design choice - do not casually use records as entities.',
  ],
  tradeoffs: [
    'Wrong hashCode with a custom equals → HashMap cannot find your key.',
    'Records cut boilerplate for data keys; JPA entities often need a careful equals story.',
  ],
  walkthrough: {
    statement: 'Explain ==, equals, hashCode, and how HashMap finds a key.',
    keyIdea:
      'hashCode picks the shelf; equals confirms the key. If equals is true, hashCodes must match.',
    approach: [
      '== = same object; equals = same meaning.',
      'hashCode = fingerprint; equal objects share it; shared hash does not mean equal.',
      'HashMap: shelf then equals.',
      'Keep keys immutable (or use a record).',
    ],
  },
  quiz: [
    {
      id: 'q-eq',
      type: 'multipleChoice',
      prompt: 'For two different String objects with the same characters, which is typically true?',
      choices: [
        '== is true and equals is false',
        '== is false and equals is true',
        'Both are always false',
        'Primitives use equals only',
      ],
      answer: 1,
      explain: '== is identity (two objects). equals compares content for String.',
    },
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'If a.equals(b) is true, a.hashCode() must equal b.hashCode().',
      answer: true,
      explain:
        'Required so HashMap looks on the same shelf. The reverse is not required - collisions are allowed.',
    },
    {
      id: 'q-collide',
      type: 'trueFalse',
      prompt:
        'If two objects have the same hashCode, they must be equal according to equals.',
      answer: false,
      explain:
        'Different objects can share a hashCode (collision). equals decides if they are really the same.',
    },
    {
      id: 'q-hm',
      type: 'multipleChoice',
      prompt: 'In HashMap, what is hashCode mainly used for?',
      choices: [
        'Sorting keys alphabetically',
        'Choosing which shelf (bucket) to look in',
        'Replacing equals entirely',
        'Pinning objects so GC cannot collect them',
      ],
      answer: 1,
      explain: 'hashCode picks the shelf; equals finds the matching key on that shelf.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Safest HashMap key style?',
      choices: [
        'Mutable object you keep changing after put',
        'Immutable value / record',
        'Anonymous class with random hashCode each call',
        'The Thread object for the current request',
      ],
      answer: 1,
      explain: 'Immutable keys keep hashCode and equals stable after insertion.',
    },
  ],
}

export const javaGenericsLesson: LanguageLesson = {
  id: 'java-generics',
  title: 'Generics, erasure, PECS',
  pathId: 'java-advanced',
  order: 7,
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
  order: 8,
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
  order: 9,
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
  title: 'Java collections quirks',
  pathId: 'java-advanced',
  order: 10,
  level: 'advanced',
  summary:
    'ArrayList vs LinkedList, ArrayList grow/resize, Map/Set variants, deque vs Stack, fail-fast, CHM.',
  insight:
    'Pick the structure for access pattern. Java collections hide sharp edges: null rules, fail-fast iterators, and LinkedList rarely winning over ArrayList.',
  focuses: ['java'],
  teachingSteps: [
    {
      narrative:
        'Lists. ArrayList is an array under the hood: fast random access by index (get(i)), fast append at the end amortized, costly insert/remove in the middle (shifts elements). LinkedList is nodes with prev/next: cheap insert/remove once you are at the node, but get(i) walks from the start - usually slower in real apps than people expect. Default choice for most lists: ArrayList. Prefer ArrayDeque for queue/stack-like use, not LinkedList, unless you truly need frequent mid-list splicing.',
      why: 'Interview trap: "LinkedList is always better for inserts" - usually false for typical Java workloads.',
    },
    {
      narrative:
        'How ArrayList resizes internally. It stores elements in a plain Object[] called elementData, plus a size (how many slots are in use). capacity is elementData.length - room available before the next grow. A default new ArrayList<>() starts with an empty shared array; the first add allocates a small backing array (capacity 10 in classic JDKs). When add needs more room than capacity, grow runs: compute a larger capacity (typically old + old/2, about 1.5×), allocate a new bigger array, copy the old contents over (Arrays.copyOf), and point elementData at the new array. The old array becomes garbage if nothing else references it. That copy is why occasional adds are O(n) while amortized add at the end stays ~O(1). ensureCapacity(n) / the ArrayList(int initialCapacity) constructor let you pre-size when you know the count and want fewer resizes. size() is element count; there is no public capacity() - trimToSize() shrinks the array down to size if you want to free spare room.',
      why: 'Interview answer: "Backing array; when full, allocate ~1.5× and copy. Amortized O(1) append."',
    },
    {
      narrative:
        'Maps and sets (quirks). HashMap: unordered, O(1) typical get/put, allows one null key and null values; uses hashCode/equals (previous lesson). LinkedHashMap: like HashMap but keeps insertion order (or access order if configured) - handy for simple LRU-style caches. TreeMap: sorted by key (Comparable or Comparator), no null keys in natural order, O(log n). HashSet / LinkedHashSet / TreeSet are thin wrappers over the matching Map (keys only). Hashtable is legacy - synchronized and forbids nulls; prefer ConcurrentHashMap for concurrent maps.',
      why: 'Name the Map: need order → LinkedHashMap; need sorted keys → TreeMap; need speed → HashMap.',
    },
    {
      narrative:
        'Queues and the Stack class. ArrayDeque is the modern double-ended queue: use it as a queue (offer/poll) or as a stack (push/pop). java.util.Stack extends Vector - old, synchronized, generally avoided. Prefer Deque (ArrayDeque) for stack behavior. PriorityQueue is a heap: not fully sorted when you iterate - only the head is the least element.',
      why: 'Say "ArrayDeque, not Stack" in interviews.',
    },
    {
      narrative:
        'Iteration and concurrency quirks. ArrayList/HashMap iterators are fail-fast: if the collection is structurally modified while iterating (add/remove except via Iterator.remove), you typically get ConcurrentModificationException - even on one thread. ConcurrentHashMap (CHM) allows concurrent readers/writers for single operations; iterators are weakly consistent (may reflect later updates, no CME). CHM forbids null keys and null values. A raw HashMap field on a Spring singleton under web traffic is a race - use CHM, or confine the map, or use a proper cache with bounds.',
      why: 'Fail-fast ≠ thread-safe. CHM ≠ "compound actions are atomic" without compute/putIfAbsent.',
    },
  ],
  codePanes: [
    {
      id: 'list-pick',
      label: 'ArrayList vs LinkedList',
      language: 'java',
      code: `List<String> fastAccess = new ArrayList<>();
fastAccess.add("a");
String x = fastAccess.get(0); // O(1) index access

List<String> rarelyWhatYouWant = new LinkedList<>();
// get(i) walks nodes - often slower than ArrayList even for "lots of inserts"
// Prefer ArrayList, or ArrayDeque for queue/stack patterns`,
    },
    {
      id: 'arraylist-grow',
      label: 'ArrayList resize (mental model)',
      language: 'java',
      code: `// Internals (simplified - not copy-paste of JDK source):
// Object[] elementData;  // backing array = capacity
// int size;              // how many elements are used
//
// on add when size == elementData.length:
//   newCap ≈ oldCap + oldCap/2   // about 1.5×
//   elementData = Arrays.copyOf(elementData, newCap);
//   // then store the new element and size++

List<String> knownSize = new ArrayList<>(10_000); // pre-size → fewer grows
knownSize.add("a");

List<String> grew = new ArrayList<>();
for (int i = 0; i < 20; i++) grew.add("x"); // will grow a few times
grew.trimToSize(); // optional: shrink capacity down to size`,
    },
    {
      id: 'map-pick',
      label: 'Which Map?',
      language: 'java',
      code: `Map<String, Integer> unordered = new HashMap<>();           // fastest typical
Map<String, Integer> insertionOrder = new LinkedHashMap<>(); // remembers put order
Map<String, Integer> sorted = new TreeMap<>();               // sorted keys

unordered.put(null, 1); // ok in HashMap
// new ConcurrentHashMap<String, Integer>().put(null, 1); // NPE - no nulls in CHM`,
    },
    {
      id: 'deque',
      label: 'ArrayDeque instead of Stack',
      language: 'java',
      code: `Deque<String> stack = new ArrayDeque<>();
stack.push("a");
stack.push("b");
System.out.println(stack.pop()); // "b"

Deque<String> queue = new ArrayDeque<>();
queue.offer("a");
queue.offer("b");
System.out.println(queue.poll()); // "a"

// Prefer ArrayDeque over java.util.Stack (legacy Vector subclass)`,
    },
    {
      id: 'fail-fast',
      label: 'Fail-fast iterator',
      language: 'java',
      code: `List<String> list = new ArrayList<>(List.of("a", "b", "c"));
for (String s : list) {
  if (s.equals("b")) {
    // list.remove(s); // ConcurrentModificationException (fail-fast)
  }
}

// Safe structural remove while iterating:
Iterator<String> it = list.iterator();
while (it.hasNext()) {
  if (it.next().equals("b")) it.remove();
}`,
    },
  ],
  diagrams: [
    {
      id: 'arraylist-resize',
      title: 'ArrayList grow',
      caption:
        'When size hits capacity, allocate a larger array (~1.5×), copy elements, replace the backing store. Old array can be GC\'d.',
      columns: 4,
      rows: 1,
      nodes: [
        {
          id: 'full',
          label: 'Array full',
          detail: 'size == capacity',
          tone: 'warn',
          col: 1,
          row: 1,
        },
        {
          id: 'alloc',
          label: 'New array',
          detail: '~1.5× capacity',
          tone: 'accent',
          col: 2,
          row: 1,
        },
        {
          id: 'copy',
          label: 'Copy elements',
          detail: 'Arrays.copyOf',
          tone: 'window',
          col: 3,
          row: 1,
        },
        {
          id: 'swap',
          label: 'Swap backing',
          detail: 'old array → GC',
          tone: 'good',
          col: 4,
          row: 1,
        },
      ],
      edges: [
        { from: 'full', to: 'alloc' },
        { from: 'alloc', to: 'copy' },
        { from: 'copy', to: 'swap' },
      ],
    },
    {
      id: 'pick-structure',
      title: 'Pick a structure',
      caption:
        'Match the collection to the access pattern. Defaults: ArrayList, HashMap, ArrayDeque.',
      columns: 3,
      rows: 2,
      nodes: [
        {
          id: 'list',
          label: 'List',
          detail: 'ArrayList default',
          tone: 'accent',
          col: 1,
          row: 1,
        },
        {
          id: 'map',
          label: 'Map',
          detail: 'HashMap / Linked / Tree',
          tone: 'window',
          col: 2,
          row: 1,
        },
        {
          id: 'deque',
          label: 'Queue / stack',
          detail: 'ArrayDeque',
          tone: 'good',
          col: 3,
          row: 1,
        },
        {
          id: 'chm',
          label: 'Concurrent map',
          detail: 'ConcurrentHashMap',
          tone: 'warn',
          col: 2,
          row: 2,
        },
        {
          id: 'll',
          label: 'LinkedList',
          detail: 'rarely the win',
          tone: 'muted',
          col: 1,
          row: 2,
        },
      ],
      edges: [
        { from: 'list', to: 'll', label: 'usually avoid' },
        { from: 'map', to: 'chm', label: 'multi-thread' },
      ],
    },
  ],
  compare: [
    'Java: collection contracts and implementation quirks (nulls, order, fail-fast, ArrayList grow).',
    'Spring: do not store request state in an unsynchronized HashMap on a singleton.',
    'Boot: same advice; Actuator will not fix a racy cache field.',
  ],
  tradeoffs: [
    'ArrayList grow copies the array - pre-size when you know the count.',
    'ArrayList locality vs LinkedList node overhead.',
    'HashMap speed vs TreeMap ordering vs LinkedHashMap stable order.',
    'HashMap simplicity vs ConcurrentHashMap under concurrency.',
  ],
  walkthrough: {
    statement: 'Choose collections for a service and avoid the classic quirks.',
    keyIdea:
      'ArrayList / HashMap / ArrayDeque by default. Know ArrayList grow, null rules, order, and fail-fast vs CHM.',
    approach: [
      'List: ArrayList unless you prove otherwise.',
      'Explain ArrayList resize: backing array, ~1.5× grow, copy.',
      'Map: HashMap vs LinkedHashMap vs TreeMap vs CHM.',
      'Stack/queue: ArrayDeque, not java.util.Stack.',
      'Iteration: Iterator.remove or concurrent collections when needed.',
    ],
  },
  quiz: [
    {
      id: 'q-al',
      type: 'multipleChoice',
      prompt: 'Default List choice for most Java code?',
      choices: [
        'LinkedList, because inserts are always O(1) at an index',
        'ArrayList - array backing, fast index access, usually fastest in practice',
        'Vector, because it is modern',
        'Stack, because it implements List',
      ],
      answer: 1,
      explain:
        'ArrayList is the usual default. LinkedList get(i) walks nodes and rarely wins.',
    },
    {
      id: 'q-grow',
      type: 'multipleChoice',
      prompt: 'How does ArrayList resize when it runs out of room?',
      choices: [
        'It links a new node like LinkedList and never copies',
        'It allocates a larger backing array (about 1.5×), copies elements over, and replaces elementData',
        'It asks the GC to stretch the old array in place',
        'It always doubles exactly and never copies',
      ],
      answer: 1,
      explain:
        'grow allocates a bigger Object[], copies with Arrays.copyOf-style logic, then continues the add. Amortized append stays cheap.',
    },
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'ConcurrentHashMap allows a null key.',
      answer: false,
      explain: 'CHM disallows null keys and null values. HashMap allows one null key.',
    },
    {
      id: 'q-tm',
      type: 'multipleChoice',
      prompt: 'You need keys sorted alphabetically. Which Map?',
      choices: ['HashMap', 'TreeMap', 'IdentityHashMap only', 'Hashtable only'],
      answer: 1,
      explain: 'TreeMap keeps keys ordered by Comparable/Comparator.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Fail-fast iterators in ArrayList react to structural modification by:',
      choices: [
        'Silently skipping',
        'Throwing ConcurrentModificationException (typically)',
        'Locking the JVM',
        'Switching to CHM',
      ],
      answer: 1,
      explain: 'Best-effort CME is the documented behavior.',
    },
  ],
}
