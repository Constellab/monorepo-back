export const cnSpaceEventName = 'cn-space-event';

export type CnSpaceEvent = {
  type: 'REMOVE_USER_FROM_SPACE';
  userId: string;
  spaceId: string;
};
