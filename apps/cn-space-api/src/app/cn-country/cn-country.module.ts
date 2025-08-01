import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnCountryController } from './cn-country.controller';
import { CnCountry } from './cn-country.entity';
import { CnCountryService } from './cn-country.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnCountry])],
  controllers: [CnCountryController],
  providers: [CnCountryService],
})
export class CnCountryModule {}
