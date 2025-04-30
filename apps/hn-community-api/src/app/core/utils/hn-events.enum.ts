export enum HnEventType {
  APP_COMMENT = 'APP_COMMENT',
  AGENT_COMMENT = 'AGENT_COMMENT',
  STORY_COMMENT = 'STORY_COMMENT',
  APP_LIKE = 'APP_LIKE',
  AGENT_LIKE = 'AGENT_LIKE',
  BRICK_LIKE = 'BRICK_LIKE',
  STORY_LIKE = 'STORY_LIKE',
}

export interface HnCommentEventData {
  entityId: string;
  numberOfComments: number;
}

export interface HnLikeEventData {
  entityId: string;
  numberOfLikes: number;
}
