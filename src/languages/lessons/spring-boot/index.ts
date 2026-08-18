import type { LanguageLesson } from '../../types'

export const bootAutoConfigLesson: LanguageLesson = {
  id: 'boot-auto-config',
  title: 'Auto-configuration and starters',
  pathId: 'spring-boot',
  order: 1,
  level: 'intro',
  summary: 'Starters, @SpringBootApplication, and how auto-config conditions work.',
  insight:
    'Starters pull dependencies; auto-config registers beans when classpath + conditions match.',
  focuses: ['spring-boot', 'spring'],
  teachingSteps: [
    {
      narrative:
        'A starter (spring-boot-starter-web) is a BOM-friendly dependency set. It does not "run code" by itself - it puts jars on the classpath that auto-configuration can see.',
      why: 'Interview: starter ≠ framework magic; it is packaging.',
    },
    {
      narrative:
        '@EnableAutoConfiguration loads configuration classes listed in AutoConfiguration.imports (or spring.factories on older Boot). Conditions like @ConditionalOnClass gate each bean.',
      why: 'You can exclude auto-config when it fights you.',
    },
    {
      narrative:
        '@SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan. Your @Bean usually wins over auto-config when you define the same type (user-provided beans back off auto-config).',
      why: 'Own beans override defaults - critical debugging skill.',
    },
    {
      narrative:
        'Plain Spring: you enable MVC/Data modules yourself. Boot: classpath triggers defaults. Java: neither exists.',
      why: 'Keep the three-way map alive.',
    },
  ],
  codePanes: [
    {
      id: 'app',
      label: 'Boot entrypoint',
      language: 'java',
      code: `@SpringBootApplication
public class BillingApp {
  public static void main(String[] args) {
    SpringApplication.run(BillingApp.class, args);
  }
}`,
    },
  ],
  compare: [
    'Java: no auto-config.',
    'Spring: explicit @Enable* and @Bean setup.',
    'Boot: conditional auto-config from starters/classpath.',
  ],
  tradeoffs: [
    'Fast start vs opaque bean graph - learn to read auto-config report.',
    'Exclusions fix conflicts but add maintenance.',
  ],
  walkthrough: {
    statement: 'Explain what adding spring-boot-starter-web does.',
    keyIdea: 'Dependencies + auto-config for DispatcherServlet/Tomcat etc.',
    approach: ['Name the starter', 'Mention ConditionalOnClass', 'Mention user bean override'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Auto-configuration classes are typically selected because:',
      choices: [
        'They are in your controllers package only',
        'Conditions match (e.g. class on classpath)',
        'The GC decided so',
        'Maven surefire enabled them',
      ],
      answer: 1,
      explain: 'Conditions like @ConditionalOnClass gate auto-config.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'A user-defined @Bean of the same type often causes auto-config to back off.',
      answer: true,
      explain: 'Auto-config is designed to yield to user beans.',
    },
  ],
}

export const bootConfigLesson: LanguageLesson = {
  id: 'boot-config',
  title: 'Externalized configuration',
  pathId: 'spring-boot',
  order: 2,
  level: 'core',
  summary: 'properties/yaml, profiles, relaxed binding, precedence.',
  insight:
    'Boot reads many property sources with a defined precedence. Env vars beat application.properties in common setups.',
  focuses: ['spring-boot', 'spring'],
  teachingSteps: [
    {
      narrative:
        'application.properties / application.yml are the familiar defaults. Profile-specific files (application-prod.yml) layer on when the profile is active.',
      why: 'Separate secrets and prod tuning from defaults.',
    },
    {
      narrative:
        'Relaxed binding: my.service-url can map to MY_SERVICE_URL env var and my.serviceUrl field. @ConfigurationProperties loves this.',
      why: '12-factor friendly config in containers.',
    },
    {
      narrative:
        'Precedence matters (command line, env, profile files, defaults). When a value "does not apply," check a higher-priority source - not only the yaml you edited.',
      why: 'Common Boot debugging session.',
    },
  ],
  compare: [
    'Java: DIY config.',
    'Spring: Environment abstraction.',
    'Boot: file conventions + precedence + relaxed binding.',
  ],
  tradeoffs: [
    'Yaml is nested and mergeable; properties are flat and simple.',
    'Many sources are flexible and hard to reason about without the config tree.',
  ],
  walkthrough: {
    statement: 'Property in application.yml seems ignored in prod.',
    keyIdea: 'Higher-precedence source overrides it.',
    approach: ['Check env/cli', 'Check active profiles', 'Print env in Actuator if enabled'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'Relaxed binding can map environment variables to @ConfigurationProperties fields.',
      answer: true,
      explain: 'Boot relaxed binding is designed for that.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'application-prod.yml applies when:',
      choices: [
        'Always',
        'prod profile is active',
        'Java version is odd',
        'Only in tests',
      ],
      answer: 1,
      explain: 'Profile-specific files follow the active profiles.',
    },
  ],
}

