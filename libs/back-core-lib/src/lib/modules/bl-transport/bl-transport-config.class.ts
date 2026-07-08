import { ClTheme } from '@monorepo/core-lib';
import { SharedBullAsyncConfiguration } from '@nestjs/bullmq';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import * as Bull from 'bullmq';
import { DateTime } from 'luxon';

import { BlUser } from '../../models/bl-user/bl-user.class';
import { BlUserCategory } from '../../models/bl-user/bl-user-category.enum';

export interface BlTransportModuleConfig {
  host: string;
  password: string;
  port: number;
}

export interface BlTransportModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => BlTransportModuleConfig;
  inject?: any[];
}

function blTransportRedisFactory(config: BlTransportModuleConfig): Bull.QueueOptions {
  return {
    connection: {
      host: config.host,
      password: config.password,
      port: typeof config.port === 'number' ? config.port : parseInt(config.port),
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        delay: 5000,
        type: 'exponential',
      },
    },
  };
}

export function blTransportRedisForRoot(
  transportOptions: BlTransportModuleAsyncOptions
): SharedBullAsyncConfiguration {
  return {
    useFactory: (...args: any[]) => {
      if (transportOptions.useFactory == null) {
        throw new Error('blTransportRedisForRoot requires a useFactory in the provided transportOptions');
      }
      return blTransportRedisFactory(transportOptions.useFactory(...args));
    },
    inject: transportOptions.inject,
    imports: transportOptions.imports,
  };
}

// queues filled from space
export const BL_TRANSPORT_SPACE_USER_QUEUE = 'user_queue';
export const BL_TRANSPORT_SPACE_SPACE_USER_QUEUE = 'space_user_queue';

//
export enum BlTransportSpaceUserPattern {
  CREATE = 'createSpaceUser',
  REMOVE = 'removeSpaceUser',
  UPDATE = 'updateSpaceUser',
  DELETE = 'deleteSpace',
}

export enum BlTransportUserPattern {
  CREATE_OR_UPDATE = 'createOrUpdateUser',
  DELETE = 'deleteUser',
}

//queues filled from community
export const BL_TRANSPORT_COMMUNITY_BRICK_QUEUE = 'brick_queue';

// internal queues for the mail service
export const BL_TRANSPORT_SPACE_MAIL_QUEUE = 'space_mail_queue';
export const BL_TRANSPORT_COMMUNITY_MAIL_QUEUE = 'community_mail_queue';

////////////////////// PAYLOADS //////////////////////

export interface BlTransportSpaceUserPayloadUser extends BlUser {
  category: BlUserCategory;
  theme: ClTheme;
}

export interface BlTransportSpaceUserCreateOrUpdatePayload {
  userId: string;
  spaceId: string;
  role: string;
  active: boolean;
  user: BlTransportSpaceUserPayloadUser;
  space: BlTransportSpacePayload;
  addedBy: BlUser;
  createdAt: DateTime;
}

export interface BlTransportSpacePayload {
  id: string;
  name: string;
  photo: string;
  createdBy: BlUser;
}

export interface BlTransportSpaceUserRemovePayload {
  userId: string;
  spaceId: string;
}

export interface BlTransportSpaceDeletePayload {
  id: string;
}
