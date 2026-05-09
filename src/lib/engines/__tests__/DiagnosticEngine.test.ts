import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagnosticEngine } from '../DiagnosticEngine';
import prisma from '../../db/prisma';

vi.mock('../../db/prisma', () => ({
  default: {
    subject: {
      findMany: vi.fn(),
    },
    pYQ: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

describe('DiagnosticEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTestQuestions', () => {
    it('should fetch questions proportionally from core subjects', async () => {
      const mockSubjects = [
        {
          slug: 'algorithms',
          name: 'Algorithms',
          topics: [
            { pyqs: [{ id: 'q1', question: 'Algo Q1' }, { id: 'q2', question: 'Algo Q2' }] }
          ]
        },
        {
          slug: 'os',
          name: 'Operating System',
          topics: [
            { pyqs: [{ id: 'q3', question: 'OS Q1' }] }
          ]
        }
      ];

      (prisma.subject.findMany as any).mockResolvedValue(mockSubjects);
      (prisma.pYQ.findMany as any).mockResolvedValue([]);

      const questions = await DiagnosticEngine.getTestQuestions();

      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.id === 'q1' || q.id === 'q2')).toBe(true);
      expect(questions.some(q => q.id === 'q3')).toBe(true);
    });
  });

  describe('processResults', () => {
    it('should calculate subject-wise normalized scores', async () => {
      const mockAnswers = [
        { pyqId: 'q1', isCorrect: true },
        { pyqId: 'q2', isCorrect: false },
        { pyqId: 'q3', isCorrect: true }
      ];

      (prisma.pYQ.findUnique as any).mockImplementation(({ where }: any) => {
        if (where.id === 'q1' || where.id === 'q2') {
          return Promise.resolve({
            id: where.id,
            topic: { name: 'Sorting', subject: { name: 'Algorithms' } }
          });
        }
        if (where.id === 'q3') {
          return Promise.resolve({
            id: 'q3',
            topic: { name: 'Paging', subject: { name: 'Operating System' } }
          });
        }
        return Promise.resolve(null);
      });

      const userId = 'user-1';
      const result = await DiagnosticEngine.processResults(userId, mockAnswers);

      expect(result.strengthMap['Algorithms']).toBe(50);
      expect(result.strengthMap['Operating System']).toBe(100);
      expect(result.weakAreas).toContain('Sorting');
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: userId },
        data: expect.objectContaining({
          onboardingComplete: true
        })
      }));
    });
  });
});