export const bootWebLesson: LanguageLesson = {
  id: 'boot-web',
  title: 'Web layer',
  pathId: 'spring-boot',
  order: 3,
  level: 'core',
  summary: 'DispatcherServlet path, controllers, validation, @ControllerAdvice.',
  insight:
    'Boot auto-configures the servlet stack; you write controllers. Exceptions become consistent via @ControllerAdvice.',
  focuses: ['spring-boot', 'spring'],
  teachingSteps: [
    {
      narrative:
        'Incoming HTTP hits the embedded container, then DispatcherServlet, which maps to @RestController methods. Return values become JSON via HttpMessageConverters.',
      why: 'Know the path before blaming Jackson.',
    },
    {
      narrative:
        '@RequestBody + @Valid triggers bean validation. MethodValidation / @Validated for other cases. Failures can be handled centrally with @ExceptionHandler in @ControllerAdvice.',
      why: 'Consistent API errors beat ad hoc try/catch.',
    },
    {
      narrative:
        'Plain Java: raw sockets or JDK HttpServer. Spring MVC: same DispatcherServlet model without Boot packaging. Boot: embedded Tomcat/Jetty + auto MVC config.',
      why: 'Three-way distinction.',
    },
  ],
  codePanes: [
    {
      id: 'ctrl',
      label: 'Controller',
      language: 'java',
      code: `@RestController
@RequestMapping("/orders")
public class OrderController {
  private final OrderService service;
  public OrderController(OrderService service) {
    this.service = service;
  }

  @PostMapping
  ResponseEntity<Order> create(@Valid @RequestBody CreateOrder req) {
    return ResponseEntity.ok(service.create(req));
  }
}`,
    },
  ],
  compare: [
    'Java: manual HTTP server code.',
    'Spring MVC: DispatcherServlet + annotations.',
    'Boot: embedded server + auto MVC converters.',
  ],
  tradeoffs: [
    'Annotation controllers are fast to write and hide servlet details.',
    'Filter/interceptor order still matters for auth and logging.',
  ],
  walkthrough: {
    statement: 'Build a JSON POST endpoint with validation.',
    keyIdea: 'Controller + @Valid + advice for errors.',
    approach: ['Map route', 'Validate body', 'Centralize exception JSON'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Which component maps requests to controller methods in Spring MVC?',
      choices: ['Garbage collector', 'DispatcherServlet', 'BeanFactoryPostProcessor only', 'Log4j'],
      answer: 1,
      explain: 'DispatcherServlet is the front controller.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: '@ControllerAdvice can centralize exception handling across controllers.',
      answer: true,
      explain: 'That is a primary use case.',
    },
  ],
}

export const bootDataTxLesson: LanguageLesson = {
  id: 'boot-data-tx',
  title: 'Data and transactions',
  pathId: 'spring-boot',
  order: 4,
  level: 'core',
  summary: 'Spring Data JPA sketch and @Transactional boundaries.',
  insight:
    'Repositories reduce boilerplate. @Transactional still needs a proxy boundary and a transaction manager.',
  focuses: ['spring-boot', 'spring'],
  teachingSteps: [
    {
      narrative:
        'Spring Data interfaces (JpaRepository) get implementations at runtime. Boot auto-configures DataSource + EntityManager when starters are present.',
      why: 'You write the interface; Boot wires infrastructure.',
    },
    {
      narrative:
        '@Transactional on a public proxy method starts/commits/rolls back. Propagation and readOnly matter. Exceptions: unchecked roll back by default; checked do not unless configured.',
      why: 'Interview favorite.',
    },
    {
      narrative:
        'Remember self-invocation: transactional advice is Spring AOP. Layer services so external callers cross the proxy.',
      why: 'Ties back to spring-core AOP lesson.',
    },
  ],
  compare: [
    'Java: JDBC by hand, your own tx.',
    'Spring: PlatformTransactionManager + @Transactional.',
    'Boot: auto DataSource/JPA setup via starters.',
  ],
  tradeoffs: [
    'Spring Data speed vs complex queries better in @Query/JOOQ.',
    'Wide @Transactional methods hold DB connections longer.',
  ],
  walkthrough: {
    statement: 'Service method does not roll back on failure.',
    keyIdea: 'Exception type or proxy boundary wrong.',
    approach: ['Check unchecked vs checked', 'Check proxy call', 'Check manager present'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'By default, checked exceptions roll back @Transactional methods.',
      answer: false,
      explain: 'Unchecked (RuntimeException) roll back by default; checked typically do not.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Spring Data JpaRepository implementations are typically:',
      choices: [
        'Hand-written for every method',
        'Generated/proxied at runtime',
        'Stored in the browser',
        'Provided by the JVM verifier',
      ],
      answer: 1,
      explain: 'Spring Data creates repository proxies.',
    },
  ],
}

