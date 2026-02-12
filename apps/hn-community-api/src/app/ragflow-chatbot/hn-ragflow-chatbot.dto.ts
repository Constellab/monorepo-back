import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HnRagflowSendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class HnRagflowJoinConversationDto {
  @IsString()
  @IsOptional()
  conversationId?: string;
}

export enum HnRagflowWsEvent {
  JOIN_CONVERSATION = 'join_conversation',
  LEAVE_CONVERSATION = 'leave_conversation',
  SEND_MESSAGE = 'send_message',
  MESSAGE_CHUNK = 'message_chunk',
  MESSAGE_COMPLETE = 'message_complete',
  MESSAGE_ERROR = 'message_error',
  CONVERSATION_JOINED = 'conversation_joined',
  TYPING_START = 'typing_start',
  TYPING_END = 'typing_end',
}
