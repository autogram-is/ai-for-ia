import 'dotenv/config';
import { Model } from '../db/types.js';
import { AnthropicProvider } from './anthropic.js';
import { GoogleProvider } from './google.js';
import { OllamaProvider } from './ollama.js';
import { OpenAIProvider } from './openai.js';

export function getProvider(model: Model) {
  switch (model.provider) {
    case 'ollama':
      return new OllamaProvider(model);
    case 'openai':
      return new OpenAIProvider(model);
    case 'google':
      return new GoogleProvider(model);
    case 'anthropic':
      return new AnthropicProvider(model);
    default:
      throw new Error('Valid model name or provider required');
  }
}
