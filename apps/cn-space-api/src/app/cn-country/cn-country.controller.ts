import { Controller, Get } from '@nestjs/common';
import { CnCountryService } from './cn-country.service';
import { CnCountry } from './cn-country.entity';

@Controller('country')
export class CnCountryController {
  constructor(private readonly countryService: CnCountryService) {}

  @Get()
  get(): Promise<CnCountry[]> {
    return this.countryService.get();
  }
}
