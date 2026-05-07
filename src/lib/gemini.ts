import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export async function runGeminiJob(prompt: string) {
  if (process.env.GEMINI_API_KEY === "mock-key") {
    // Return mock JSON if no API key
    console.log("Mocking Gemini response for prompt:", prompt.substring(0, 50) + "...");
    return "{}";
  }

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
