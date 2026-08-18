import type { LanguageLesson } from '../../types'

export const doINeedBootLesson: LanguageLesson = {
  id: 'map-do-i-need-boot',
  title: 'Interview: Do I need Spring Boot?',
  pathId: 'java-spring-boot-map',
  order: 4,
  level: 'core',
  summary: 'When Boot helps, when core Spring is enough, when plain Java wins.',
  insight:
    'Choose the thinnest layer that matches the job. Boot is a default for services, not a law of nature.',
  focuses: ['java', 'spring', 'spring-boot'],
  teachingSteps: [
    {
      narrative:
        'Prefer plain Java for algorithms, libraries with zero framework deps, CLIs, and any interview question about language semantics (equals, concurrency, GC). Example strong answer: "Layer: plain Java. Tradeoff: I wire nothing for me, but I also get no DI container or web stack - and I do not need them for merge intervals."',
      why: 'Pulling Spring into a sorting problem adds noise and signals you cannot separate concerns.',
    },
    {
      narrative:
        'Prefer Spring Framework (without Boot) when you need DI, transactions, or MVC but must control versions tightly, embed into an existing non-Boot platform, or avoid auto-config surprises. A BOM (Bill of Materials) is a Maven/Gradle dependency list that pins compatible versions of many libraries together. Companies often publish a parent BOM so every service uses the same Spring / Jackson / logging versions. Sometimes that BOM standardizes on Spring without Boot, or it constrains which Boot version you may use.',
      why: 'Example strong answer: "Layer: Spring Framework. Tradeoff: more bootstrap than Boot, but I match the platform BOM and avoid surprise auto-config beans."',
    },
    {
      narrative:
        'Prefer Spring Boot for HTTP/JSON services, workers that need health endpoints, and greenfield apps. Greenfield means a new project built from scratch (empty repo, no legacy platform forcing an older stack). Brownfield is the opposite: you extend an existing system with fixed constraints. Boot fits greenfield well because starters match common needs (web, data-jpa, security).',
      why: 'Example strong answer: "Layer: Spring Boot. Tradeoff: fastest path to a service, but I must understand and debug auto-config."',
    },
    {
      narrative:
        'What auto-config does: when Boot starts, it looks at your classpath and property settings, then automatically creates common Spring beans you would otherwise declare by hand. Examples: if a web starter is present, Boot can configure a DispatcherServlet and an embedded Tomcat; if a DataSource URL is set and a JDBC driver is present, Boot can create a DataSource bean; if JPA classes are present, it can set up an EntityManagerFactory. "Explain what auto-config did" means: name which beans/features appeared because of which starter or condition - not "Boot did magic."',
      why: 'Interviewers want proof you can open the auto-config report or reason about ConditionalOnClass, not only paste starters.',
    },
    {
      narrative:
        'Boot limits you should be ready to name: (1) Opacity - beans appear without an obvious @Bean in your code, so debugging needs the auto-config report / --debug. (2) Fat jar size and nested ClassLoader quirks (works in IDE, fails in the packaged jar). (3) Wrong main-package scan - @SpringBootApplication only scans downward from its package by default. (4) Default security or other starters locking endpoints until you customize. (5) Heavier full-context tests if you overuse @SpringBootTest instead of slices. (6) Circular dependency rules and version upgrades driven by the Boot BOM. Boot does not remove the need to understand Spring scopes, proxies, or @Transactional.',
      why: 'Fluency is "I use Boot" plus "here is where Boot bites." Limits are part of a senior answer.',
    },
    {
      narrative:
        'Red flags: "Boot is faster than Java," "Spring is a language," "I always use field injection," "I never look at auto-config." Strong answers name the layer and one tradeoff out loud. Templates: Java - "clear and testable logic; tradeoff is I build wiring myself." Spring - "DI and lifecycle without Boot opinions; tradeoff is more startup code." Boot - "starters and auto-config get a service running quickly; tradeoff is I must explain and sometimes override what auto-config created."',
      why: 'Clarity beats buzzwords. The map path exists so you can say this cleanly under pressure.',
    },
  ],
  compare: [
    'Java: thinnest layer for pure logic. Tradeoff: no container, no Actuator, no free HTTP stack.',
    'Spring: DI, lifecycle, modules you enable. Tradeoff: you assemble bootstrap; no Boot auto-config.',
    'Boot: starters + auto-config + embedded server + Actuator defaults. Tradeoff: opacity and Boot-specific limits listed above.',
  ],
  tradeoffs: [
    'Boot speed of start vs opacity of auto-config (you must be able to explain which beans appeared).',
    'Plain Java clarity vs reinventing wiring for large graphs.',
    'Spring flexibility / BOM alignment vs more bootstrap code than Boot.',
  ],
  walkthrough: {
    statement: 'Interview asks whether every Java service should use Spring Boot.',
    keyIdea:
      'Match layer to problem. Define BOM and greenfield if you use those words. Name auto-config behavior and Boot limits.',
    approach: [
      'Classify the task (language vs wiring vs service defaults).',
      'Pick the thinnest fit and say one tradeoff.',
      'If you pick Boot: say what auto-config does and one limit (scan package, fat jar, opaque beans, test cost).',
    ],
  },
  quiz: [
    {
      id: 'q-bom',
      type: 'multipleChoice',
      prompt: 'What is a BOM in this lesson\'s sense?',
      choices: [
        'A Spring annotation for beans',
        'A Bill of Materials that pins compatible dependency versions together',
        'A replacement for the JVM',
        'An HTTP status code',
      ],
      answer: 1,
      explain:
        'BOM = Bill of Materials. Parent BOMs keep Spring / Boot / library versions aligned across services.',
    },
    {
      id: 'q-green',
      type: 'multipleChoice',
      prompt: 'What is a greenfield app?',
      choices: [
        'An app that only uses green log levels',
        'A brand-new project built from scratch without a legacy platform forcing the stack',
        'Any app that uses JDBC',
        'An app that cannot use Spring',
      ],
      answer: 1,
      explain:
        'Greenfield = new from scratch. Brownfield = extending an existing constrained system.',
    },
    {
      id: 'q-auto',
      type: 'multipleChoice',
      prompt: 'What does Boot auto-configuration do?',
      choices: [
        'Replaces Java bytecode with a new format',
        'Creates common Spring beans based on classpath and properties (for example DataSource or embedded Tomcat)',
        'Deletes all @Bean methods',
        'Only formats application.yml',
      ],
      answer: 1,
      explain:
        'Auto-config conditionally registers infrastructure beans so you write less manual @Bean setup.',
    },
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Best stack for implementing merge intervals in a whiteboard interview?',
      choices: [
        'Spring Boot + JPA',
        'Plain Java',
        'Spring MVC without Boot',
        'Actuator only',
      ],
      answer: 1,
      explain: 'Algorithm interviews test Java. Frameworks hide the signal.',
    },
    {
      id: 'q3',
      type: 'trueFalse',
      prompt:
        'A Boot limit is that auto-config can create beans you did not declare explicitly, so you must be able to explain or override them.',
      answer: true,
      explain:
        'Opacity is a real tradeoff. Use the auto-config report and know how to override with your own @Bean.',
    },
  ],
}
