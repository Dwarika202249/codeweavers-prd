import type { BlogPost } from '../types';

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Why Concept→Build→Debug is the Only Way to Learn Programming',
    slug: 'concept-build-debug-methodology',
    excerpt: 'Forget passive video tutorials. The fastest path to coding mastery is through understanding concepts, building real projects, and debugging your way to enlightenment.',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">
        After training hundreds of students over the past 4 years, I've seen every learning approach imaginable. 
        Some work. Most don't. But there's one methodology that consistently transforms beginners into job-ready developers: 
        <strong>Concept → Build → Debug</strong>.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">The Problem with Traditional Learning</h2>
      <p class="text-gray-300 mb-4">
        Most aspiring developers fall into the "tutorial trap." They watch hours of video content, follow along step-by-step, 
        and feel productive. But when they try to build something on their own? Complete paralysis.
      </p>
      <p class="text-gray-300 mb-4">
        This happens because passive consumption doesn't create neural pathways for problem-solving. 
        You're essentially watching someone else exercise and expecting to get fit.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">The Three Pillars</h2>
      
      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">1. Concept (20% of Time)</h3>
      <p class="text-gray-300 mb-4">
        Before writing any code, understand the <em>why</em> behind what you're learning. Don't just memorize that 
        <code class="bg-gray-800 px-2 py-1 rounded">useState</code> updates state—understand how React's reconciliation 
        works and why immutability matters.
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Read documentation, not just tutorials</li>
        <li>Draw diagrams of data flow</li>
        <li>Explain concepts out loud (rubber duck debugging starts here)</li>
      </ul>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">2. Build (50% of Time)</h3>
      <p class="text-gray-300 mb-4">
        This is where the magic happens. Build projects that are slightly beyond your current skill level. 
        If you're comfortable, you're not growing.
      </p>
      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <p class="text-indigo-400 font-semibold mb-2">Pro Tip:</p>
        <p class="text-gray-300">
          Start with a project idea you care about. Building a todo app for the 10th time won't teach you much. 
          Build something you'll actually use.
        </p>
      </div>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">3. Debug (30% of Time)</h3>
      <p class="text-gray-300 mb-4">
        Here's the secret most tutorials won't tell you: <strong>debugging teaches you more than building</strong>. 
        When something breaks, you're forced to understand how things actually work.
      </p>
      <p class="text-gray-300 mb-4">
        Every error message is a learning opportunity. Every stack trace is a roadmap to understanding.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Putting It Into Practice</h2>
      <p class="text-gray-300 mb-4">
        Here's how I structure my bootcamp curriculum around this methodology:
      </p>
      <ol class="list-decimal list-inside text-gray-300 mb-4 space-y-2">
        <li>Morning session: Concept introduction with real-world context</li>
        <li>Hands-on project: Build something using the new concept</li>
        <li>Intentional breaking: I introduce bugs for students to fix</li>
        <li>Code review: Discuss different solutions and tradeoffs</li>
      </ol>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">The Results Speak</h2>
      <p class="text-gray-300 mb-4">
        Students who embrace this methodology consistently outperform in interviews. Why? Because interviewers 
        don't care if you've memorized syntax—they want to see problem-solving skills and conceptual understanding.
      </p>
      <p class="text-gray-300 mb-4">
        Ready to transform your learning approach? Check out my bootcamp programs where we put this methodology into action every single day.
      </p>
    `,
    author: 'Dwarika Kumar',
    publishedAt: '2025-01-15',
    readTime: '8 min read',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    tags: ['Learning', 'Methodology', 'Career'],
  },
  {
    id: '2',
    title: 'Java vs JavaScript: Which Should You Learn First?',
    slug: 'java-vs-javascript-beginners',
    excerpt: 'A practical comparison for beginners trying to choose their first programming language. Spoiler: the answer depends on your goals.',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">
        "Should I learn Java or JavaScript?" This is probably the most common question I get from students. 
        Despite the similar names, these are vastly different languages with different use cases. 
        Let me break it down for you.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">The Name Confusion</h2>
      <p class="text-gray-300 mb-4">
        First, let's address the elephant in the room: Java and JavaScript are about as similar as "car" and "carpet." 
        The naming was a marketing decision from the 90s when JavaScript was created to ride Java's popularity wave.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Java: The Enterprise Powerhouse</h2>
      <p class="text-gray-300 mb-4">
        Java is a statically-typed, compiled language that runs on the Java Virtual Machine (JVM). 
        It's been around since 1995 and powers a massive portion of enterprise software.
      </p>
      
      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">When to Choose Java:</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li><strong>Enterprise jobs:</strong> Banks, insurance companies, and large corporations love Java</li>
        <li><strong>Android development:</strong> Java (and Kotlin) are the primary languages for Android</li>
        <li><strong>Backend services:</strong> Spring Boot is incredibly popular for microservices</li>
        <li><strong>Strong typing preference:</strong> If you want the compiler to catch errors early</li>
      </ul>

      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <p class="text-green-400 font-semibold mb-2">Java Strengths:</p>
        <ul class="list-disc list-inside text-gray-300 space-y-1">
          <li>Excellent performance</li>
          <li>Strong type safety</li>
          <li>Massive ecosystem and libraries</li>
          <li>High-paying enterprise jobs</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">JavaScript: The Web's Language</h2>
      <p class="text-gray-300 mb-4">
        JavaScript is a dynamically-typed, interpreted language that started in browsers and now runs everywhere—servers, 
        mobile apps, desktop apps, and even IoT devices.
      </p>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">When to Choose JavaScript:</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li><strong>Web development:</strong> It's the only language that runs natively in browsers</li>
        <li><strong>Startup ecosystem:</strong> Fast iteration speed makes it popular with startups</li>
        <li><strong>Full-stack development:</strong> Use one language for frontend and backend (Node.js)</li>
        <li><strong>Quick prototyping:</strong> Get ideas to production faster</li>
      </ul>

      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <p class="text-blue-400 font-semibold mb-2">JavaScript Strengths:</p>
        <ul class="list-disc list-inside text-gray-300 space-y-1">
          <li>Lower barrier to entry</li>
          <li>Immediate visual feedback</li>
          <li>Huge job market (especially frontend)</li>
          <li>Versatility across platforms</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">My Recommendation</h2>
      <p class="text-gray-300 mb-4">
        Based on my experience training students for the Indian IT job market, here's my take:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li><strong>For service-based companies (TCS, Infosys, HCL):</strong> Learn Java first. These companies heavily use Java for enterprise projects.</li>
        <li><strong>For product companies and startups:</strong> JavaScript/React skills are in high demand.</li>
        <li><strong>For maximum flexibility:</strong> Learn both! My Full-Stack bootcamp covers both for this reason.</li>
      </ul>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">The Bottom Line</h2>
      <p class="text-gray-300 mb-4">
        There's no wrong choice here. Both languages have excellent job prospects and will serve you well. 
        The best language to learn is the one you'll actually stick with and build projects in.
      </p>
      <p class="text-gray-300 mb-4">
        Want to learn both? Check out my Full-Stack Java bootcamp where we cover Java, Spring Boot, JavaScript, and React in one comprehensive program.
      </p>
    `,
    author: 'Dwarika Kumar',
    publishedAt: '2025-01-10',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    tags: ['Java', 'JavaScript', 'Beginners'],
  },
  {
    id: '3',
    title: 'Building Your First REST API: A Complete Guide',
    slug: 'building-first-rest-api',
    excerpt: 'Step-by-step tutorial on creating a production-ready REST API using Spring Boot. From project setup to deployment.',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">
        REST APIs are the backbone of modern web applications. In this tutorial, I'll walk you through building 
        a complete REST API using Spring Boot—the same approach I teach in my Java bootcamp.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">What We'll Build</h2>
      <p class="text-gray-300 mb-4">
        We'll create a simple Task Management API with full CRUD operations. By the end, you'll have:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>GET /api/tasks - List all tasks</li>
        <li>GET /api/tasks/{id} - Get a specific task</li>
        <li>POST /api/tasks - Create a new task</li>
        <li>PUT /api/tasks/{id} - Update a task</li>
        <li>DELETE /api/tasks/{id} - Delete a task</li>
      </ul>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Step 1: Project Setup</h2>
      <p class="text-gray-300 mb-4">
        Head to <a href="https://start.spring.io" class="text-indigo-400 hover:text-indigo-300">start.spring.io</a> and create a new project with these dependencies:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Spring Web</li>
        <li>Spring Data JPA</li>
        <li>H2 Database (for development)</li>
        <li>Lombok (optional, but saves boilerplate)</li>
      </ul>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Step 2: Create the Entity</h2>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">@Entity
@Data
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private boolean completed;
    private LocalDateTime createdAt;
}</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Step 3: Create the Repository</h2>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">@Repository
public interface TaskRepository 
    extends JpaRepository&lt;Task, Long&gt; {
    
    List&lt;Task&gt; findByCompleted(boolean completed);
}</code></pre>
      <p class="text-gray-300 mb-4">
        Spring Data JPA automatically implements this interface. No boilerplate code needed!
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Step 4: Create the Service Layer</h2>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">@Service
public class TaskService {
    private final TaskRepository repository;
    
    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }
    
    public List&lt;Task&gt; getAllTasks() {
        return repository.findAll();
    }
    
    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        return repository.save(task);
    }
    
    // ... other methods
}</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Step 5: Create the Controller</h2>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService service;
    
    @GetMapping
    public List&lt;Task&gt; getAllTasks() {
        return service.getAllTasks();
    }
    
    @PostMapping
    public ResponseEntity&lt;Task&gt; createTask(
        @RequestBody Task task) {
        Task created = service.createTask(task);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(created);
    }
    
    // ... other endpoints
}</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Step 6: Test Your API</h2>
      <p class="text-gray-300 mb-4">
        Run your application and test with curl or Postman:
      </p>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300"># Create a task
