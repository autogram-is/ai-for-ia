import OpenAI from 'openai';
import { Model } from '../db/types.js';
import { Provider, ProviderResponse } from './provider.js';

export class OpenAIProvider implements Provider {
  client: OpenAI;
  temperature?: number;
  system?: string;
  maxTokens?: number;

  constructor(public model?: Model) {
    if (process.env['OPENAI_API_KEY']) {
      this.client = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
    } else {
      throw new Error('No API key given');
    }
  }

  async embed(
    text: string,
    model?: Model,
  ): Promise<ProviderResponse<number[]>> {
    const start = Date.now();

    const result = await this.client.embeddings.create({
      input: text,
      model: model?.model ?? this.model?.model ?? 'text-embedding-3-mini',
      encoding_format: 'float',
    });

    return {
      success: true,
      value: result.data[0].embedding,
      duration: Date.now() - start,
    };
  }

  async generate(
    document: string,
    model?: Model,
  ): Promise<ProviderResponse<string>> {
    const start = Date.now();

    const result = await this.client.chat.completions.create({
      max_completion_tokens: this.maxTokens ?? 256,
      messages: [
        { role: 'system', content: this.system ?? '' },
        { role: 'user', content: document },
      ],
      model: model?.model ?? this.model?.model ?? 'gpt-4-turbo',
      temperature: this.temperature,
      stream: false,
    });

    return {
      success: true,
      value:
        result.choices[0].message.content ||
        result.choices[0].message.refusal ||
        '',
      duration: Date.now() - start,
    };
  }
}
