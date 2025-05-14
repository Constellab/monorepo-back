export interface TeBlockWithMetadata {
  metadata?: TeMetadataBlockConfig;
}

export class TeMetadataBlockConfig {
  appRoute?: string;
  permission?: TeMetadataPermission | string;
}

export enum TeMetadataPermission {
  ADMIN = 'You are an admin',
  SPACE_ADMIN = 'You are a space admin',
  SPACE_ACCESS = 'You have access to the space',
  ROOT_FOLDER_ACCESS = 'You have access to the root folder',
  LAB_ACCESS = 'You have access to the lab',
  LAB_OWNER = 'You are the owner of the lab',
  STORY_OWNER = 'Your are the owner of the story',
  BRICK_OWNER = 'You are the owner of the brick',
  AGENT_OWNER = 'You are the owner of the agent',
  APP_OWNER = 'You are the owner of the app',
  STORY_COAUTHOR = 'You are the owner or a coauthor of the story',
  BRICK_COAUTHOR = 'You are the owner or a coauthor of the brick',
  AGENT_COAUTHOR = 'You are the owner or a coauthor of the agent',
}
