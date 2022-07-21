import {Module} from '@nestjs/common';
import {CnCountryService} from './cn-country.service';
import {CnCountryController} from './cn-country.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCountry} from './cn-country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnCountry
    ]),
  ],
  controllers: [CnCountryController],
  providers: [CnCountryService],
})
export class CnCountryModule {
}
