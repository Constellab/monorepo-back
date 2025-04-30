import { Module } from '@nestjs/common';
import { CnCityService } from './cn-city.service';
import { CnCityController } from './cn-city.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnCity } from './cn-city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CnCity])],
  controllers: [CnCityController],
  providers: [CnCityService],
})
export class CnCityModule {}
