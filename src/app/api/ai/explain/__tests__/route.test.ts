import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

const generateContentSpy = vi.fn().mockResolvedValue({
  response: {
    text: () => "Mock explanation",
  },
});

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
        getGenerativeModel() {
            return {
                generateContent: generateContentSpy
            }
        }
    }
  };
});

vi.mock("@/lib/db/prisma", () => ({
  pYQ: {
    findUnique: vi.fn(),
  },
  default: {
    pYQ: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn(),
}));

describe('AI Explain Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthorized', async () => {
    (auth as any).mockResolvedValue(null);
    const req = new Request('http://localhost/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should generate explanation with grounding context', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
    const mockPyq = {
      id: 'q1',
      metadata: { oneLineExplanation: 'Expert hint text' },
      topic: {
        summaries: { coreConcepts: 'Concept A', keyFormulas: 'Formula X', typicalMistakes: 'Mistake Y' },
        resources: { recommendedBookChapters: 'Chapter 1' },
      },
    };
    (prisma.pYQ.findUnique as any).mockResolvedValue(mockPyq);

    const req = new Request('http://localhost/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({
        pyqId: 'q1',
        question: 'What is 2+2?',
        options: ['3', '4'],
        answer: '4',
        userAnswer: '3',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.explanation).toBe('Mock explanation');
    expect(prisma.pYQ.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'q1' },
    }));

    // Verify prompt grounding
    const lastCallPrompt = generateContentSpy.mock.calls[0][0];
    expect(lastCallPrompt).toContain('Expert Hint: Expert hint text');
    expect(lastCallPrompt).toContain('Core Concepts: Concept A');
    expect(lastCallPrompt).toContain('Typical Mistakes: Mistake Y');
  });
});