export const bootTestingLesson: LanguageLesson = {
  id: 'boot-testing',
  title: 'Testing slices',
  pathId: 'spring-boot',
  order: 5,
  level: 'core',
  summary: '@SpringBootTest vs @WebMvcTest vs @DataJpaTest.',
  insight:
    'Full context tests are slow and broad. Slices load only what you need.',
  focuses: ['spring-boot'],
  teachingSteps: [
    {
      narrative:
        '@SpringBootTest loads the whole application context (unless narrowed). Great for integration confidence; costly for a huge suite.',
      why: 'Know the cost.',
    },
    {
      narrative:
        '@WebMvcTest focuses on the web layer - controllers, advice, filters - and mocks collaborators. @DataJpaTest focuses on JPA repositories with an embedded DB slice.',
      why: 'Slice tests catch layer bugs faster.',
    },
    {
      narrative:
        'Plain Java unit tests: new Service(mock). Spring: @ExtendWith(SpringExtension). Boot: spring-boot-starter-test bundles the usual stack.',
      why: 'Three layers again.',
    },
  ],
  compare: [
    'Java: pure unit tests with mocks.',
    'Spring: can test with TestContext framework.',
    'Boot: @SpringBootTest and test slices.',
  ],
  tradeoffs: [
    'Slices are fast and may miss wiring bugs across layers.',
    'Full @SpringBootTest is slow and realistic.',
  ],
  walkthrough: {
    statement: 'Choose a test type for a controller JSON contract.',
    keyIdea: '@WebMvcTest + MockMvc.',
    approach: ['Slice web', 'Mock service', 'Assert JSON'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Best annotation to test only a REST controller layer?',
      choices: ['@DataJpaTest', '@WebMvcTest', '@EntityScan', '@Override'],
      answer: 1,
      explain: '@WebMvcTest is the web slice.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: '@SpringBootTest always runs only the single controller class you name.',
      answer: false,
      explain: 'It loads a (usually full) application context unless configured otherwise.',
    },
  ],
}

export const bootActuatorLesson: LanguageLesson = {
  id: 'boot-actuator',
  title: 'Actuator and production basics',
  pathId: 'spring-boot',
  order: 6,
  level: 'core',
  summary: 'Health, info, metrics exposure and locking down endpoints.',
  insight:
    'Actuator exposes operational endpoints. Secure them; do not leave sensitive endpoints public.',
  focuses: ['spring-boot'],
  teachingSteps: [
    {
      narrative:
        'spring-boot-starter-actuator adds /actuator endpoints: health, metrics, info, and more depending on config. Cloud platforms probe health.',
      why: 'Production readiness is part of Boot\'s pitch.',
    },
    {
      narrative:
        'Exposure is configurable (show details, which endpoints). Combine with security so env dumps are not public.',
      why: 'Interview and real ops concern.',
    },
    {
      narrative:
        'Java has no standard Actuator. Spring can expose JMX/metrics with more wiring. Boot packages opinionated endpoints.',
      why: 'Layer map.',
    },
  ],
  compare: [
    'Java: custom health checks.',
    'Spring: metrics libraries possible.',
    'Boot: Actuator endpoints by convention.',
  ],
  tradeoffs: [
    'More visibility vs larger attack surface if exposed.',
    'Custom health indicators add truth and maintenance.',
  ],
  walkthrough: {
    statement: 'Kubernetes needs a health probe.',
    keyIdea: 'Actuator health endpoint (secured appropriately).',
    approach: ['Add actuator', 'Expose health', 'Lock down the rest'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'trueFalse',
      prompt: 'All Actuator endpoints should be public on the internet by default.',
      answer: false,
      explain: 'Lock down sensitive endpoints; expose only what probes need.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'Actuator is primarily about:',
      choices: [
        'Replacing the JVM',
        'Operational endpoints and metrics',
        'Sorting algorithms',
        'Writing HTML templates only',
      ],
      answer: 1,
      explain: 'Ops visibility is the point.',
    },
  ],
}

