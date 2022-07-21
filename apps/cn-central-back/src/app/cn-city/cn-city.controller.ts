import {Controller} from '@nestjs/common';
import {CnCityService} from './cn-city.service';

@Controller('city')
export class CnCityController {
  constructor(private readonly cityService: CnCityService) {
  }
}
