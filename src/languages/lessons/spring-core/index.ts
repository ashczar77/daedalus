import type { LanguageLesson } from '../../types'

export const springIocDiLesson: LanguageLesson = {
  id: 'spring-ioc-di',
  title: 'IoC and dependency injection',
  pathId: 'spring-core',
  order: 1,
  level: 'intro',
  summary: 'Inversion of control, constructor injection preferred.',
  insight:
    'IoC means the container calls you. Prefer constructor injection for required deps.',
  focuses: ['spring', 'java'],
  teachingSteps: [
    {
      narrative:
        'Without Spring, high-level code constructs low-level deps (new). With IoC, you declare dependencies; the container provides them. That inversion makes testing and swapping implementations easier.',
      why: 'DI is a technique; the Spring container is one implementation.',
    },
    {
      narrative:
        'Constructor injection: deps are final, object is always fully initialized, easy to unit test with new Service(mock). Field injection (@Autowired on fields) hides deps and hurts tests.',
      why: 'Boot samples sometimes show field injection - interviews prefer constructor injection.',
    },
    {
      narrative:
        'Plain Java can do manual DI (pass deps in main). Spring adds a container for large graphs, scopes, and later AOP. Boot just starts that container with less bootstrap code.',
      why: 'Keep layers: DI idea ≠ Spring ≠ Boot.',
    },
  ],
  codePanes: [
    {
      id: 'ctor',
      label: 'Constructor injection',
      language: 'java',
      code: `@Service
public class OrderService {
  private final OrderRepository repo;
  public OrderService(OrderRepository repo) {
    this.repo = repo;
  }
}`,
    },
  ],
  compare: [
    'Java: you can pass deps manually in main.',
    'Spring: ApplicationContext wires beans.',
    'Boot: same DI; less setup to get a context.',
  ],
  tradeoffs: [
    'Constructor injection is verbose for many deps - maybe too many deps (SRP).',
    'Field injection is short and hard to test.',
  ],
  walkthrough: {
    statement: 'Wire a service to a repository.',
    keyIdea: 'Container injects via constructor; fields stay final.',
    approach: ['Declare bean', 'Constructor inject', 'Avoid field @Autowired'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Preferred injection style for required dependencies?',
      choices: ['Field @Autowired', 'Constructor injection', 'Random static lookups', 'ThreadLocal'],
      answer: 1,
      explain: 'Constructor injection keeps deps explicit and testable.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'Dependency injection requires Spring Boot.',
      answer: false,
      explain: 'DI is a pattern; Spring Framework provides a container; Boot is optional packaging.',
    },
  ],
}

export const springContextScopesLesson: LanguageLesson = {
  id: 'spring-context-scopes',
  title: 'ApplicationContext, scopes, lifecycle',
  pathId: 'spring-core',
  order: 2,
  level: 'core',
  summary: 'BeanFactory vs ApplicationContext, singleton/prototype, lifecycle callbacks.',
  insight:
    'Default scope is singleton. Prototype creates a new instance per lookup - but a singleton dependency is injected once.',
  focuses: ['spring'],
  teachingSteps: [
    {
      narrative:
        'BeanFactory is the basic container API. ApplicationContext extends it with events, i18n, and more - what you use in apps. refresh() builds the bean graph.',
      why: 'Interview vocabulary: context lifecycle.',
    },
    {
      narrative:
        'singleton (default): one shared instance. prototype: new bean per request from the context. request/session scopes need web support. Injecting a prototype into a singleton captures one instance unless you use ObjectFactory/Provider/lookup.',
      why: 'Classic trap: prototype-in-singleton.',
    },
    {
      narrative:
        '@PostConstruct / InitializingBean after properties set; @PreDestroy / DisposableBean on shutdown for singletons. Prototype destroy callbacks are not always called by the container.',
      why: 'Resource cleanup belongs on singletons you own.',
    },
  ],
  compare: [
    'Java: no bean scopes - you manage instances.',
    'Spring: scopes + lifecycle callbacks.',
    'Boot: same scopes; web scopes available with web starter.',
  ],
  tradeoffs: [
    'Singletons are cheap and must be thread-safe.',
    'Prototypes isolate state but cost allocation and complicate injection.',
  ],
  walkthrough: {
    statement: 'Prototype bean looks like a singleton at runtime.',
    keyIdea: 'It was injected once into a singleton collaborator.',
    approach: ['Use Provider<T>', 'Or ask context each time', 'Or redesign scope'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Default Spring bean scope?',
      choices: ['prototype', 'singleton', 'request', 'startup'],
      answer: 1,
      explain: 'singleton is the default.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt:
        'Injecting a prototype bean into a singleton field automatically creates a new prototype on every method call.',
      answer: false,
      explain: 'Injection happens once unless you use a provider/lookup method.',
    },
  ],
}

