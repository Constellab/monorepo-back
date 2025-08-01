import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnBricksModule } from '../cn-bricks/cn-bricks.module';
import { CnLabConfig } from './cn-lab-config.entity';
import { CnLabConfigsController } from './cn-lab-configs.controller';
import { CnLabConfigsService } from './cn-lab-configs.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnLabConfig]), CnBricksModule],
  providers: [CnLabConfigsService],
  controllers: [CnLabConfigsController],
  exports: [CnLabConfigsService],
})
export class CnLabConfigsModule {}
