import Anthropic from '@anthropic-ai/sdk';
import { Model } from '../db/types.js';
import { Provider, ProviderResponse } from './provider.js';

export class AnthropicProvider implements Provider {
  client: Anthropic;
  temperature?: number;
  system?: string;
  maxTokens?: number;

  constructor(public model?: Model) {
    if (process.env['ANTHROPIC_API_KEY']) {
      this.client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
    } else {
      throw new Error('Anthropic API key required');
    }
  }

  async embed(): Promise<ProviderResponse<number[]>> {
    throw new Error('Anthropic API does not support embeddings.');
  }

  async generate(
    document: string,
    model?: Model,
  ): Promise<ProviderResponse<string>> {
    const start = Date.now();

    const result = await this.client.messages.create({
      max_tokens: this.maxTokens ?? 256,
      system: this.system,
      messages: [{ role: 'user', content: document }],
      model: model?.model ?? this.model?.model ?? 'claude-3-haiku-20240307',
      temperature: this.temperature,
    });

    return {
      success: true,
      value: result.content
        .map(c => (c.type === 'text' ? c.text : c.name))
        .join(' '),
      duration: Date.now() - start,
    };
  }
}
