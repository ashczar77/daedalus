import type { LanguageLesson } from '../../types'

/**
 * Early map-path lesson: common Spring / Boot annotations in plain language.
 * Placed after hello-three-ways so learners have seen the annotations in code.
 */
export const annotationsGuideLesson: LanguageLesson = {
  id: 'map-annotations-guide',
  title: 'Annotations guide',
  pathId: 'java-spring-boot-map',
  order: 3,
  level: 'intro',
  summary:
    '@Component, @Bean, stereotypes, injection, web, and Boot entrypoint annotations.',
  insight:
    'Most Spring annotations either register a bean, ask for a bean, or configure how the container / web layer behaves.',
  focuses: ['spring', 'spring-boot', 'java'],
  teachingSteps: [
    {
      narrative:
        'An annotation is metadata on a class, method, or field. Java itself does not create Spring beans from annotations. Spring (and Boot) read those annotations at startup and act on them. Think of them as labels the framework understands.',
      why: 'Without that mental model, @Component looks like magic syntax instead of a signal to the container.',
    },
    {
      narrative:
        'Registering beans - two common styles. @Component on a class means: "scan this class and create one bean from it." @Service, @Repository, and @Controller / @RestController are specialized @Component stereotypes (same idea, clearer intent: business service, data access, web layer). @Bean goes on a method inside a @Configuration class and means: "call this method and register its return value as a bean" - useful for types you cannot annotate (third-party classes).',
      why: 'Interview sound bite: @Component for your classes; @Bean for objects you build in config.',
    },
    {
      narrative:
        'Getting beans into other beans (injection). Prefer a constructor parameter: Spring sees OrderService(OrderRepository repo) and supplies the repo bean. @Autowired on a constructor is optional in modern Spring if there is a single constructor. @Autowired on a field also works but hides dependencies and makes tests harder - prefer constructors. @Value("${...}") injects one config property string/number; it is not for injecting other beans.',
      why: 'Constructor injection keeps required dependencies visible and final.',
    },
    {
      narrative:
        'Telling Spring where to look. @Configuration marks a class as a source of @Bean methods. @ComponentScan (often implied) sets which packages Spring searches for @Component classes. @SpringBootApplication on your main class is a Boot convenience: it is @Configuration + @EnableAutoConfiguration + @ComponentScan in one. That is why Boot apps usually put the main class in a root package above the rest of the code.',
      why: 'Missing beans are often a scan/base-package problem, not a broken JVM.',
    },
    {
      narrative:
        'Web annotations (Spring MVC, common with Boot web starter). @RestController = @Controller + JSON-style responses by default. @RequestMapping / @GetMapping / @PostMapping map HTTP paths and methods to handler methods. @RequestBody reads JSON into a Java object; @PathVariable / @RequestParam read pieces of the URL or query string. None of these replace the IoC container - they sit on beans the container already created.',
      why: 'Web annotations describe HTTP. @Component-family annotations describe the object graph.',
    },
    {
      narrative:
        'What this lesson leaves for later paths (on purpose). @Transactional and AOP-related annotations wrap method calls with extra behavior (transactions, security). You will cover those in Spring core after the map path. For now, remember: annotations are labels; Spring reads them; Boot mainly turns on scanning and auto-config so fewer labels and less XML/JavaConfig are needed up front.',
      why: 'Stay in order: know registration and injection first, then cross-cutting annotations.',
    },
  ],
  codePanes: [
    {
      id: 'register',
      label: 'Register beans',
      language: 'java',
      code: `// Stereotype: Spring scans and creates a bean
@Service
public class OrderService {
  private final OrderRepository repo;

  // Injection via constructor (preferred)
  public OrderService(OrderRepository repo) {
    this.repo = repo;
  }
}

@Repository
public class OrderRepository { }

// @Bean: factory method for types you do not own
@Configuration
class InfraConfig {
  @Bean
  Greeter greeter() {
    return new Greeter();
  }
}`,
    },
    {
      id: 'boot-web',
      label: 'Boot + web',
      language: 'java',
      code: `@SpringBootApplication // @Configuration + auto-config + component scan
public class App {
  public static void main(String[] args) {
    SpringApplication.run(App.class, args);
  }
}

@RestController
@RequestMapping("/hello")
class HelloController {
  private final Greeter greeter;

  HelloController(Greeter greeter) {
    this.greeter = greeter;
  }

  @GetMapping
  String hello(@RequestParam String name) {
    return greeter.hello(name);
  }
}`,
    },
  ],
  compare: [
    'Java: no Spring annotations; you use new and pass dependencies yourself.',
    'Spring: @Component/@Bean register beans; constructor injection wires them; @Configuration/@ComponentScan control setup.',
    'Boot: @SpringBootApplication bundles scan + auto-config; web annotations work the same once the web starter is present.',
  ],
  tradeoffs: [
    'Stereotypes (@Service) document intent; plain @Component is enough technically.',
    '@Bean is flexible for third-party types; overusing it recreates an XML-style central config.',
    'Field @Autowired is short and hurts testability - prefer constructors.',
  ],
  walkthrough: {
    statement: 'Read Spring code without treating every @ as mystery.',
    keyIdea:
      'Ask: does this annotation register a bean, inject something, configure scanning, or map HTTP?',
    approach: [
      'Spot registration (@Component family or @Bean).',
      'Spot injection (constructor / @Autowired / @Value).',
      'Spot Boot entry (@SpringBootApplication) vs web mappings (@GetMapping, ...).',
      'Leave @Transactional / AOP for the Spring core path.',
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'What does @Component on a class tell Spring?',
      choices: [
        'Delete the class at runtime',
        'Create and manage an instance of this class as a bean (when scanned)',
        'Compile the class to a different bytecode format',
        'Replace the JVM',
      ],
      answer: 1,
      explain:
        '@Component marks a class for component scanning so Spring can register it as a bean.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'When is @Bean especially useful?',
      choices: [
        'Only for String fields',
        'When you need to register a bean for a type you cannot annotate (often third-party)',
        'When you want to avoid the JVM',
        'Only inside @RestController methods',
      ],
      answer: 1,
      explain:
        '@Bean methods on @Configuration classes are factory methods for the container.',
    },
    {
      id: 'q3',
      type: 'multiSelect',
      prompt: 'Which annotations are stereotypes built on @Component?',
      choices: ['@Service', '@Repository', '@Bean', '@RestController'],
      answer: [0, 1, 3],
      explain:
        '@Service, @Repository, and @RestController (via @Controller) are component stereotypes. @Bean is a factory-method style registration.',
    },
    {
      id: 'q4',
      type: 'trueFalse',
      prompt:
        '@SpringBootApplication includes component scanning and auto-configuration meta-annotations.',
      answer: true,
      explain:
        'It composes @Configuration, @EnableAutoConfiguration, and @ComponentScan.',
    },
  ],
}
