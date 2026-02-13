import { BlCookieHelper } from '@monorepo/back-core-lib';
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
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

import { hnCorsConfig } from '../core/config/hn-cors.config';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import {
  HnRagflowJoinConversationDto,
  HnRagflowSendMessageDto,
  HnRagflowWsEvent,
} from './hn-ragflow-chatbot.dto';
import { HnRagflowMessage } from './hn-ragflow-chatbot.interface';
import { HnRagflowChatbotService } from './hn-ragflow-chatbot.service';

interface HnRagflowClientSession {
  sessionId?: string;
  conversationId?: string;
  userId?: string;
}

@WebSocketGateway({
  namespace: '/ragflow-chatbot',
  cors: {
    origin: hnCorsConfig.origin,
    credentials: hnCorsConfig.credentials,
  },
})
export class HnRagflowChatbotGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(HnRagflowChatbotGateway.name);
  private clientSessions: Map<string, HnRagflowClientSession> = new Map();

  /** Maps a Ragflow sessionId to the userId that owns it (null = anonymous session) */
  private sessionOwnership: Map<string, string | null> = new Map();

  constructor(
    private readonly ragflowService: HnRagflowChatbotService,
    private readonly userService: HnUserService,
    private readonly coreConfigService: HnCoreConfigService
  ) {}

  afterInit(): void {
    this.logger.log('Ragflow chatbot gateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
    const user = await this.authenticateClient(client);
    this.logger.log(`Client ${client.id} authenticated as: ${user?.id ?? 'anonymous'}`);
    const existingSession = this.clientSessions.get(client.id);
    this.clientSessions.set(client.id, { ...existingSession, userId: user?.id ?? null });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientSessions.delete(client.id);
  }

  @SubscribeMessage(HnRagflowWsEvent.JOIN_CONVERSATION)
  async handleJoinConversation(
    @MessageBody() dto: HnRagflowJoinConversationDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    this.logger.log(`[JOIN] Client ${client.id} requesting join, conversationId: ${dto.conversationId ?? 'none (new)'}`);
    const clientSession = this.clientSessions.get(client.id);
    const clientUserId = clientSession?.userId;
    const chatId = this.coreConfigService.getRagflowChatId();

    this.logger.log(`[JOIN] Client ${client.id} - userId: ${clientUserId ?? 'anonymous'}, chatId configured: ${!!chatId}`);

    if (!chatId) {
      this.logger.warn(`[JOIN] Ragflow chatbot not configured (no chatId)`);
      client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
        error: 'Ragflow chatbot is not configured',
      });
      return;
    }

    try {
      let sessionId: string;
      let messages: HnRagflowMessage[] = [];

      // conversationId is actually the Ragflow sessionId (they are the same for persistence)
      if (dto.conversationId) {
        // Check conversation ownership before allowing access
        if (!this.canAccessSession(dto.conversationId, clientUserId)) {
          this.logger.warn(`[JOIN] Client ${client.id} denied access to session ${dto.conversationId}`);
          client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
            error: 'Unauthorized: you do not have access to this conversation',
          });
          return;
        }

        // Check if the session exists in Ragflow
        const sessionExists = await this.ragflowService.sessionExists(chatId, dto.conversationId);

        if (sessionExists) {
          sessionId = dto.conversationId;
          messages = await this.ragflowService.getSessionHistory(chatId, sessionId);
        } else {
          sessionId = await this.ragflowService.createSession(chatId);
          this.registerSessionOwnership(sessionId, clientUserId);
        }
      } else {
        sessionId = await this.ragflowService.createSession(chatId);
        this.registerSessionOwnership(sessionId, clientUserId);
      }

      // Use sessionId as conversationId (they are now the same for persistence)
      const conversationId = sessionId;

      this.clientSessions.set(client.id, {
        ...clientSession,
        sessionId,
        conversationId,
      });

      client.join(conversationId);

      this.logger.log(`[JOIN] Client ${client.id} joined conversation ${conversationId} (sessionId: ${sessionId})`);

      client.emit(HnRagflowWsEvent.CONVERSATION_JOINED, {
        conversationId,
        sessionId,
        messages,
      });
    } catch (error) {
      this.logger.error(`[JOIN] Error joining conversation for client ${client.id}`, error);
      client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
        error: 'Failed to join conversation',
      });
    }
  }

  @SubscribeMessage(HnRagflowWsEvent.LEAVE_CONVERSATION)
  handleLeaveConversation(@ConnectedSocket() client: Socket): void {
    const session = this.clientSessions.get(client.id);
    if (session?.conversationId) {
      client.leave(session.conversationId);
      this.clientSessions.set(client.id, { userId: session.userId });
    }
  }

  @SubscribeMessage(HnRagflowWsEvent.SEND_MESSAGE)
  async handleSendMessage(
    @MessageBody() dto: HnRagflowSendMessageDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const session = this.clientSessions.get(client.id);

    this.logger.log(`[SEND] Client ${client.id} sending message - session: ${JSON.stringify(session ?? 'none')}`);

    if (!session?.conversationId || !session?.sessionId) {
      this.logger.warn(`[SEND] Client ${client.id} not in a conversation (no conversationId/sessionId)`);
      client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
        error: 'Not in a conversation. Please join first.',
      });
      return;
    }

    const chatId = this.coreConfigService.getRagflowChatId();

    if (!chatId) {
      client.emit(HnRagflowWsEvent.MESSAGE_ERROR, {
        error: 'Ragflow chatbot is not configured',
      });
      return;
    }

    try {
      this.server.to(session.conversationId).emit(HnRagflowWsEvent.TYPING_START, {
        conversationId: session.conversationId,
      });

      let fullResponse = '';

      for await (const chunk of this.ragflowService.streamMessage(
        chatId,
        dto.message,
        session.sessionId
      )) {
        if (chunk.type === 'chunk' && chunk.content) {
          fullResponse += chunk.content;
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
          const assistantMessage = this.ragflowService.createMessage('assistant', fullResponse);
          assistantMessage.references = chunk.references;

          this.server.to(session.conversationId).emit(HnRagflowWsEvent.TYPING_END, {
            conversationId: session.conversationId,
          });

          client.emit(HnRagflowWsEvent.MESSAGE_COMPLETE, {
            conversationId: session.conversationId,
            message: assistantMessage,
            references: chunk.references || [],
          });
        }
      }
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

  /**
   * Attempts to authenticate the client by extracting and verifying a JWT token from the WebSocket handshake.
   * Returns the user if authenticated, null otherwise (anonymous access is allowed).
   */
  private async authenticateClient(client: Socket): Promise<HnUser | null> {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        return null;
      }

      const secret = this.coreConfigService.getJwtSecret();
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;

      if (!payload?.sub) {
        return null;
      }

      const user = await this.userService.findOne(payload.sub);
      return user ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Extracts the JWT token from the WebSocket handshake.
   * Checks in order: auth.token, authorization header, cookie.
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    // 1. Check explicit auth payload (socket.io auth)
    let rawToken = client.handshake.auth?.token;

    // 2. Check authorization header
    if (!rawToken) {
      rawToken = client.handshake.headers?.authorization;
    }

    // 3. Check cookie
    if (!rawToken) {
      const cookieHeader = client.handshake.headers?.cookie;
      if (cookieHeader) {
        rawToken = BlCookieHelper.getCookieFromHeader(cookieHeader, 'Authorization');
      }
    }

    if (!rawToken) {
      return null;
    }

    // Decode URI encoding (cookie values may be URL-encoded)
    let token = decodeURIComponent(rawToken);

    // Strip "Bearer " prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    return token || null;
  }

  /**
   * Checks if a client (identified by userId) can access a given session.
   * - If the session has no registered owner, it is an anonymous session: anyone can access it.
   * - If the session has an owner, only that user can access it.
   * - After server restart, owned sessions are lost: access is denied for safety.
   */
  private canAccessSession(sessionId: string, clientUserId: string | null): boolean {
    const ownerId = this.sessionOwnership.get(sessionId);

    // Session not tracked (created before restart or unknown) -> deny access
    if (ownerId === undefined) {
      return false;
    }

    // Anonymous session (owner is null) -> anyone can access
    if (ownerId === null) {
      return true;
    }

    // Owned session: only the owner can access
    if (clientUserId == null) {
      return false;
    }

    return ownerId === clientUserId;
  }

  /**
   * Registers ownership of a session.
   * For authenticated users, stores their userId.
   * For anonymous users, stores null (no ownership enforced).
   */
  private registerSessionOwnership(sessionId: string, userId: string | null): void {
    this.sessionOwnership.set(sessionId, userId);
  }
}
