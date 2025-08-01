import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCityController } from './cn-city.controller';
import { CnCity } from './cn-city.entity';
import { CnCityService } from './cn-city.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnCity])],
  controllers: [CnCityController],
  providers: [CnCityService],
})
export class CnCityModule {}
