import { Ollama } from 'ollama';
import { Model } from '../db/types.js';
import { Provider, ProviderResponse } from './provider.js';

export class OllamaProvider implements Provider {
  client: Ollama;
  temperature?: number;
  system?: string;
  maxTokens?: number;

  constructor(public model?: Model) {
    if (process.env['OLLAMA_HOST']) {
      this.client = new Ollama({ host: process.env['OLLAMA_HOST'] });
    } else {
      this.client = new Ollama();
    }
  }

  async embed(
    text: string,
    model?: Model,
  ): Promise<ProviderResponse<number[]>> {
    const start = Date.now();
    const m = model ?? this.model;
    return await this.client
      .embed({
        model: m
          ? [m.model, m.variant].filter(s => !!s).join(':')
          : 'snowflake-arctic-embed:xs',
        input: `${m?.prefix ? m.prefix + ' ' : ''}${text}`,
        truncate: true,
        options: { embedding_only: true }
      })
      .then(response => ({
        success: true as const,
        value: response.embeddings[0],
        duration: Date.now() - start,
      }))
      .catch((err: unknown) => ({
        success: false as const,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }));
  }

  async generate(
    document: string,
    model?: Model,
  ): Promise<ProviderResponse<string>> {
    const start = Date.now();
    const m = model ?? this.model;
    return await this.client
      .generate({
        model: m
          ? [m.model, m.variant].filter(s => !!s).join(':')
          : 'llama32-small',
        system: this.system,
        prompt: `${m?.prefix ? m.prefix + ' ' : ''}${document}`,
        stream: false,
        options: { temperature: this.temperature, num_predict: this.maxTokens },
      })
      .then(result => ({
        success: true as const,
        value: result.response,
        duration: Date.now() - start,
      }))
      .catch((err: unknown) => ({
        success: false as const,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }));
  }
}
