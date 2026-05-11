import { describe, it, expect } from 'vitest';
import { PromptEngine } from '../PromptEngine';

describe('PromptEngine', () => {
  const baseData = {
    question: 'What is 2+2?',
    options: ['3', '4', '5'],
    answer: '4',
    userAnswer: '3',
  };

  it('generates a basic prompt without metadata', () => {
    const prompt = PromptEngine.generateExplanationPrompt(baseData);
    expect(prompt).toContain('What is 2+2?');
    expect(prompt).toContain('User\'s Answer: 3');
    // We check that the context values themselves are not there
    // The requirement labels in the numbered list will contain these strings,
    // so we check for the header labels in the TECHNICAL CONTEXT section
    expect(prompt).not.toContain('- Key Concepts to focus on:');
    expect(prompt).not.toContain('- Known student pitfall for this specific question:');
  });

  it('includes metadata in the prompt when provided', () => {
    const metadata = {
      conceptTags: 'Arithmetic, Addition',
      commonMistake: 'Off-by-one error'
    };
    const prompt = PromptEngine.generateExplanationPrompt({ ...baseData, metadata });
    expect(prompt).toContain('Key Concepts to focus on: Arithmetic, Addition');
    expect(prompt).toContain('Known student pitfall for this specific question: Off-by-one error');
  });

  it('includes topic summary in the prompt when provided', () => {
    const summary = {
      coreConcepts: 'Basic Math Principles',
      typicalMistakes: 'Calculation errors'
    };
    const prompt = PromptEngine.generateExplanationPrompt({ ...baseData, summary });
    expect(prompt).toContain('Topic Foundations: Basic Math Principles');
    expect(prompt).toContain('Typical errors in this topic: Calculation errors');
  });

  it('handles null userAnswer gracefully', () => {
    const prompt = PromptEngine.generateExplanationPrompt({ ...baseData, userAnswer: null });
    expect(prompt).toContain('User\'s Answer: Not provided');
  });
});
