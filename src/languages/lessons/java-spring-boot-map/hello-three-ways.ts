import type { LanguageLesson } from '../../types'

export const helloThreeWaysLesson: LanguageLesson = {
  id: 'map-hello-three-ways',
  title: 'Hello world three ways',
  pathId: 'java-spring-boot-map',
  order: 2,
  level: 'intro',
  summary: 'Plain Java main vs Spring @Configuration vs Boot @SpringBootApplication.',
  insight:
    'Same Greeter three ways: you construct it, Spring constructs it, or Boot starts Spring for you.',
  focuses: ['java', 'spring', 'spring-boot'],
  teachingSteps: [
    {
      narrative:
        'In plain Java you create dependencies yourself with new (or a factory you wrote). The main method is where the app starts and where you build the object graph. Every constructor call is visible. You also own cleanup if those objects hold resources. There is no shared container lifecycle unless you build one.',
      why: 'Baseline: full control, full responsibility. Spring\'s benefits only make sense against this picture.',
    },
    {
      narrative:
        'With Spring Framework (no Boot) you mark classes as beans (@Component) or define them with @Bean methods. To start the container you create an ApplicationContext - the object that holds beans and runs their lifecycle. AnnotationConfigApplicationContext is one concrete ApplicationContext: it reads Java config classes (like AppConfig with @Configuration / @ComponentScan) instead of old XML files. new AnnotationConfigApplicationContext(AppConfig.class) means: "start Spring using this config class, scan/create beans, inject dependencies, run init callbacks." Then ctx.getBean(Greeter.class) asks the live container for Greeter.',
      why: 'AnnotationConfigApplicationContext = Spring\'s IoC container started from annotated Java config. Benefits over plain Java: Spring creates the graph, injects deps, and manages bean lifecycle for you.',
    },
    {
      narrative:
        'With Spring Boot you still use the same Spring ApplicationContext and the same beans/lifecycle. SpringApplication.run(App.class, args) creates and refreshes that context for you. @SpringBootApplication turns on component scan and auto-configuration so you do not hand-write as much of the AnnotationConfigApplicationContext setup. If you add a web starter, Boot can also start an embedded Tomcat - setup that older Spring apps often configured manually.',
      why: 'Benefit of Boot over Spring-alone: less bootstrap code and sensible defaults, while beans remain Spring beans with the same lifecycle.',
    },
    {
      narrative:
        'Benefits recap for this hello-world. Spring over Java: you stop scattering new and manual wiring; the container builds Greeter (and collaborators), and it can run init/destroy lifecycle hooks consistently. Boot over Spring: you usually skip writing the AnnotationConfigApplicationContext bootstrap yourself; starters and auto-config fill in common infrastructure so a service can expose /hello with less ceremony.',
      why: 'Keep the ladder clear: Java → Spring (wiring + lifecycle) → Boot (defaults + faster startup).',
    },
  ],
  codePanes: [
    {
      id: 'java',
      label: 'Plain Java',
      language: 'java',
      code: `public class App {
  public static void main(String[] args) {
    Greeter greeter = new Greeter();
    System.out.println(greeter.hello("world"));
  }
}

class Greeter {
  String hello(String name) { return "Hello, " + name; }
}`,
    },
    {
      id: 'spring',
      label: 'Spring',
      language: 'java',
      code: `@Configuration
@ComponentScan
class AppConfig {}

@Component
class Greeter {
  String hello(String name) { return "Hello, " + name; }
}

// AnnotationConfigApplicationContext = ApplicationContext
// started from annotated Java config (not XML).
// AnnotationConfigApplicationContext ctx =
//   new AnnotationConfigApplicationContext(AppConfig.class);
// Greeter g = ctx.getBean(Greeter.class);
// ctx.close(); // triggers destroy callbacks for singletons`,
    },
    {
      id: 'boot',
      label: 'Spring Boot',
      language: 'java',
      code: `@SpringBootApplication
public class App {
  public static void main(String[] args) {
    // Starts an ApplicationContext for you (same Spring container).
    SpringApplication.run(App.class, args);
  }
}

@RestController
class HelloController {
  private final Greeter greeter;
  HelloController(Greeter greeter) { this.greeter = greeter; }

  @GetMapping("/hello")
  String hello() { return greeter.hello("world"); }
}

@Component
class Greeter {
  String hello(String name) { return "Hello, " + name; }
}`,
    },
  ],
  compare: [
    'Java: you call constructors and own cleanup. No ApplicationContext.',
    'Spring: AnnotationConfigApplicationContext (an ApplicationContext) creates beans, injects them, and manages lifecycle from Java config.',
    'Boot: SpringApplication.run starts that same kind of context with scan + auto-config defaults.',
  ],
  tradeoffs: [
    'Plain Java is clearest for tiny programs and language interviews.',
    'Spring without Boot: you see the ApplicationContext bootstrap clearly, but you write more startup code.',
    'Boot: shorter path to a service; you must still understand the Spring context and lifecycle underneath.',
  ],
  walkthrough: {
    statement: 'Show the same Greeter obtained three ways and name the container.',
    keyIdea:
      'AnnotationConfigApplicationContext is Spring\'s annotation-based ApplicationContext. Boot starts an ApplicationContext for you.',
    approach: [
      'Plain Java: new Greeter() in main.',
      'Spring: start AnnotationConfigApplicationContext with a @Configuration class, then getBean.',
      'Boot: SpringApplication.run - same bean model, less bootstrap.',
      'Say the Spring benefits (wiring + lifecycle) and Boot benefits (defaults + less setup).',
    ],
  },
  quiz: [
    {
      id: 'q-ctx',
      type: 'multipleChoice',
      prompt: 'What is AnnotationConfigApplicationContext?',
      choices: [
        'A database driver',
        'An ApplicationContext implementation that starts Spring from annotated Java config classes',
        'A replacement for the JVM',
        'A Boot-only annotation',
      ],
      answer: 1,
      explain:
        'It is the Spring IoC container started from @Configuration / component-scan style config instead of XML.',
    },
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'In the Boot example, who constructs Greeter?',
      choices: [
        'new Greeter() in main',
        'The Spring container after component scan',
        'The JVM classloader as a static singleton',
        'Maven surefire',
      ],
      answer: 1,
      explain:
        'Boot still uses Spring\'s container. @Component makes Greeter a bean; the controller gets it by injection.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'A clear benefit of Spring over plain Java in this lesson is:',
      choices: [
        'It removes the need for a JVM',
        'The container wires objects and manages bean lifecycle for you',
        'It makes SQL illegal',
        'It replaces Java with a new language',
      ],
      answer: 1,
      explain:
        'Dependency injection plus managed create/inject/init/destroy is the core Spring win over hand-rolled new.',
    },
    {
      id: 'q3',
      type: 'trueFalse',
      prompt:
        'SpringApplication.run still starts a Spring ApplicationContext under the hood.',
      answer: true,
      explain:
        'Boot bootstraps Spring. Beans and lifecycle remain Spring concepts.',
    },
  ],
}