export const springComponentScanLesson: LanguageLesson = {
  id: 'spring-component-scan',
  title: 'Component scan and configuration',
  pathId: 'spring-core',
  order: 3,
  level: 'core',
  summary: 'Stereotypes, @Configuration, @Bean vs @Component.',
  insight:
    '@Component is discovered by scan. @Bean methods are factory methods on @Configuration classes.',
  focuses: ['spring', 'spring-boot'],
  teachingSteps: [
    {
      narrative:
        '@Component / @Service / @Repository / @Controller are stereotypes for scanning. @Configuration classes can define @Bean methods for third-party types you cannot annotate.',
      why: 'Know both registration styles.',
    },
    {
      narrative:
        'Component scan starts from a base package. Miss the package and the bean is missing. Boot\'s @SpringBootApplication implies scan from its package downward.',
      why: 'Boot interview trap: main class in the wrong package.',
    },
    {
      narrative:
        '@Configuration classes are proxied (full mode) so @Bean calls go through the container. @Bean on a non-@Configuration class is "lite" mode - different semantics.',
      why: 'Subtle but real in advanced Spring interviews.',
    },
  ],
  compare: [
    'Java: no component scan.',
    'Spring: scan + @Bean factories.',
    'Boot: @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan.',
  ],
  tradeoffs: [
    'Scan is convenient; explicit @Bean is clearer for external types.',
    'Wide scan packages slow startup and risk accidental beans.',
  ],
  walkthrough: {
    statement: 'Bean not found at runtime.',
    keyIdea: 'Not scanned or not declared as @Bean.',
    approach: ['Check base package', 'Check stereotype', 'Check @Bean config'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multiSelect',
      prompt: '@SpringBootApplication meta-annotations typically include:',
      choices: [
        '@Configuration',
        '@EnableAutoConfiguration',
        '@ComponentScan',
        '@Override',
      ],
      answer: [0, 1, 2],
      explain: 'Those three are the usual meta-annotations on @SpringBootApplication.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'You can only register beans with @Component, never with @Bean methods.',
      answer: false,
      explain: '@Bean factory methods are first-class.',
    },
  ],
}

export const springAopProxiesLesson: LanguageLesson = {
  id: 'spring-aop-proxies',
  title: 'AOP proxies and @Transactional failures',
  pathId: 'spring-core',
  order: 4,
  level: 'advanced',
  summary: 'JDK vs CGLIB proxies; self-invocation skips the proxy.',
  insight:
    'Spring AOP is proxy-based by default. Internal this.foo() calls do not hit the proxy - so @Transactional on foo may not run.',
  focuses: ['spring'],
  teachingSteps: [
    {
      narrative:
        'Cross-cutting concerns (tx, security, metrics) wrap beans in proxies. Calls from outside go proxy → advice → target. Calls inside the same class use this and skip advice.',
      why: 'Number one @Transactional interview bug.',
    },
    {
      narrative:
        'JDK dynamic proxies need an interface. CGLIB subclasses the concrete class. Spring Boot often defaults to CGLIB-style proxies even for interfaces depending on version/config.',
      why: 'Final classes / private methods cannot be advised by CGLIB the way people expect.',
    },
    {
      narrative:
        'Fix self-invocation: split beans, inject self carefully, or use AspectJ weaving (heavier). Do not "just add @Transactional" without knowing the call path.',
      why: 'Debugging skill > annotation folklore.',
    },
  ],
  compare: [
    'Java: no proxy AOP unless you build it.',
    'Spring: proxy AOP for @Transactional, @Async, security.',
    'Boot: same proxy model; auto-config enables tx manager when DataSource present.',
  ],
  tradeoffs: [
    'Proxy AOP is simple to enable and has self-invocation limits.',
    'AspectJ is powerful and more complex to build.',
  ],
  walkthrough: {
    statement: '@Transactional method does not open a transaction.',
    keyIdea: 'Call never went through the proxy.',
    approach: ['Check external call', 'Check public method', 'Check proxy type / final'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt:
        'Calling this.save() from inside the same class always applies @Transactional on save().',
      answer: false,
      explain: 'Self-invocation bypasses the Spring AOP proxy.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Spring AOP by default is primarily:',
      choices: ['Compile-time source rewrite only', 'Proxy-based', 'CPU interrupt handlers', 'JNI'],
      answer: 1,
      explain: 'Default Spring AOP uses runtime proxies.',
    },
  ],
}

