import { Module } from '@nestjs/common';
import { HnResourceService } from './hn-resource.service';
import { HnResourceController } from './hn-resource.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HnResource } from './hn-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnResource])],
  controllers: [HnResourceController],
  exports: [TypeOrmModule],
  providers: [HnResourceService],
})
export class HnResourceModule {}
