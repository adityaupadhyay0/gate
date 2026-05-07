import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const syllabus = [
  {
    name: 'Algorithms',
    slug: 'algorithms',
    topics: [
      { name: 'Searching and Sorting', slug: 'searching-sorting', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Asymptotic Analysis', slug: 'asymptotic-analysis', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Divide and Conquer', slug: 'divide-conquer', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Greedy Algorithms', slug: 'greedy', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Dynamic Programming', slug: 'dp', dependencyOrder: 4, difficultyTier: 'Advanced' },
      { name: 'Graph Search (BFS, DFS)', slug: 'graph-search', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Minimum Spanning Trees', slug: 'mst', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'Shortest Paths', slug: 'shortest-paths', dependencyOrder: 7, difficultyTier: 'Advanced' },
      { name: 'Hashing', slug: 'hashing-algo', dependencyOrder: 2, difficultyTier: 'Foundational' },
    ],
  },
  {
    name: 'Data Structures',
    slug: 'data-structures',
    topics: [
      { name: 'Arrays', slug: 'arrays', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Stacks', slug: 'stacks', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Queues', slug: 'queues', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Linked Lists', slug: 'linked-lists', dependencyOrder: 3, difficultyTier: 'Foundational' },
      { name: 'Binary Trees', slug: 'binary-trees', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Binary Search Trees', slug: 'bst', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'AVL Trees', slug: 'avl-trees', dependencyOrder: 6, difficultyTier: 'Advanced' },
      { name: 'Heaps', slug: 'heaps', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Graphs Representation', slug: 'graph-rep', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'B and B+ Trees', slug: 'b-trees', dependencyOrder: 7, difficultyTier: 'Advanced' },
      { name: 'Hashing Techniques', slug: 'hashing-ds', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Priority Queues', slug: 'priority-queues', dependencyOrder: 5, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Programming in C',
    slug: 'c-programming',
    topics: [
      { name: 'Data Types and Variables', slug: 'c-vars', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Control Flow', slug: 'c-control', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Functions and Scope', slug: 'c-functions', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Pointers', slug: 'c-pointers', dependencyOrder: 4, difficultyTier: 'Advanced' },
      { name: 'Structures and Unions', slug: 'c-structs', dependencyOrder: 5, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Compiler Design',
    slug: 'compiler-design',
    topics: [
      { name: 'Lexical Analysis', slug: 'lexical-analysis', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Parsing (Top-Down)', slug: 'parsing-top-down', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Parsing (Bottom-Up)', slug: 'parsing-bottom-up', dependencyOrder: 3, difficultyTier: 'Advanced' },
      { name: 'Syntax Directed Translation', slug: 'sdt', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Intermediate Code Generation', slug: 'icg', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Code Optimization', slug: 'code-opt', dependencyOrder: 6, difficultyTier: 'Advanced' },
    ],
  },
  {
    name: 'Theory of Computation',
    slug: 'toc',
    topics: [
      { name: 'Finite Automata (DFA, NFA)', slug: 'finite-automata', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Regular Expressions', slug: 'regular-expressions', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Regular Grammars', slug: 'regular-grammars', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Context Free Languages', slug: 'cfl', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Pushdown Automata', slug: 'pda', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Context Free Grammars', slug: 'cfg', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Turing Machines', slug: 'turing-machines', dependencyOrder: 6, difficultyTier: 'Advanced' },
      { name: 'Undecidability', slug: 'undecidability', dependencyOrder: 7, difficultyTier: 'Advanced' },
      { name: 'Chomsky Hierarchy', slug: 'chomsky-hierarchy', dependencyOrder: 8, difficultyTier: 'Core' },
      { name: 'P and NP Complexity', slug: 'p-np', dependencyOrder: 9, difficultyTier: 'Advanced' },
    ],
  },
  {
    name: 'Operating System',
    slug: 'os',
    topics: [
      { name: 'Processes and Threads', slug: 'processes-threads', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'CPU Scheduling', slug: 'cpu-scheduling', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Deadlocks', slug: 'deadlocks', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Memory Management (Paging)', slug: 'memory-paging', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Virtual Memory (Segmentation)', slug: 'virtual-memory', dependencyOrder: 5, difficultyTier: 'Advanced' },
      { name: 'File Systems', slug: 'file-systems', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'Disk Scheduling', slug: 'disk-scheduling', dependencyOrder: 7, difficultyTier: 'Core' },
      { name: 'Inter-process Communication', slug: 'ipc', dependencyOrder: 2, difficultyTier: 'Advanced' },
      { name: 'System Calls', slug: 'system-calls', dependencyOrder: 1, difficultyTier: 'Foundational' },
    ],
  },
  {
    name: 'Computer Networks',
    slug: 'networks',
    topics: [
      { name: 'OSI and TCP/IP Models', slug: 'osi-tcp-models', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Data Link Layer (Framing, Error)', slug: 'data-link-layer', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Flow and Error Control', slug: 'flow-error-control', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'IP Addressing and Routing', slug: 'ip-routing', dependencyOrder: 4, difficultyTier: 'Advanced' },
      { name: 'TCP and UDP (Transport Layer)', slug: 'transport-layer', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Application Layer (HTTP, DNS)', slug: 'app-layer', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'Network Security', slug: 'network-security', dependencyOrder: 7, difficultyTier: 'Advanced' },
    ],
  },
  {
    name: 'Computer Organization and Architecture',
    slug: 'coa',
    topics: [
      { name: 'Machine Instructions', slug: 'machine-instructions', dependencyOrder: 1, difficultyTier: 'Core' },
      { name: 'Addressing Modes', slug: 'addressing-modes', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'ALU and Data Path', slug: 'alu-datapath', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Control Unit Design', slug: 'control-unit', dependencyOrder: 4, difficultyTier: 'Advanced' },
      { name: 'Instruction Pipelining', slug: 'instruction-pipelining', dependencyOrder: 5, difficultyTier: 'Advanced' },
      { name: 'Cache Memory', slug: 'cache-memory', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'Secondary Storage', slug: 'secondary-storage', dependencyOrder: 7, difficultyTier: 'Core' },
      { name: 'I/O Interface', slug: 'io-interface', dependencyOrder: 8, difficultyTier: 'Core' },
      { name: 'Number Systems', slug: 'number-systems', dependencyOrder: 1, difficultyTier: 'Foundational' },
    ],
  },
  {
    name: 'Database Management Systems',
    slug: 'dbms',
    topics: [
      { name: 'ER-Model', slug: 'er-model', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Relational Model', slug: 'relational-model', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Relational Algebra', slug: 'relational-algebra', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'SQL Queries', slug: 'sql', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Functional Dependencies', slug: 'functional-dependencies', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Normalization', slug: 'normalization', dependencyOrder: 6, difficultyTier: 'Advanced' },
      { name: 'Transactions and Concurrency', slug: 'transactions', dependencyOrder: 7, difficultyTier: 'Advanced' },
      { name: 'Indexing (B+ Trees)', slug: 'db-indexing', dependencyOrder: 8, difficultyTier: 'Core' },
      { name: 'File Organization', slug: 'file-org', dependencyOrder: 9, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Discrete Mathematics',
    slug: 'discrete-math',
    topics: [
      { name: 'Propositional Logic', slug: 'propositional-logic', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'First-Order Logic', slug: 'fol', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Set Theory', slug: 'set-theory', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Relations and Functions', slug: 'relations-functions', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Partial Orders and Lattices', slug: 'lattices', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Groups and Rings', slug: 'groups-rings', dependencyOrder: 4, difficultyTier: 'Advanced' },
      { name: 'Combinatorics', slug: 'combinatorics', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Recurrence Relations', slug: 'recurrence', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'Generating Functions', slug: 'generating-functions', dependencyOrder: 7, difficultyTier: 'Advanced' },
      { name: 'Graph Theory (Basics)', slug: 'graph-theory-basics', dependencyOrder: 8, difficultyTier: 'Core' },
      { name: 'Graph Connectivity and Coloring', slug: 'graph-coloring', dependencyOrder: 9, difficultyTier: 'Advanced' },
    ],
  },
  {
    name: 'Digital Logic',
    slug: 'digital-logic',
    topics: [
      { name: 'Boolean Algebra Minimization', slug: 'boolean-min', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Combinational Circuits', slug: 'comb-circuits', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Sequential Circuits', slug: 'seq-circuits', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Computer Arithmetic', slug: 'comp-arithmetic', dependencyOrder: 4, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Engineering Mathematics',
    slug: 'eng-math',
    topics: [
      { name: 'Linear Algebra (Matrices)', slug: 'linear-algebra', dependencyOrder: 1, difficultyTier: 'Core' },
      { name: 'Calculus (Limits, Continuity)', slug: 'calculus', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Probability (Basics)', slug: 'prob-basics', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Random Variables', slug: 'random-vars', dependencyOrder: 4, difficultyTier: 'Advanced' },
    ],
  },
];

async function main() {
  console.log('Cleaning DB (Safe Way)...');
  const tableNames = [
    'MistakeClassificationRule',
    'MistakeLog',
    'Attempt',
    'UserProgress',
    'TopicResource',
    'TopicSummary',
    'TopicDependency',
    'PYQMetadata',
    'PYQ',
    'Topic',
    'Subject',
    'VerificationToken',
    'Session',
    'Account',
    'User'
  ];

  for (const name of tableNames) {
    try {
      // @ts-ignore
      await prisma[name.charAt(0).toLowerCase() + name.slice(1)].deleteMany();
    } catch (e) {
      console.log(`Table ${name} might not exist or already empty.`);
    }
  }

  console.log('Seeding syllabus...');
  const topicMap: Record<string, string> = {};

  for (const s of syllabus) {
    const subject = await prisma.subject.create({
      data: {
        name: s.name,
        slug: s.slug,
      },
    });

    for (const t of s.topics) {
      const topic = await prisma.topic.create({
        data: {
          name: t.name,
          slug: t.slug,
          subjectId: subject.id,
          dependencyOrder: t.dependencyOrder,
          difficultyTier: t.difficultyTier,
        },
      });
      topicMap[t.slug] = topic.id;
    }
  }

  console.log('Loading Curated Real PYQs...');
  const curatedData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts/seed-data.json'), 'utf-8'));

  for (const topicData of curatedData) {
    const topicId = topicMap[topicData.topicSlug];
    if (topicId) {
      for (const pyqData of topicData.questions) {
        const pyq = await prisma.pYQ.create({
          data: {
            topicId,
            year: pyqData.year,
            question: pyqData.question,
            options: JSON.stringify(pyqData.options),
            answer: pyqData.answer,
            type: 'MCQ',
            marks: pyqData.marks,
          }
        });

        await prisma.pYQMetadata.create({
          data: {
            pyqId: pyq.id,
            globalDifficulty: pyqData.marks === 2 ? 0.7 : 0.4,
            oneLineExplanation: pyqData.explanation,
          }
        });
      }
    }
  }

  const allTopics = await prisma.topic.findMany();
  console.log('Seeding Topic Summaries (Sample)...');
  for (const topic of allTopics) {
    await prisma.topicSummary.create({
      data: {
        topicId: topic.id,
        coreConcepts: JSON.stringify(['Concept A', 'Concept B']),
        keyFormulas: JSON.stringify(['Formula 1: X = Y + Z']),
        commonExamPatterns: JSON.stringify(['Pattern 1', 'Pattern 2'])
      }
    });
  }

  console.log('Seed completed.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
