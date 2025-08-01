import { Controller, Get } from '@nestjs/common';

import { CnCountry } from './cn-country.entity';
import { CnCountryService } from './cn-country.service';

@Controller('country')
export class CnCountryController {
  constructor(private readonly countryService: CnCountryService) {}

  @Get()
  get(): Promise<CnCountry[]> {
    return this.countryService.get();
  }
}
