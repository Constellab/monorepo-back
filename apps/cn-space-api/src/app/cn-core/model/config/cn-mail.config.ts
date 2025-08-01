import {
  BlCurrentUserIsAdmin,
  BlMailModuleAsyncOptions,
  BlMailModuleConfig,
  BlMailProcessor,
  BlMailService,
  blTransportSpaceMailQueue,
} from '@monorepo/back-core-lib';
import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { join } from 'path';

import { CnCoreModule } from '../../cn-core.module';
import { CnCoreConfigService } from '../../modules/cn-core-config/cn-core-config.service';
import { CnCurrentUserHelper } from '../../utils/cn-current-user.helper';

/**
 * classes to configure the correct queue for the Mail module
 */
@Injectable()
@Processor(blTransportSpaceMailQueue)
export class CnMailProcessor extends BlMailProcessor {}

@Injectable()
export class CnMailService extends BlMailService {
  constructor(@InjectQueue(blTransportSpaceMailQueue) audioQueue: Queue) {
    super(audioQueue);
  }
}

export class CnMailConfig {
  public static queueName = blTransportSpaceMailQueue;

  public static mailServiceType = CnMailService;

  public static processorType = CnMailProcessor;

  public static configureMailModule(): BlMailModuleAsyncOptions {
    return {
      imports: [CnCoreModule],
      useFactory: CnMailConfig.mailFactory,
      inject: [CnCoreConfigService],
    };
  }

  private static mailFactory(configService: CnCoreConfigService): BlMailModuleConfig {
    return {
      mailConfig: configService.getMailConfig(),
      templateFolder: join(__dirname, 'assets/templates/'),
      defaultLayout: 'main',
      defaultData: { contactMail: configService.getCustomerSuccessMail() },
    };
  }

  public static currentUserIsAdmin: BlCurrentUserIsAdmin = () => {
    return CnCurrentUserHelper.isAdmin();
  };
}