export const springEnvironmentLesson: LanguageLesson = {
  id: 'spring-environment',
  title: 'Environment, profiles, @Value vs properties',
  pathId: 'spring-core',
  order: 5,
  level: 'core',
  summary: 'Profiles and configuration binding before Boot-specific precedence deep dive.',
  insight:
    '@Value is quick. Type-safe @ConfigurationProperties scales better. Profiles select property sets.',
  focuses: ['spring', 'spring-boot'],
  teachingSteps: [
    {
      narrative:
        'Environment abstracts property sources (system props, env vars, files). @Value("${x}") injects one key. Profiles activate named groups (dev, prod).',
      why: 'Core Spring idea; Boot adds file conventions and precedence rules.',
    },
    {
      narrative:
        '@ConfigurationProperties binds a prefix to a typed object with validation. Prefer it over dozens of @Value fields for structured config.',
      why: 'Boot docs push this hard - still valid in core Spring.',
    },
    {
      narrative:
        'Plain Java reads config however you like (files, flags). Spring standardizes Environment. Boot adds application.properties/yaml and a well-known precedence order.',
      why: 'Differences of the three layers again.',
    },
  ],
  compare: [
    'Java: ad hoc config loading.',
    'Spring: Environment + profiles + @Value/@ConfigurationProperties.',
    'Boot: application.yml conventions + relaxed binding + precedence.',
  ],
  tradeoffs: [
    '@Value is simple and scatters keys.',
    '@ConfigurationProperties is structured and needs registration.',
  ],
  walkthrough: {
    statement: 'Bind a group of related settings.',
    keyIdea: 'Prefer @ConfigurationProperties over many @Value.',
    approach: ['Define prefix class', 'Enable properties', 'Validate'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Best fit for a cluster of related settings?',
      choices: [
        'Ten @Value fields',
        '@ConfigurationProperties type',
        'Hardcoded constants only',
        'System.out prompts',
      ],
      answer: 1,
      explain: 'Typed properties object keeps config cohesive.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'Spring profiles exist only in Spring Boot, not in Spring Framework.',
      answer: false,
      explain: 'Profiles are a Spring Framework feature; Boot adds conventions around them.',
    },
  ],
}

export const springInterviewPackLesson: LanguageLesson = {
  id: 'spring-interview-pack',
  title: 'Spring interview pack',
  pathId: 'spring-core',
  order: 6,
  level: 'advanced',
  summary: 'Circular deps, bean overriding, prototype-in-singleton, common traps.',
  insight:
    'Most Spring interview bugs are wiring and proxies - not annotations memorization.',
  focuses: ['spring', 'spring-boot'],
  teachingSteps: [
    {
      narrative:
        'Circular dependencies: A needs B needs A. Constructor injection fails fast (good). Field injection may mask cycles with partial init - avoid relying on that. Redesign or use lazy/@Lazy carefully.',
      why: 'Boot 2.6+ discourages circular refs by default.',
    },
    {
      narrative:
        'Bean overriding: two @Bean with same name - last wins depending on settings. Dangerous in large scans. Prefer unique names and explicit config.',
      why: 'Silent override is a production footgun.',
    },
    {
      narrative:
        'Recap traps: prototype-in-singleton, self-invocation @Transactional, missing component scan package, mutable state on singletons.',
      why: 'This pack is the checklist before Spring Boot-specific traps.',
    },
  ],
  compare: [
    'Java: you would notice cycles when writing constructors.',
    'Spring: container can fail or mask cycles depending on injection style.',
    'Boot: stricter defaults on circular references in recent versions.',
  ],
  tradeoffs: [
    'Fail-fast circular ctor injection vs "convenient" field cycles.',
    'Strict bean names vs override flexibility.',
  ],
  walkthrough: {
    statement: 'Context fails to start with a circular reference error.',
    keyIdea: 'Break the cycle in the design.',
    approach: ['Extract third type', 'Event-driven split', 'Avoid @Lazy as first resort'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Constructor injection circular dependency typically:',
      choices: [
        'Always works silently',
        'Fails at context refresh',
        'Deletes a bean at random',
        'Turns beans into prototypes',
      ],
      answer: 1,
      explain: 'Constructor cycles fail fast when creating beans.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'Mutable fields on a singleton @Service are automatically request-isolated.',
      answer: false,
      explain: 'Singletons are shared across requests/threads.',
    },
  ],
}
