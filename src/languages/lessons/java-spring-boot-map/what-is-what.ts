import type { LanguageLesson } from '../../types'

export const whatIsWhatLesson: LanguageLesson = {
  id: 'map-what-is-what',
  title: 'What is what',
  pathId: 'java-spring-boot-map',
  order: 1,
  level: 'intro',
  summary: 'JVM/Java SE vs Spring Framework vs Spring Boot - who owns what.',
  insight:
    'Java is the language. The JVM runs it. Spring is a framework that wires objects. Boot is an opinionated layer on Spring that starts faster.',
  focuses: ['java', 'spring', 'spring-boot'],
  teachingSteps: [
    {
      narrative:
        'Start with Java and the JVM. Java is the language (classes, methods, types). The JDK is the toolkit: compiler, standard library (List, String, threads, files). The JVM (Java Virtual Machine) is the program that loads your compiled .class files and runs them on your machine. You write Java → compile to bytecode → the JVM executes that bytecode. JDBC (Java Database Connectivity) is the standard Java API for talking to relational databases: open a connection, run SQL, read rows. It is part of the Java platform, not Spring. At this layer there is no Spring, no web framework, and no "container" wiring objects for you.',
      why: 'If a bug is about null, threads, memory, equals/hashCode, or raw SQL via JDBC, that is Java/JVM - not Spring. Name the layer first.',
    },
    {
      narrative:
        'Two words people mix up: library vs framework. A library is a jar of useful code you call when you need it (you stay in control of the flow - for example calling a JSON library from your main). A framework is also code you depend on, but it calls your code: it owns the startup loop and plugs your classes into fixed extension points. Spring is a framework (centered on an IoC container). You write beans; Spring creates them and calls into them. Spring Boot is not a new language - it is an opinionated layer on top of the Spring framework that chooses defaults and starts the app for you.',
      why: 'Shortcut: library = you call it. Framework = it calls you. Spring calls your beans. Boot starts Spring with defaults.',
    },
    {
      narrative:
        'A bean is simply an object that Spring manages for you (creates it, holds it, and can hand it to other objects). An IoC container (Inversion of Control) is the Spring runtime that does that management. "Inversion" means: instead of your code calling new OrderService(new OrderRepository()), you tell Spring what depends on what, and Spring creates the objects and plugs them together. That plugging-in is dependency injection.',
      why: 'Plain English: you stop being the factory. Spring is the factory. Beans are the products it keeps in its inventory.',
    },
    {
      narrative:
        'Object lifecycle is a big reason teams use Spring instead of plain new. In plain Java you create objects, and you are also responsible for shutting down anything that holds resources (connections, thread pools, files). With Spring, the container owns a bean lifecycle for the objects it manages: create the bean → inject dependencies → run init callbacks (for example @PostConstruct) → the bean is ready for use → on shutdown run destroy callbacks (@PreDestroy) for singletons. You get one shared instance by default (singleton scope) unless you ask for another scope. That shared lifecycle is hard to reinvent cleanly in every plain-Java main.',
      why: 'Spring benefit over Java: consistent create → wire → use → destroy for the whole object graph, not only for the one class you remembered to clean up.',
    },
    {
      narrative:
        'Spring Framework is a framework made of many optional modules/libraries around that container: MVC (map HTTP URLs to Java methods), data access helpers such as JdbcTemplate (still JDBC underneath, less boilerplate), AOP (wrap extra behavior like logging or security around methods), and transactions (start/commit/rollback database work as a unit). With Spring alone you assemble the stack yourself: pick which modules to add and write the startup/config that turns them on. Benefits over plain Java: dependency injection, managed lifecycle, and ready-made modules for web/data/tx so you do not hand-roll those patterns in every project.',
      why: 'Spring does not replace Java. It organizes Java objects and offers common infrastructure so each app does not reinvent wiring and cross-cutting concerns.',
    },
    {
      narrative:
        'Spring Boot sits on Spring Framework. Same container, same beans, same lifecycle. Boot\'s job is convenience: starters (one dependency that pulls a curated set of jars), auto-configuration (create common beans when the right classes are on the classpath), an embedded server for many web apps, and Actuator for health/metrics. Benefits over Spring-without-Boot: far less startup and wiring code, sensible defaults for services, faster path from empty repo to a running HTTP API. The tradeoff is learning what auto-config turned on.',
      why: 'Interview line: "Boot is the Spring framework plus defaults and packaging." Remove Boot and you still have Java + Spring - with more boilerplate.',
    },
    {
      narrative:
        'Ownership map. Java/JVM: language, memory, threads, bytecode, JDBC. Spring framework: IoC container, bean lifecycle, optional modules you enable. Boot: starters, auto-config, embedded server, production-shaped defaults. When something breaks, ask which layer owns it.',
      why: 'Debugging shortcut: language/JDBC bug vs wiring/lifecycle bug vs Boot auto-config surprise.',
    },
  ],
  compare: [
    'Java + JVM: language and runtime. You call libraries; you own constructors and cleanup.',
    'Spring Framework: a framework whose IoC container creates beans, injects them, and manages lifecycle; optional MVC/JDBC/AOP/tx modules.',
    'Spring Boot: opinionated layer on Spring - starters, auto-config, embedded server - same beans and lifecycle underneath.',
  ],
  tradeoffs: [
    'Plain Java wins for algorithms and tiny tools with no object-graph ceremony.',
    'Spring without Boot wins when you need fine control over every module and dislike auto-config.',
    'Boot wins for typical services when you accept learning its defaults.',
  ],
  walkthrough: {
    statement:
      'Interviews mix up Java, Spring, and Spring Boot. Define library vs framework, JVM, JDBC, bean, IoC, and lifecycle.',
    keyIdea:
      'A library is code you call; a framework calls you. Spring is a framework that manages bean lifecycle. Boot is Spring with defaults.',
    approach: [
      'Define JVM and JDBC before Spring.',
      'Define library vs framework, then bean + IoC + lifecycle.',
      'List Spring benefits over plain Java (wiring + lifecycle + modules).',
      'List Boot benefits over Spring (starters, auto-config, less bootstrap).',
    ],
  },
  quiz: [
    {
      id: 'q-lib',
      type: 'multipleChoice',
      prompt: 'What is the difference between a library and a framework?',
      choices: [
        'There is no difference',
        'You call a library; a framework calls your code and owns more of the flow',
        'A framework cannot run on a JVM',
        'A library always includes an embedded web server',
      ],
      answer: 1,
      explain:
        'Libraries are tools you invoke. Frameworks invert control and call into your extension points - Spring does that with beans.',
    },
    {
      id: 'q1',
      type: 'multipleChoice',
      prompt: 'What is the JVM?',
      choices: [
        'A Spring annotation for web controllers',
        'The runtime that loads and executes Java bytecode',
        'A Maven plugin that downloads Boot starters',
        'Another name for a Spring bean',
      ],
      answer: 1,
      explain:
        'The JVM (Java Virtual Machine) runs your compiled bytecode. Spring and Boot apps still run on a JVM.',
    },
    {
      id: 'q-jdbc',
      type: 'multipleChoice',
      prompt: 'What is JDBC?',
      choices: [
        'A Spring Boot starter that replaces SQL',
        'Java\'s standard API for talking to relational databases with SQL',
        'The IoC container that creates beans',
        'A replacement for the JVM',
      ],
      answer: 1,
      explain:
        'JDBC (Java Database Connectivity) is part of the Java platform. Spring helpers like JdbcTemplate still use JDBC underneath.',
    },
    {
      id: 'q2',
      type: 'multipleChoice',
      prompt: 'In Spring, what is a bean?',
      choices: [
        'A database table row',
        'An object the IoC container creates, wires, and manages through a lifecycle',
        'A replacement for the Java language',
        'Only classes annotated with @SpringBootApplication',
      ],
      answer: 1,
      explain:
        'A bean is an object Spring manages - including creation, injection, and destroy callbacks for singletons.',
    },
    {
      id: 'q-life',
      type: 'trueFalse',
      prompt:
        'A Spring benefit over plain Java is managed object lifecycle (create, inject, init, and destroy callbacks) for beans.',
      answer: true,
      explain:
        'The container owns that lifecycle for managed beans. In plain Java you must do it yourself.',
    },
    {
      id: 'q4',
      type: 'multiSelect',
      prompt: 'Select what Spring Boot typically adds on top of Spring Framework.',
      choices: [
        'Starters and auto-configuration',
        'A new bytecode format that replaces the JVM',
        'An embedded web server for many apps',
        'Replacing the Java type system',
      ],
      answer: [0, 2],
      explain:
        'Boot adds starters, auto-config, and often an embedded server. It still runs Java on a JVM with Spring beans.',
    },
  ],
}