curl -X POST http://localhost:8080/api/tasks \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Learn Spring Boot","description":"Build a REST API"}'

# Get all tasks
curl http://localhost:8080/api/tasks</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Best Practices</h2>
      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <ul class="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>Use DTOs:</strong> Don't expose your entities directly</li>
          <li><strong>Add validation:</strong> Use @Valid and Bean Validation</li>
          <li><strong>Handle exceptions:</strong> Create a global exception handler</li>
          <li><strong>Document your API:</strong> Use Swagger/OpenAPI</li>
          <li><strong>Write tests:</strong> Unit tests + integration tests</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Next Steps</h2>
      <p class="text-gray-300 mb-4">
        This is just the beginning! In a production API, you'd also want:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Authentication & Authorization (Spring Security)</li>
        <li>Database migrations (Flyway/Liquibase)</li>
        <li>Caching (Redis)</li>
        <li>Monitoring (Actuator, Prometheus)</li>
      </ul>
      <p class="text-gray-300 mb-4">
        Want to master all of this? My Java Full-Stack bootcamp covers building production-grade APIs from scratch.
      </p>
    `,
    author: 'Dwarika Kumar',
    publishedAt: '2025-01-05',
    readTime: '12 min read',
    coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    tags: ['Spring Boot', 'REST API', 'Java', 'Tutorial'],
  },
  {
    id: '4',
    title: 'React Hooks Explained: useState, useEffect, and Beyond',
    slug: 'react-hooks-explained',
    excerpt: 'A comprehensive guide to React Hooks for developers transitioning from class components or just starting out.',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">
        React Hooks revolutionized how we write React components. If you're still writing class components 
        or just starting with React, this guide will get you up to speed with hooks.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Why Hooks?</h2>
      <p class="text-gray-300 mb-4">
        Before hooks, you needed class components to use state or lifecycle methods. This led to:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Confusing <code class="bg-gray-800 px-2 py-1 rounded">this</code> binding</li>
        <li>Complex component hierarchies (wrapper hell)</li>
        <li>Difficulty reusing stateful logic</li>
        <li>Bloated components mixing unrelated logic</li>
      </ul>
      <p class="text-gray-300 mb-4">
        Hooks solve all of these problems elegantly.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">useState: Managing State</h2>
      <p class="text-gray-300 mb-4">
        The most basic hook. It lets you add state to functional components.
      </p>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    &lt;div&gt;
      &lt;p&gt;Count: {count}&lt;/p&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Increment
      &lt;/button&gt;
    &lt;/div&gt;
  );
}</code></pre>

      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <p class="text-yellow-400 font-semibold mb-2">⚠️ Common Mistake:</p>
        <p class="text-gray-300">
          State updates are asynchronous! If you need to update based on previous state, 
          use the functional form: <code class="bg-gray-800 px-2 py-1 rounded">setCount(prev => prev + 1)</code>
        </p>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">useEffect: Side Effects</h2>
      <p class="text-gray-300 mb-4">
        This hook replaces componentDidMount, componentDidUpdate, and componentWillUnmount.
      </p>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // This runs after render
    fetchUser(userId).then(setUser);
    
    // Cleanup function (optional)
    return () => {
      // Runs before next effect or unmount
    };
  }, [userId]); // Dependency array
  
  return user ? &lt;div&gt;{user.name}&lt;/div&gt; : &lt;div&gt;Loading...&lt;/div&gt;;
}</code></pre>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">Dependency Array Rules:</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li><code class="bg-gray-800 px-2 py-1 rounded">[]</code> - Run once on mount</li>
        <li><code class="bg-gray-800 px-2 py-1 rounded">[dep1, dep2]</code> - Run when dependencies change</li>
        <li>No array - Run after every render (usually not what you want)</li>
      </ul>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">useContext: Sharing Data</h2>
      <p class="text-gray-300 mb-4">
        Avoid prop drilling by sharing data across components.
      </p>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">const ThemeContext = createContext('light');

function App() {
  return (
    &lt;ThemeContext.Provider value="dark"&gt;
      &lt;DeepNestedComponent /&gt;
    &lt;/ThemeContext.Provider&gt;
  );
}

function DeepNestedComponent() {
  const theme = useContext(ThemeContext);
  return &lt;div className={theme}&gt;Themed content&lt;/div&gt;;
}</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">useRef: Mutable References</h2>
      <p class="text-gray-300 mb-4">
        Access DOM elements or store mutable values that don't trigger re-renders.
      </p>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    &lt;&gt;
      &lt;input ref={inputRef} /&gt;
      &lt;button onClick={focusInput}&gt;Focus&lt;/button&gt;
    &lt;/&gt;
  );
}</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Custom Hooks: Reusable Logic</h2>
      <p class="text-gray-300 mb-4">
        Extract and reuse stateful logic across components.
      </p>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  // ...
}</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Rules of Hooks</h2>
      <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 my-6">
        <ul class="list-disc list-inside text-gray-300 space-y-2">
          <li><strong>Only call hooks at the top level</strong> - Never inside loops, conditions, or nested functions</li>
          <li><strong>Only call hooks from React functions</strong> - Components or custom hooks</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Practice Exercise</h2>
      <p class="text-gray-300 mb-4">
        Try building a custom <code class="bg-gray-800 px-2 py-1 rounded">useFetch</code> hook that handles loading states, 
        errors, and data fetching. It's a great way to solidify your understanding!
      </p>
      <p class="text-gray-300 mb-4">
        Want hands-on practice with hooks and modern React patterns? Check out my Frontend Development bootcamp.
      </p>
    `,
    author: 'Dwarika Kumar',
    publishedAt: '2024-12-28',
    readTime: '10 min read',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    tags: ['React', 'JavaScript', 'Frontend'],
  },
  {
    id: '5',
    title: 'How I Prepared Students for HCL and Cognizant Interviews',
    slug: 'hcl-cognizant-interview-prep',
    excerpt: 'Inside look at the interview preparation strategies that helped my students land jobs at top IT companies.',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">
        Over the past 4 years, I've helped numerous students crack interviews at HCL, Cognizant, TCS, and other 
        top IT companies. Here's the exact preparation strategy that consistently works.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Understanding the Interview Process</h2>
      <p class="text-gray-300 mb-4">
        Most service-based IT companies follow a similar pattern:
      </p>
      <ol class="list-decimal list-inside text-gray-300 mb-4 space-y-2">
        <li><strong>Online Assessment:</strong> Aptitude + Coding questions</li>
        <li><strong>Technical Interview:</strong> Core concepts + Problem solving</li>
        <li><strong>HR Interview:</strong> Communication + Culture fit</li>
      </ol>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Phase 1: Foundation Building (Weeks 1-4)</h2>
      
      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">Core Java Concepts</h3>
      <p class="text-gray-300 mb-4">
        These companies LOVE Java fundamentals. Master these topics:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>OOP concepts (with real examples, not textbook definitions)</li>
        <li>Collections framework (ArrayList vs LinkedList, HashMap internals)</li>
        <li>Exception handling (checked vs unchecked)</li>
        <li>Multithreading basics (Thread lifecycle, synchronization)</li>
        <li>Java 8 features (Streams, Lambda, Optional)</li>
      </ul>

      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <p class="text-indigo-400 font-semibold mb-2">Interview Tip:</p>
        <p class="text-gray-300">
          When asked about OOP, don't just define it. Give real-world examples. 
          "Inheritance is like how a Car class extends Vehicle class, inheriting properties like numberOfWheels 
          while adding its own like numberOfDoors."
        </p>
      </div>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">SQL Mastery</h3>
      <p class="text-gray-300 mb-4">
        Every technical round includes SQL. Focus on:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>JOINs (INNER, LEFT, RIGHT, FULL - with Venn diagrams)</li>
        <li>Aggregate functions (GROUP BY, HAVING)</li>
        <li>Subqueries and correlated subqueries</li>
        <li>Window functions (ROW_NUMBER, RANK)</li>
        <li>Query optimization basics</li>
      </ul>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Phase 2: Problem Solving (Weeks 5-8)</h2>
      
      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">Data Structures & Algorithms</h3>
      <p class="text-gray-300 mb-4">
        For service companies, you don't need LeetCode hard. Focus on:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Arrays and Strings (two-pointer, sliding window)</li>
        <li>LinkedList operations</li>
        <li>Stack and Queue applications</li>
        <li>Basic sorting algorithms (know the complexities!)</li>
        <li>Binary search variations</li>
        <li>Basic recursion</li>
      </ul>

      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 my-6">
        <p class="text-green-400 font-semibold mb-2">Practice Strategy:</p>
        <p class="text-gray-300">
          Solve 2-3 problems daily. Quality over quantity. Understand the pattern, don't memorize solutions.
          Focus on HackerRank and GeeksforGeeks - these platforms are commonly used in assessments.
        </p>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Phase 3: Mock Interviews (Weeks 9-10)</h2>
      <p class="text-gray-300 mb-4">
        This is where most candidates fail. You might know the answers but struggle to articulate them under pressure.
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Practice explaining concepts out loud</li>
        <li>Do mock interviews with peers</li>
        <li>Record yourself and review</li>
        <li>Time your responses (keep answers under 2 minutes)</li>
      </ul>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Common Interview Questions</h2>
      <p class="text-gray-300 mb-4">
        Questions I've seen repeatedly across HCL, Cognizant, and TCS interviews:
      </p>
      <ol class="list-decimal list-inside text-gray-300 mb-4 space-y-2">
        <li>"Explain the difference between abstract class and interface"</li>
        <li>"What is the internal working of HashMap?"</li>
        <li>"Write a SQL query to find the second highest salary"</li>
        <li>"Explain method overloading vs overriding"</li>
        <li>"What are SOLID principles?"</li>
        <li>"Reverse a string without using built-in functions"</li>
        <li>"What is normalization? Explain 1NF, 2NF, 3NF"</li>
        <li>"Explain your final year project"</li>
      </ol>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">HR Round Tips</h2>
      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <ul class="list-disc list-inside text-gray-300 space-y-2">
          <li>Research the company (recent news, projects, values)</li>
          <li>Prepare "Tell me about yourself" (keep it under 90 seconds)</li>
          <li>Have 2-3 questions ready to ask them</li>
          <li>Be honest about gaps or weaknesses - but show growth mindset</li>
          <li>Show enthusiasm for learning, not just the salary</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Success Stories</h2>
      <p class="text-gray-300 mb-4">
        Using this exact approach, my students have achieved:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>15+ placements at HCL Technologies</li>
        <li>12+ placements at Cognizant</li>
        <li>Multiple offers at TCS, Wipro, and Infosys</li>
      </ul>
      <p class="text-gray-300 mb-4">
        The key isn't knowing everything—it's knowing the right things deeply and being able to communicate them clearly.
      </p>
      <p class="text-gray-300 mb-4">
        Want structured interview preparation? My bootcamp includes dedicated mock interview sessions and placement support.
      </p>
    `,
    author: 'Dwarika Kumar',
    publishedAt: '2024-12-20',
    readTime: '7 min read',
    coverImage: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800',
    tags: ['Career', 'Interviews', 'Job Prep'],
  },
  {
    id: '6',
    title: 'Database Design Principles Every Developer Should Know',
    slug: 'database-design-principles',
    excerpt: 'From normalization to indexing, learn the fundamentals of designing efficient and scalable databases.',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">
        A poorly designed database can cripple an application's performance and make code maintenance a nightmare. 
        Let's explore the principles that separate good database design from bad.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Why Database Design Matters</h2>
      <p class="text-gray-300 mb-4">
        I've seen projects where a single query took 30+ seconds because of poor schema design. 
        After restructuring, the same query ran in milliseconds. Good design isn't premature optimization—it's foundation.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Normalization: The Foundation</h2>
      <p class="text-gray-300 mb-4">
        Normalization reduces data redundancy and improves data integrity. Here are the key normal forms:
      </p>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">First Normal Form (1NF)</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Each cell contains a single value (atomic)</li>
        <li>Each record is unique</li>
        <li>No repeating groups</li>
      </ul>
      <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 my-4">
        <p class="text-red-400 font-semibold mb-2">❌ Bad (violates 1NF):</p>
        <code class="text-gray-300">Student(id, name, phone_numbers: "123,456,789")</code>
      </div>
      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 my-4">
        <p class="text-green-400 font-semibold mb-2">✅ Good:</p>
        <code class="text-gray-300">Student(id, name) + StudentPhone(student_id, phone_number)</code>
      </div>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">Second Normal Form (2NF)</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Must be in 1NF</li>
        <li>No partial dependencies (non-key attributes depend on entire primary key)</li>
      </ul>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">Third Normal Form (3NF)</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Must be in 2NF</li>
        <li>No transitive dependencies (non-key attributes don't depend on other non-key attributes)</li>
      </ul>

      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <p class="text-indigo-400 font-semibold mb-2">Rule of Thumb:</p>
        <p class="text-gray-300">
          "Every non-key attribute must provide a fact about the key, the whole key, and nothing but the key."
        </p>
      </div>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">When to Denormalize</h2>
      <p class="text-gray-300 mb-4">
        Normalization isn't always the answer. Sometimes you need to denormalize for performance:
      </p>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li><strong>Read-heavy workloads:</strong> Caching computed values</li>
        <li><strong>Reporting:</strong> Pre-aggregated summary tables</li>
        <li><strong>Reducing JOINs:</strong> For frequently accessed related data</li>
      </ul>
      <p class="text-gray-300 mb-4">
        The key is understanding the tradeoffs and making informed decisions.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Indexing Strategies</h2>
      <p class="text-gray-300 mb-4">
        Indexes are like a book's index—they help find data faster without scanning everything.
      </p>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">When to Create Indexes:</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Columns used in WHERE clauses frequently</li>
        <li>Columns used in JOIN conditions</li>
        <li>Columns used in ORDER BY</li>
        <li>Foreign key columns</li>
      </ul>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">When NOT to Index:</h3>
      <ul class="list-disc list-inside text-gray-300 mb-4 space-y-2">
        <li>Small tables (full scan is often faster)</li>
        <li>Columns with low cardinality (few unique values)</li>
        <li>Columns rarely used in queries</li>
        <li>Tables with heavy INSERT/UPDATE operations</li>
      </ul>

      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">-- Good: Index on frequently searched column
CREATE INDEX idx_users_email ON users(email);

-- Good: Composite index for common query pattern
CREATE INDEX idx_orders_user_date 
ON orders(user_id, created_at DESC);

-- Bad: Index on boolean with only 2 values
-- CREATE INDEX idx_users_active ON users(is_active);</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Primary Key Selection</h2>
      <p class="text-gray-300 mb-4">
        The eternal debate: Natural keys vs Surrogate keys?
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p class="text-blue-400 font-semibold mb-2">Natural Key</p>
          <p class="text-gray-400 text-sm mb-2">email, SSN, ISBN</p>
          <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
            <li>✅ Business meaning</li>
            <li>✅ Reduces JOINs</li>
            <li>❌ Can change</li>
            <li>❌ Often larger</li>
          </ul>
        </div>
        <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p class="text-purple-400 font-semibold mb-2">Surrogate Key</p>
          <p class="text-gray-400 text-sm mb-2">auto-increment ID, UUID</p>
          <ul class="list-disc list-inside text-gray-300 text-sm space-y-1">
            <li>✅ Never changes</li>
            <li>✅ Compact (usually)</li>
            <li>❌ No business meaning</li>
            <li>❌ Extra column</li>
          </ul>
        </div>
      </div>

      <p class="text-gray-300 mb-4">
        My recommendation: Use surrogate keys (auto-increment or UUID) as primary keys, but add unique constraints on natural keys.
      </p>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Relationship Design</h2>
      
      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">One-to-Many</h3>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">-- Department has many Employees
CREATE TABLE departments (id, name);
CREATE TABLE employees (
  id, 
  name, 
  department_id REFERENCES departments(id)
);</code></pre>

      <h3 class="text-xl font-semibold text-indigo-400 mt-8 mb-3">Many-to-Many</h3>
      <pre class="bg-gray-800 rounded-lg p-4 my-6 overflow-x-auto"><code class="text-gray-300">-- Students take many Courses, Courses have many Students
CREATE TABLE students (id, name);
CREATE TABLE courses (id, title);
CREATE TABLE enrollments (
  student_id REFERENCES students(id),
  course_id REFERENCES courses(id),
  enrolled_at,
  PRIMARY KEY (student_id, course_id)
);</code></pre>

      <h2 class="text-2xl font-bold text-white mt-10 mb-4">Quick Checklist</h2>
      <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 my-6">
        <ul class="list-none text-gray-300 space-y-2">
          <li>☐ Every table has a primary key</li>
          <li>☐ Foreign keys have appropriate constraints</li>
          <li>☐ Normalized to at least 3NF (unless intentionally denormalized)</li>
          <li>☐ Indexes on frequently queried columns</li>
          <li>☐ Appropriate data types (don't use VARCHAR(255) for everything!)</li>
          <li>☐ NOT NULL where applicable</li>
          <li>☐ Consider soft deletes vs hard deletes</li>
          <li>☐ Audit columns (created_at, updated_at) where needed</li>
        </ul>
      </div>

      <p class="text-gray-300 mb-4">
        Database design is a skill that improves with practice. The more schemas you design and optimize, the better you'll get at spotting issues early.
      </p>
      <p class="text-gray-300 mb-4">
        In my Java Full-Stack bootcamp, we design databases from scratch for real projects, giving you hands-on experience with these principles.
      </p>
    `,
    author: 'Dwarika Kumar',
    publishedAt: '2024-12-15',
    readTime: '9 min read',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    tags: ['Database', 'SQL', 'Backend'],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getRecentPosts(count: number = 3): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  blogPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
