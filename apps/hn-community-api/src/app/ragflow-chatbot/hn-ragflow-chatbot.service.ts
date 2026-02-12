import { BlExternalApiService } from '@monorepo/back-core-lib';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import {
  HnRagflowApiResponse,
  HnRagflowMessage,
  HnRagflowReference,
  HnRagflowStreamChunk,
} from './hn-ragflow-chatbot.interface';

@Injectable()
export class HnRagflowChatbotService {
  private readonly logger = new Logger(HnRagflowChatbotService.name);

  constructor(
    private readonly coreConfigService: HnCoreConfigService,
    private readonly externalApiService: BlExternalApiService,
    private readonly httpService: HttpService
  ) {}

  async createSession(chatId: string): Promise<string> {
    const baseUrl = this.getRagflowBaseUrl();
    const url = `${baseUrl}/api/v1/chats/${chatId}/sessions`;

    try {
      const response = await this.httpService.axiosRef.post(url, {}, { headers: this.getRagflowHeaders() });
      return response.data?.data?.id;
    } catch (error: any) {
      this.logger.error(
        `[createSession] Failed to create session for chat ${chatId}`,
        error?.response?.data || error
      );
      throw error;
    }
  }

  /**
   * Get session history from Ragflow API
   * Returns the messages from a previous session if it exists
   */
  async getSessionHistory(chatId: string, sessionId: string): Promise<HnRagflowMessage[]> {
    const baseUrl = this.getRagflowBaseUrl();
    const url = `${baseUrl}/api/v1/chats/${chatId}/sessions?id=${sessionId}`;

    try {
      const response = await this.httpService.axiosRef.get(url, { headers: this.getRagflowHeaders() });

      const sessions = response.data?.data;
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        return [];
      }

      const session = sessions.find((s: any) => s.id === sessionId);
      if (!session) {
        return [];
      }

      // Parse messages from session
      const messages: HnRagflowMessage[] = [];
      if (session.messages && Array.isArray(session.messages)) {
        for (const msg of session.messages) {
          // Ragflow stores messages as {role, content} pairs
          if (msg.role && msg.content) {
            // Clean content from [ID:x] markers for assistant messages
            let content = msg.content;
            if (msg.role === 'assistant') {
              content = content.replace(/\[ID:\d+\]/g, '');
            }

            messages.push({
              id: msg.id || this.generateId(),
              role: msg.role,
              content,
              timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
              references: this.parseReferences(msg.reference),
            });
          }
        }
      }

      return messages;
    } catch (error: any) {
      this.logger.error(
        `[getSessionHistory] Failed to fetch session history`,
        error?.response?.data || error
      );
      return [];
    }
  }

  /**
   * Check if a session exists in Ragflow
   */
  async sessionExists(chatId: string, sessionId: string): Promise<boolean> {
    const baseUrl = this.getRagflowBaseUrl();
    const url = `${baseUrl}/api/v1/chats/${chatId}/sessions?id=${sessionId}`;

    try {
      const response = await this.httpService.axiosRef.get(url, { headers: this.getRagflowHeaders() });
      const sessions = response.data?.data;

      if (!sessions || !Array.isArray(sessions)) {
        return false;
      }

      return sessions.some((s: any) => s.id === sessionId);
    } catch (error: any) {
      this.logger.error(`[sessionExists] Error checking session`, error?.response?.data || error);
      return false;
    }
  }

  /**
   * Parse references from Ragflow response
   */
  private parseReferences(reference: any): HnRagflowReference[] | undefined {
    if (!reference?.chunks || !Array.isArray(reference.chunks)) {
      return undefined;
    }

    return reference.chunks.map((ref: any, index: number) => ({
      id: index,
      content: ref.content || ref.content_with_weight || '',
      documentName: ref.document_name || ref.doc_name || '',
      chunkId: ref.chunk_id || ref.id || '',
      score: ref.score || ref.similarity || 0,
    }));
  }

  async sendMessage(
    chatId: string,
    message: string,
    sessionId?: string,
    onChunk?: (chunk: HnRagflowStreamChunk) => void
  ): Promise<HnRagflowMessage> {
    const baseUrl = this.getRagflowBaseUrl();
    const url = `${baseUrl}/api/v1/chats/${chatId}/completions`;

    try {
      const payload = {
        question: message,
        session_id: sessionId,
        stream: !!onChunk,
      };

      const response = await this.httpService.axiosRef.post<HnRagflowApiResponse>(url, payload, {
        headers: this.getRagflowHeaders(),
        responseType: onChunk ? 'stream' : 'json',
      });

      if (onChunk) {
        return await this.handleStreamResponse(response.data as any, onChunk);
      }

      const apiResponse = response.data;
      const assistantMessage = this.createMessage('assistant', apiResponse.data.answer);
      assistantMessage.references = this.parseReferences(apiResponse.data.reference);
      return assistantMessage;
    } catch (error: any) {
      this.logger.error(`[sendMessage] Error sending message to Ragflow`, error?.response?.data || error);
      throw this.handleRagflowError(error);
    }
  }

  async *streamMessage(
    chatId: string,
    message: string,
    sessionId?: string
  ): AsyncGenerator<HnRagflowStreamChunk> {
    const baseUrl = this.getRagflowBaseUrl();
    const url = `${baseUrl}/api/v1/chats/${chatId}/completions`;

    try {
      const payload = {
        question: message,
        session_id: sessionId,
        stream: true,
      };

      const response = await this.httpService.axiosRef.post(url, payload, {
        headers: this.getRagflowHeaders(),
        responseType: 'stream',
      });

      const stream = response.data;
      let buffer = '';
      let previousAnswer = '';
      let lastReferences: HnRagflowReference[] = [];

      for await (const chunk of stream) {
        const chunkStr = chunk.toString();
        buffer += chunkStr;

        // Ragflow format: data:{...} (no space after data:)
        // Split by 'data:' to handle multiple events in one chunk
        const parts = buffer.split('data:');

        // Keep the last incomplete part in buffer
        buffer = '';

        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();

          if (!part) continue;

          // Check if this part looks complete (ends with })
          if (!part.endsWith('}')) {
            // Incomplete JSON, put back in buffer
            buffer = 'data:' + part;
            continue;
          }

          // Check for end signal
          if (part === '{"code": 0, "data": true}') {
            yield { type: 'done', references: lastReferences };
            return;
          }

          try {
            const parsed = JSON.parse(part);

            if (parsed.code === 0 && parsed.data?.answer) {
              const fullAnswer = parsed.data.answer;
              // Ragflow sends cumulative answer, calculate delta
              let delta = fullAnswer.substring(previousAnswer.length);

              // Remove RAG reference markers like [ID:0], [ID:1], etc.
              delta = delta.replace(/\[ID:\d+\]/g, '');

              // Extract references from the response
              if (parsed.data.reference?.chunks && Array.isArray(parsed.data.reference.chunks)) {
                lastReferences = parsed.data.reference.chunks.map((ref: any, index: number) => ({
                  id: index,
                  content: ref.content || ref.content_with_weight || '',
                  documentName: ref.document_name || ref.doc_name || '',
                  chunkId: ref.chunk_id || ref.id || '',
                  score: ref.score || ref.similarity || 0,
                }));
              }

              if (delta) {
                previousAnswer = fullAnswer;
                yield {
                  type: 'chunk',
                  content: delta,
                };
              }
            }
          } catch {
            // Put back in buffer if parse failed (might be incomplete)
            buffer = 'data:' + part;
          }
        }
      }

      yield { type: 'done', references: lastReferences };
    } catch (error: any) {
      this.logger.error(
        `[streamMessage] Error streaming message from Ragflow`,
        error?.response?.data || error
      );
      yield {
        type: 'error',
        error: this.handleRagflowError(error).message,
      };
    }
  }

  createMessage(role: 'user' | 'assistant' | 'system', content: string): HnRagflowMessage {
    return {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date(),
    };
  }

  private async handleStreamResponse(
    stream: NodeJS.ReadableStream,
    onChunk: (chunk: HnRagflowStreamChunk) => void
  ): Promise<HnRagflowMessage> {
    let fullContent = '';
    let buffer = '';

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onChunk({ type: 'done' });
              resolve(this.createMessage('assistant', fullContent));
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.data?.answer || parsed.content || '';
              fullContent += content;
              onChunk({ type: 'chunk', content });
            } catch {
              // Skip malformed JSON
            }
          }
        }
      });

      stream.on('end', () => {
        onChunk({ type: 'done' });
        resolve(this.createMessage('assistant', fullContent));
      });

      stream.on('error', (error) => {
        onChunk({ type: 'error', error: error.message });
        reject(error);
      });
    });
  }

  private getRagflowBaseUrl(): string {
    return this.coreConfigService.getRagflowBaseUrl();
  }

  private getRagflowHeaders(): Record<string, string> {
    const apiKey = this.coreConfigService.getRagflowApiKey();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
  }

  private handleRagflowError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      return new Error(`Ragflow API error: ${message}`);
    }
    return error instanceof Error ? error : new Error('Unknown error');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
