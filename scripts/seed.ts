import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const syllabus = [
  {
    name: 'Digital Logic',
    slug: 'digital-logic',
    topics: [
      { name: 'Boolean Algebra', slug: 'boolean-algebra', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Combinational Circuits', slug: 'combinational-circuits', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Sequential Circuits', slug: 'sequential-circuits', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Number Representations', slug: 'number-representations', dependencyOrder: 1, difficultyTier: 'Foundational' },
    ],
  },
  {
    name: 'Computer Organization and Architecture',
    slug: 'coa',
    topics: [
      { name: 'Machine Instructions and Addressing Modes', slug: 'instructions-addressing', dependencyOrder: 1, difficultyTier: 'Core' },
      { name: 'ALU, Data-path and Control Unit', slug: 'alu-datapath', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Instruction Pipelining', slug: 'pipelining', dependencyOrder: 3, difficultyTier: 'Advanced' },
      { name: 'Memory Hierarchy', slug: 'memory-hierarchy', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'I/O Interface', slug: 'io-interface', dependencyOrder: 5, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Programming and Data Structures',
    slug: 'pds',
    topics: [
      { name: 'Programming in C', slug: 'c-programming', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Recursion', slug: 'recursion', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Arrays, Stacks, Queues', slug: 'basic-ds', dependencyOrder: 3, difficultyTier: 'Foundational' },
      { name: 'Linked Lists', slug: 'linked-lists', dependencyOrder: 4, difficultyTier: 'Foundational' },
      { name: 'Trees', slug: 'trees', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Binary Search Trees', slug: 'bst', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'Binary Heaps', slug: 'heaps', dependencyOrder: 7, difficultyTier: 'Core' },
      { name: 'Graphs', slug: 'graphs-ds', dependencyOrder: 8, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Algorithms',
    slug: 'algorithms',
    topics: [
      { name: 'Searching and Sorting', slug: 'searching-sorting', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Asymptotic Worst Case Time and Space Complexity', slug: 'complexity', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Algorithm Design Techniques: Greedy', slug: 'greedy', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Dynamic Programming', slug: 'dp', dependencyOrder: 3, difficultyTier: 'Advanced' },
      { name: 'Divide-and-Conquer', slug: 'divide-conquer', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Graph Search', slug: 'graph-search', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Minimum Spanning Trees', slug: 'mst', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Shortest Paths', slug: 'shortest-paths', dependencyOrder: 6, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Theory of Computation',
    slug: 'toc',
    topics: [
      { name: 'Regular Expressions and Finite Automata', slug: 'regular-languages', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Context-free Grammars and Push-down Automata', slug: 'cfg-pda', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Regular and Context-free Languages, Pumping Lemma', slug: 'pumping-lemma', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Turing Machines and Undecidability', slug: 'tm-undecidability', dependencyOrder: 4, difficultyTier: 'Advanced' },
    ],
  },
  {
    name: 'Compiler Design',
    slug: 'compiler-design',
    topics: [
      { name: 'Lexical Analysis', slug: 'lexical-analysis', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Parsing', slug: 'parsing', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Syntax-Directed Translation', slug: 'sdt', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Intermediate Code Generation', slug: 'icg', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'Runtime Environments', slug: 'runtime-environments', dependencyOrder: 5, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Operating System',
    slug: 'os',
    topics: [
      { name: 'Processes, Threads, Inter-process Communication', slug: 'processes-ipc', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Concurrency and Synchronization', slug: 'concurrency-sync', dependencyOrder: 2, difficultyTier: 'Core' },
      { name: 'Deadlock', slug: 'deadlock', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'CPU Scheduling', slug: 'cpu-scheduling', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Memory Management and Virtual Memory', slug: 'memory-management', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'File Systems', slug: 'file-systems', dependencyOrder: 5, difficultyTier: 'Core' },
    ],
  },
  {
    name: 'Databases',
    slug: 'databases',
    topics: [
      { name: 'ER-model', slug: 'er-model', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'Relational Model', slug: 'relational-model', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Relational Algebra', slug: 'relational-algebra', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'Tuple Calculus', slug: 'tuple-calculus', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'SQL', slug: 'sql', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Integrity Constraints, Normal Forms', slug: 'normalization', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'File Organization, Indexing', slug: 'indexing', dependencyOrder: 7, difficultyTier: 'Core' },
      { name: 'Transactions and Concurrency Control', slug: 'transactions', dependencyOrder: 8, difficultyTier: 'Advanced' },
    ],
  },
  {
    name: 'Computer Networks',
    slug: 'computer-networks',
    topics: [
      { name: 'Concept of Layering', slug: 'layering', dependencyOrder: 1, difficultyTier: 'Foundational' },
      { name: 'LAN Technologies (Ethernet)', slug: 'lan-ethernet', dependencyOrder: 2, difficultyTier: 'Foundational' },
      { name: 'Flow and Error Control Techniques, Switching', slug: 'flow-error-control', dependencyOrder: 3, difficultyTier: 'Core' },
      { name: 'IPv4/IPv6, Routers and Routing Algorithms', slug: 'ip-routing', dependencyOrder: 4, difficultyTier: 'Core' },
      { name: 'TCP/UDP and Sockets, Congestion Control', slug: 'tcp-udp', dependencyOrder: 5, difficultyTier: 'Core' },
      { name: 'Application Layer Protocols', slug: 'app-layer', dependencyOrder: 6, difficultyTier: 'Core' },
      { name: 'Network Security', slug: 'network-security', dependencyOrder: 7, difficultyTier: 'Advanced' },
    ],
  },
];

async function main() {
  console.log('Seeding syllabus...');
  for (const s of syllabus) {
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name,
        slug: s.slug,
      },
    });

    for (const t of s.topics) {
      await prisma.topic.upsert({
        where: { slug: t.slug },
        update: {},
        create: {
          name: t.name,
          slug: t.slug,
          subjectId: subject.id,
          dependencyOrder: t.dependencyOrder,
          difficultyTier: t.difficultyTier,
        },
      });
    }
  }

  console.log('Seeding sample PYQs...');
  const topics = await prisma.topic.findMany();
  for (const topic of topics) {
    const numPyqs = Math.floor(Math.random() * 10) + 5; // 5-15 PYQs per topic
    for (let i = 1; i <= numPyqs; i++) {
      await prisma.pYQ.create({
        data: {
          topicId: topic.id,
          year: 2015 + Math.floor(Math.random() * 10),
          question: `Sample question ${i} for ${topic.name}. What is the correct answer?`,
          options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
          answer: 'Option A',
          type: 'MCQ',
          marks: Math.random() > 0.5 ? 2 : 1,
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
