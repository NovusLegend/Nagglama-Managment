import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStudentReportComment = async (
  studentName: string,
  averageScore: number,
  bestSubject: string,
  weakestSubject: string,
  trend: 'improving' | 'declining' | 'steady'
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return "Excellent performance. Keep up the good work. (Auto-generated placeholder)";
  }

  try {
    const prompt = `
      You are a senior teacher at St. Joseph's Naggalama, a prestigious secondary school.
      Write a 2-sentence formal, encouraging, but honest report card comment for a student.
      
      Student Name: ${studentName}
      Average Score: ${averageScore}%
      Best Subject: ${bestSubject}
      Weakest Subject: ${weakestSubject}
      Performance Trend: ${trend}
      
      Tone: Professional, Constructive, Ugandan Educational Context.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate AI comment at this time.";
  }
};
