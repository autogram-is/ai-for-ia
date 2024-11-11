import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { Model } from '../db/types.js';
import { Provider, ProviderResponse } from './provider.js';

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];


export class GoogleProvider implements Provider {
  client: GoogleGenerativeAI;
  temperature?: number;
  system?: string;
  maxTokens?: number;

  constructor(public model?: Model) {
    if (process.env.GOOGLE_API_KEY) {
      this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    } else {
      throw new Error('Google API key required');
    }
  }

  // May want to default this to text-embedding-004
  async embed(
    text: string,
    model?: Model,
  ): Promise<ProviderResponse<number[]>> {
    const m = this.client.getGenerativeModel({
      model: model?.model ?? this.model?.model ?? 'text-embedding-004',
    });

    const start = Date.now();
    const result = await m.embedContent(text);

    return {
      success: true,
      value: result.embedding.values,
      duration: Date.now() - start,
    };
  }

  async generate(
    document: string,
    model?: Model,
  ): Promise<ProviderResponse<string>> {
    const m = this.client.getGenerativeModel({
      model: model?.model ?? this.model?.model ?? 'gemini-1.5-flash',
      safetySettings,
    });

    const start = Date.now();
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: document }] }],
      generationConfig: { temperature: this.temperature },
      systemInstruction: this.system,
      safetySettings,
    });

    return {
      success: true,
      value: result.response.text(),
      duration: Date.now() - start,
    };
  }
}
