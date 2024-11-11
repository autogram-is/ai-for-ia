import { Model } from '../db/types.js';

export interface Provider {
  temperature?: number;
  model?: Model;
  system?: string;

  embed(
    text: string,
    model?: Model,
    options?: Record<string, unknown>,
  ): Promise<ProviderResponse<number[]>>;

  generate(
    document: string,
    model?: Model,
    options?: Record<string, unknown>,
  ): Promise<ProviderResponse<string>>;
}

export type ProviderResponse<T> =
  | {
      success: true;
      value: T;
      duration: number;
    }
  | {
      success: false;
      error: Error;
    };
