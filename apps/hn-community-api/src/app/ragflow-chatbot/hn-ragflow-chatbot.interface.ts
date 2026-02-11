export interface HnRagflowMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  references?: HnRagflowReference[];
}

export interface HnRagflowConversation {
  id: string;
  chatId: string;
  userId: string;
  messages: HnRagflowMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HnRagflowAgentConfig {
  chatId: string;
  apiKey: string;
  baseUrl: string;
}

export interface HnRagflowStreamChunk {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  messageId?: string;
  error?: string;
  references?: HnRagflowReference[];
}

export interface HnRagflowApiResponse {
  code: number;
  data: {
    answer: string;
    reference?: HnRagflowReference[];
    session_id?: string;
  };
}

export interface HnRagflowReference {
  id: number;
  content: string;
  documentName: string;
  chunkId: string;
  score: number;
}
