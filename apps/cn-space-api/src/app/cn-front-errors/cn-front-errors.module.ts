import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnFrontError } from './cn-front-error.entity';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnFrontErrorsController } from './cn-front-errors.controller';
import { CnFrontErrorsService } from './cn-front-errors.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnFrontError]), CnCoreModule],
  controllers: [CnFrontErrorsController],
  providers: [CnFrontErrorsService],
})
export class CnFrontErrorsModule {}
