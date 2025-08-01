import {
  BlCurrentUserIsAdmin,
  BlMailModuleAsyncOptions,
  BlMailModuleConfig,
  BlMailProcessor,
  BlMailService,
  blTransportCommunityMailQueue,
} from '@monorepo/back-core-lib';
import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { join } from 'path';

import { HnCoreModule } from '../../hn-core.module';
import { HnCoreConfigService } from '../../modules/core-config/hn-core-config.service';
import { HnCurrentUserHelper } from '../../utils/hn-current-user.helper';

@Injectable()
@Processor(blTransportCommunityMailQueue)
export class HnMailProcessor extends BlMailProcessor {}

@Injectable()
export class HnMailService extends BlMailService {
  constructor(@InjectQueue(blTransportCommunityMailQueue) queue: Queue) {
    super(queue);
  }
}

export class HnMailConfig {
  public static queueName: string = blTransportCommunityMailQueue;

  public static mailServiceType = HnMailService;

  public static processorType = HnMailProcessor;

  public static configureMailModule(): BlMailModuleAsyncOptions {
    return {
      imports: [HnCoreModule],
      useFactory: HnMailConfig.mailFactory,
      inject: [HnCoreConfigService],
    };
  }

  private static mailFactory(configService: HnCoreConfigService): BlMailModuleConfig {
    return {
      mailConfig: configService.getMailConfig(),
      templateFolder: join(__dirname, 'assets/templates/'),
      defaultLayout: 'main',
      defaultData: { contactMail: configService.getCustomerSuccessMail() },
    };
  }

  public static currentUserIsAdmin: BlCurrentUserIsAdmin = () => {
    return HnCurrentUserHelper.isAdmin();
  };
}