export const bootSecurityLesson: LanguageLesson = {
  id: 'boot-security',
  title: 'Security overview',
  pathId: 'spring-boot',
  order: 7,
  level: 'advanced',
  summary: 'Filter chain mental model - interview level, not full OAuth deep dive.',
  insight:
    'Spring Security is a filter chain around the servlet. Boot auto-configures defaults you must customize.',
  focuses: ['spring-boot', 'spring'],
  teachingSteps: [
    {
      narrative:
        'Security sits as servlet filters. Authentication establishes identity; authorization checks access. csrf, sessions, and stateless JWT APIs are different designs.',
      why: 'Interview: filters before controllers.',
    },
    {
      narrative:
        'Boot\'s security starter can lock everything behind defaults - great for safety, surprising for first /hello. You declare a SecurityFilterChain bean to configure paths.',
      why: 'Common first-day Boot Security confusion.',
    },
    {
      narrative:
        'Do not confuse "Spring Security" (framework) with "Boot starter" (classpath + auto-config). OAuth2 resource servers are another module - out of v1 depth beyond naming.',
      why: 'Stay within plan scope while showing the map.',
    },
  ],
  compare: [
    'Java: custom filters/auth.',
    'Spring Security: filter chain + annotations.',
    'Boot: starter auto-config + SecurityFilterChain bean customization.',
  ],
  tradeoffs: [
    'Session auth vs stateless JWT.',
    'Default-secure Boot vs friction for public health endpoints.',
  ],
  walkthrough: {
    statement: 'All endpoints suddenly 401 after adding security starter.',
    keyIdea: 'Default security auto-config.',
    approach: ['Add SecurityFilterChain', 'Permit health/actuator as needed', 'Keep the rest locked'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Spring Security primarily integrates with web apps as:',
      choices: [
        'A garbage collector plugin',
        'A servlet filter chain',
        'A replacement for JDBC',
        'A CSS framework',
      ],
      answer: 1,
      explain: 'Filters wrap the request before controllers.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'Adding spring-boot-starter-security can secure endpoints via auto-configuration until you customize.',
      answer: true,
      explain: 'Defaults often require auth until you configure a filter chain.',
    },
  ],
}

export const bootInterviewTrapsLesson: LanguageLesson = {
  id: 'boot-interview-traps',
  title: 'Boot interview traps',
  pathId: 'spring-boot',
  order: 8,
  level: 'advanced',
  summary: 'Component scan base package, fat jar, DevTools, conditionals, cycles.',
  insight:
    'Most Boot failures are packaging, scan base package, or fighting auto-config - not "Boot is broken."',
  focuses: ['spring-boot', 'spring', 'java'],
  teachingSteps: [
    {
      narrative:
        'Put @SpringBootApplication in a root package above your components. If main lives in com.example.app and controllers are in com.other, scan misses them.',
      why: 'Extremely common.',
    },
    {
      narrative:
        'Fat jar nested loader differs from IDE classpath (see Java classloading lesson). DevTools restart is classpath magic - do not rely on it in prod.',
      why: 'Works-on-my-machine → jar failure.',
    },
    {
      narrative:
        'Conditional beans: debug with --debug or auto-config report. Circular deps stricter in recent Boot. Know how to exclude auto-config for a conflicting DataSource.',
      why: 'Senior-level Boot fluency.',
    },
    {
      narrative:
        'War vs jar: embedded server vs external servlet container. Most modern services ship executable jars.',
      why: 'Legacy deploy questions still appear.',
    },
  ],
  compare: [
    'Java: classpath is flat jars/classes.',
    'Spring: scan base packages matter.',
    'Boot: nested fat jar + auto-config conditions + DevTools.',
  ],
  tradeoffs: [
    'Executable jar simplicity vs traditional war ops standards.',
    'DevTools productivity vs prod parity.',
  ],
  walkthrough: {
    statement: 'Context starts but controllers 404.',
    keyIdea: 'Component scan never saw the controller package.',
    approach: ['Move main package up', 'Or @ComponentScan explicitly', 'Verify bean in context'],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'Controllers not scanned often because:',
      choices: [
        'GC deleted them',
        '@SpringBootApplication base package does not cover them',
        'YAML forbids controllers',
        'Maven cannot compile Java',
      ],
      answer: 1,
      explain: 'Scan starts from the Boot application class package by default.',
    },
    {
      id: 'q2',
      type: 'trueFalse',
      prompt: 'Spring Boot DevTools is intended as a production clustering solution.',
      answer: false,
      explain: 'DevTools is a development-time convenience.',
    },
    {
      id: 'q3',
      type: 'multiSelect',
      prompt: 'Useful responses when auto-config fights you:',
      choices: [
        'Read the auto-config report / --debug',
        'Exclude a specific auto-configuration',
        'Delete the JVM',
        'Define your own @Bean to override',
      ],
      answer: [0, 1, 3],
      explain: 'Debug, exclude, or override - do not delete the JVM.',
    },
  ],
}
