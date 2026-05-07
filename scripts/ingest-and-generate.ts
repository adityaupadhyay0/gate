import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { prisma } from '../src/lib/db/prisma';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function main() {
  const csvPath = './questions-data-new.csv';
  if (!fs.existsSync(csvPath)) {
      console.error("CSV file not found.");
      return;
  }

  const content = fs.readFileSync(csvPath);
  const records = parse(content, { columns: true, skip_empty_lines: true });

  console.log(`Phase 1: Ingesting ${records.length} Real PYQs...`);

  for (const record of records as any[]) {
    const questionText = record.Question;
    const kaggleTopic = record.Topic;

    const topic = await prisma.topic.findFirst({
      where: {
        OR: [
          { name: { contains: kaggleTopic } },
          { subject: { name: { contains: kaggleTopic } } }
        ]
      }
    });

    if (!topic) continue;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      This is a real GATE question: "${questionText}".
      Find official options, answer, year, marks, difficulty(easy/medium/hard), and class(numerical/theoretical/mixed).
      Return JSON:
      {
        "year": number,
        "options": ["string", "string", "string", "string"],
        "answer": "string",
        "marks": number,
        "difficulty": "easy" | "medium" | "hard",
        "class": "numerical" | "theoretical" | "mixed",
        "explanation": "string"
      }
    `;

    try {
        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text().replace(/```json|```/g, ""));

        await prisma.pYQ.create({
          data: {
            topicId: topic.id,
            year: data.year || 2024,
            question: questionText,
            options: JSON.stringify(data.options),
            answer: data.answer,
            marks: data.marks || 1,
            difficulty: data.difficulty || 'medium',
            class: data.class || 'theoretical',
            metadata: {
              create: {
                oneLineExplanation: data.explanation,
                globalDifficulty: data.difficulty === 'hard' ? 0.8 : 0.4
              }
            }
          }
        });
        console.log(`Ingested: ${questionText.substring(0, 30)}...`);

        // Phase 2: Generate 10x Question Bank for this topic
        console.log(`Phase 2: Generating 5 high-quality similar questions for ${topic.name}...`);
        const genPrompt = `
          Based on the GATE topic "${topic.name}", generate 5 high-quality practice questions.
          For each, provide options, correct answer, difficulty (easy/medium/hard), and class (numerical/theoretical/mixed).
          Ensure they follow the GATE pattern.
          Return JSON array:
          [{ "question": "string", "options": ["A", "B", "C", "D"], "answer": "string", "difficulty": "string", "class": "string", "explanation": "string" }]
        `;
        const genResult = await model.generateContent(genPrompt);
        const genData = JSON.parse(genResult.response.text().replace(/```json|```/g, ""));

        for (const q of genData) {
            await prisma.questionBank.create({
                data: {
                    topicId: topic.id,
                    question: q.question,
                    options: JSON.stringify(q.options),
                    answer: q.answer,
                    difficulty: q.difficulty,
                    class: q.class,
                    explanation: q.explanation,
                    isGenerated: true
                }
            });
        }
    } catch (e) {
        console.error(`Error processing ${questionText.substring(0, 20)}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
