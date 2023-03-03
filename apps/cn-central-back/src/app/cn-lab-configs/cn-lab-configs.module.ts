import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnLabConfig} from './cn-lab-config.entity';
import {CnLabConfigsService} from './cn-lab-configs.service';
import {CnLabConfigsController} from './cn-lab-configs.controller';
import {CnBricksModule} from '../cn-bricks/cn-bricks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnLabConfig]),

    CnBricksModule,
  ],
  providers: [CnLabConfigsService],
  controllers: [CnLabConfigsController],
  exports: [CnLabConfigsService]
})
export class CnLabConfigsModule {
}
