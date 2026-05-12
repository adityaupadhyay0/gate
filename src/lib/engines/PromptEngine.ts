export class PromptEngine {
  static generateExplanationPrompt(data: {
    question: string;
    options: any;
    answer: string;
    userAnswer: string | null;
    metadata?: any;
    summary?: any;
  }) {
    const { question, options, answer, userAnswer, metadata, summary } = data;

    return `
      As a GATE CSE Expert, explain the following PYQ in a structured, step-by-step manner.
      Ensure your explanation is grounded in the provided technical context to maintain high accuracy and relevance to the GATE syllabus.

      Question: ${question}
      Options: ${JSON.stringify(options)}
      Correct Answer: ${answer}
      User's Answer: ${userAnswer || 'Not provided'}

      TECHNICAL CONTEXT:
      ${metadata?.conceptTags ? `- Key Concepts to focus on: ${metadata.conceptTags}` : ''}
      ${metadata?.commonMistake ? `- Known student pitfall for this specific question: ${metadata.commonMistake}` : ''}
      ${summary?.coreConcepts ? `- Topic Foundations: ${summary.coreConcepts}` : ''}
      ${summary?.typicalMistakes ? `- Typical errors in this topic: ${summary.typicalMistakes}` : ''}

      Requirements:
      1. Explain the core concept involved, explicitly connecting it to the 'Key Concepts' if provided.
      2. Show the step-by-step derivation or logical reasoning.
      3. If the user was wrong, use the 'Known student pitfall' and 'Typical errors' context to diagnose why their specific answer (${userAnswer}) might have been chosen.
      4. Use concise, professional, and technical language suitable for a Rank 1 aspirant.

      Return as plain text with clear line breaks.
    `.trim();
  }
}
