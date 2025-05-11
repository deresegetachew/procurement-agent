import { Injectable, Scope } from '@nestjs/common';
import { PromptBody } from '@prompts';
import { ClientStrategy } from './clientStrategy.interface';
import { OpenAIClient } from './openai.client';
import { OllamaClient } from './ollama.client';
import { AIMessageChunk } from '@langchain/core/messages';
import { AIClientTypes } from '@common';
import { z, ZodSchema } from 'zod';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LLMClient<TInput> {
  constructor(
    private readonly openAIClient: OpenAIClient,
    private readonly ollamaClient: OllamaClient,
  ) {}

  private strategy: ClientStrategy;

  setStrategy(strategy: AIClientTypes) {
    if (strategy === 'openAI') {
      this.strategy = this.openAIClient;
    } else if (strategy === 'ollama') {
      this.strategy = this.ollamaClient;
    } else {
      throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  // public async withStructuredOutput(schema: ZodSchema): Promise<this> {
  //   const client = await this.strategy.getModel();

  //   client.withStructuredOutput(schema);

  //   return this;
  // }

  public async invokeLLM<T extends ZodSchema>(
    messages: PromptBody<TInput>,
    structuredOutPutSchema?: T,
  ): Promise<z.infer<T>> {
    if (!this.strategy) {
      throw new Error('Client strategy is not initialized');
    }

    if (structuredOutPutSchema) {
      const model = await this.strategy.getModel();
      model.withStructuredOutput(structuredOutPutSchema);
    }
    return await this.strategy.invokeLLM(messages);
  }
}
