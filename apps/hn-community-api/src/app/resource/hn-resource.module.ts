import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnResourceController } from './hn-resource.controller';
import { HnResource } from './hn-resource.entity';
import { HnResourceService } from './hn-resource.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnResource])],
  controllers: [HnResourceController],
  exports: [TypeOrmModule],
  providers: [HnResourceService],
})
export class HnResourceModule {}
