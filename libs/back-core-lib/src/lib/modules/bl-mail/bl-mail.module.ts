import { BullModule } from '@nestjs/bullmq';
import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlTranslateModule } from '../bl-translate/bl-translate.module';
import {
  BL_MAIL_CAN_GET_MAIL_PROVIDER,
  BL_MAIL_CONFIG_PROVIDER,
  BlCurrentUserIsAdmin,
  BlMailModuleAsyncOptions,
} from './bl-mail.class';
import { BlMailController } from './bl-mail.controller';
import { BlMailEntity } from './bl-mail.entity';
import { BlMailProcessor } from './bl-mail.processor';
import { BlMailService } from './bl-mail.service';
import { BlMailEntityService } from './bl-mail-entity.service';
import { BlMailSenderService } from './bl-mail-sender.service';

@Global()
@Module({})
export class BlMailModule {
  public static forRootAsync(
    asyncOptions: BlMailModuleAsyncOptions,
    queueName: string,
    queueType: Type<BlMailService>,
    processorType: Type<BlMailProcessor>,
    currentUserIsAdmin: BlCurrentUserIsAdmin
  ): DynamicModule {
    return {
      module: BlMailModule,
      imports: [
        ...asyncOptions.imports,
        BlTranslateModule,
        BullModule.registerQueue({
          name: queueName,
        }),

        TypeOrmModule.forFeature([BlMailEntity]),
      ],
      providers: [
        {
          provide: BL_MAIL_CONFIG_PROVIDER,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject,
        },
        {
          provide: BL_MAIL_CAN_GET_MAIL_PROVIDER,
          useValue: currentUserIsAdmin,
        },
        BlMailSenderService,
        BlMailEntityService,
        {
          provide: BlMailService,
          useClass: queueType,
        },
        { provide: BlMailProcessor, useClass: processorType },
      ],
      exports: [BlMailService, BlMailEntityService],
      controllers: [BlMailController],
    };
  }
}
