import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import {
  HnRagflowJoinConversationDto,
  HnRagflowSendMessageDto,
  HnRagflowWsEvent,
} from './hn-ragflow-chatbot.dto';
import { HnRagflowMessage } from './hn-ragflow-chatbot.interface';
import { HnRagflowChatbotService } from './hn-ragflow-chatbot.service';

@WebSocketGateway({
  namespace: '/ragflow-chatbot',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class HnRagflowChatbotGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(HnRagflowChatbotGateway.name);
  private clientSessions: Map<string, { sessionId?: string; conversationId?: string }> = new Map();

  constructor(private readonly ragflowService: HnRagflowChatbotService) {}

  afterInit(): void {
    this.logger.log('Ragflow Chatbot WebSocket Gateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`[CONNECT] Client connected: ${client.id}`);
    this.logger.debug(`[CONNECT] Client handshake auth: ${JSON.stringify(client.handshake.auth)}`);
    this.logger.debug(`[CONNECT] Client handshake headers: ${JSON.stringify(client.handshake.headers)}`);
    this.logger.debug(`[CONNECT] Total connected clients: ${this.clientSessions.size + 1}`);
    this.clientSessions.set(client.id, {});
  }

  handleDisconnect(client: Socket): void {
    const session = this.clientSessions.get(client.id);
    this.logger.log(`[DISCONNECT] Client disconnected: ${client.id}`);
    this.logger.debug(`[DISCONNECT] Client session was: ${JSON.stringify(session)}`);
    this.clientSessions.delete(client.id);
    this.logger.debug(`[DISCONNECT] Remaining connected clients: ${this.clientSessions.size}`);
  }

  @SubscribeMessage(HnRagflowWsEvent.JOIN_CONVERSATION)
  async handleJoinConversation(
    @MessageBody() dto: HnRagflowJoinConversationDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    this.logger.debug(`[JOIN] Client ${client.id} attempting to join conversation`);
    this.logger.debug(`[JOIN] DTO: ${JSON.stringify(dto)}`);

    try {
      let sessionId: string;
      let messages: HnRagflowMessage[] = [];

      // conversationId is actually the Ragflow sessionId (they are the same for persistence)
      if (dto.conversationId) {
        this.logger.debug(`[JOIN] Client provided existing conversationId (sessionId): ${dto.conversationId}`);

        // Check if the session exists in Ragflow
        const sessionExists = await this.ragflowService.sessionExists(dto.chatId, dto.conversationId);

        if (sessionExists) {
          this.logger.debug(`[JOIN] Session exists in Ragflow, fetching history`);
          sessionId = dto.conversationId;

          // Fetch message history from Ragflow
          messages = await this.ragflowService.getSessionHistory(dto.chatId, sessionId);
          this.logger.debug(`[JOIN] Retrieved ${messages.length} messages from history`);
        } else {
          this.logger.warn(`[JOIN] Session not found in Ragflow, creating new session`);
          sessionId = await this.ragflowService.createSession(dto.chatId);
          this.logger.debug(`[JOIN] New Ragflow session created: ${sessionId}`);
        }
      } else {
        this.logger.debug(`[JOIN] No conversationId provided, creating new session for chat: ${dto.chatId}`);
        sessionId = await this.ragflowService.createSession(dto.chatId);
        this.logger.debug(`[JOIN] New Ragflow session created: ${sessionId}`);
      }

      // Use sessionId as conversationId (they are now the same for persistence)
      const conversationId = sessionId;

      this.clientSessions.set(client.id, {
        sessionId,
        conversationId,
      });

      client.join(conversationId);

      const response = {
        conversationId,
        sessionId,
        messages,
      };
      this.logger.debug(`[JOIN] Emitting conversation_joined with ${messages.length} messages`);
      client.emit(HnRagflowWsEvent.CONVERSATION_JOINED, response);

      this.logger.log(`[JOIN] Client ${client.id} joined conversation ${conversationId} with ${messages.length} historical messages`);
    } catch (error) {
      this.logger.error(`[JOIN] Error joining conversation for client ${client.id}`, error);
      client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
        error: 'Failed to join conversation',
      });
    }
  }

  @SubscribeMessage(HnRagflowWsEvent.LEAVE_CONVERSATION)
  handleLeaveConversation(@ConnectedSocket() client: Socket): void {
    this.logger.debug(`[LEAVE] Client ${client.id} requesting to leave conversation`);
    const session = this.clientSessions.get(client.id);
    if (session?.conversationId) {
      client.leave(session.conversationId);
      this.clientSessions.set(client.id, {});
      this.logger.log(`[LEAVE] Client ${client.id} left conversation ${session.conversationId}`);
    } else {
      this.logger.debug(`[LEAVE] Client ${client.id} was not in a conversation`);
    }
  }

  @SubscribeMessage(HnRagflowWsEvent.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody() dto: HnRagflowSendMessageDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    this.logger.debug(`[SEND] Client ${client.id} sending message`);
    this.logger.debug(`[SEND] DTO: ${JSON.stringify({ ...dto, message: dto.message?.substring(0, 100) })}`);

    const session = this.clientSessions.get(client.id);
    this.logger.debug(`[SEND] Client session: ${JSON.stringify(session)}`);

    if (!session?.conversationId || !session?.sessionId) {
      this.logger.warn(`[SEND] Client ${client.id} not in a conversation`);
      client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
        error: 'Not in a conversation. Please join first.',
      });
      return;
    }

    try {
      this.logger.debug(`[SEND] Emitting typing_start to room: ${session.conversationId}`);
      this.server.to(session.conversationId).emit(HnRagflowWsEvent.TYPING_START, {
        conversationId: session.conversationId,
      });

      let fullResponse = '';
      let chunkCount = 0;

      this.logger.debug(`[SEND] Starting stream for chat: ${dto.chatId}, session: ${session.sessionId}`);

      for await (const chunk of this.ragflowService.streamMessage(
        dto.chatId,
        dto.message,
        session.sessionId
      )) {
        if (chunk.type === 'chunk' && chunk.content) {
          chunkCount++;
          fullResponse += chunk.content;
          this.logger.debug(`[SEND] Emitting chunk #${chunkCount}: "${chunk.content.substring(0, 50)}"`);
          client.emit(HnRagflowWsEvent.MESSAGE_CHUNK, {
            conversationId: session.conversationId,
            content: chunk.content,
          });
        } else if (chunk.type === 'error') {
          this.logger.error(`[SEND] Stream error: ${chunk.error}`);
          client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
            conversationId: session.conversationId,
            error: chunk.error,
          });
          break;
        } else if (chunk.type === 'done') {
          this.logger.debug(`[SEND] Stream done. Total chunks: ${chunkCount}, Response length: ${fullResponse.length}, References: ${chunk.references?.length || 0}`);
          const assistantMessage = this.ragflowService.createMessage('assistant', fullResponse);
          assistantMessage.references = chunk.references;

          this.logger.debug(`[SEND] Emitting typing_end`);
          this.server.to(session.conversationId).emit(HnRagflowWsEvent.TYPING_END, {
            conversationId: session.conversationId,
          });

          this.logger.debug(`[SEND] Emitting message_complete: ${assistantMessage.id} with ${chunk.references?.length || 0} references`);
          client.emit(HnRagflowWsEvent.MESSAGE_COMPLETE, {
            conversationId: session.conversationId,
            message: assistantMessage,
            references: chunk.references || [],
          });
        }
      }

      this.logger.log(`[SEND] Message processed for client ${client.id}. Chunks: ${chunkCount}`);
    } catch (error) {
      this.logger.error(`[SEND] Error sending message for client ${client.id}`, error);

      this.server.to(session.conversationId).emit(HnRagflowWsEvent.TYPING_END, {
        conversationId: session.conversationId,
      });

      client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
        conversationId: session.conversationId,
        error: 'Failed to send message',
      });
    }
  }

  private getUserIdFromSocket(client: Socket): string {
    // TODO: Extract user ID from JWT token in handshake
    // For now, return a placeholder
    return client.handshake.auth?.userId || `anonymous-${client.id}`;
  }
}
