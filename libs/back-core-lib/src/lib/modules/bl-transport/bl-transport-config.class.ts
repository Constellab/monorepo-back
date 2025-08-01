import { SharedBullAsyncConfiguration } from '@nestjs/bullmq';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import * as Bull from 'bullmq';

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
    useFactory: (...args: any[]) => blTransportRedisFactory(transportOptions.useFactory(...args)),
    inject: transportOptions.inject,
    imports: transportOptions.imports,
  };
}

// queues filled from space
export const blTransportSpaceUserQueue = 'user_queue';
export const blTransportSpaceSpaceUserQueue = 'space_user_queue';

//
export enum BlTransportSpaceUserPattern {
  CREATE = 'createSpaceUser',
  REMOVE = 'removeSpaceUser',
  UPDATE = 'updateSpaceUser',
  DELETE = 'deleteSpace',
}

//queues filled from community
export const blTransportCommunityBrickQueue = 'brick_queue';

// internal queues for the mail service
export const blTransportSpaceMailQueue = 'space_mail_queue';
export const blTransportCommunityMailQueue = 'community_mail_queue';
