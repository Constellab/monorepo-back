import { EntityManager } from 'typeorm';

export const CN_SPACE_EVENT_NAME = 'cn-space-event';

export type CnSpaceEvent =
  | {
      type: 'REMOVE_USER_FROM_SPACE';
      userId: string;
      spaceId: string;
      entityManager: EntityManager;
    }
  | {
      type: 'DOWNGRADE_USER_TO_VIEWER';
      userId: string;
      spaceId: string;
      entityManager: EntityManager;
    };
