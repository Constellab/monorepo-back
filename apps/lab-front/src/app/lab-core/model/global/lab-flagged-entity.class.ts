import {FlEntity} from '@monorepo/front-core-lib';

/**
 * Entity that support flag feature
 */
export interface LabFlaggedEntity extends FlEntity{
  flagged: boolean;
}
