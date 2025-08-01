import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnCity } from './cn-city.entity';

@Injectable()
export class CnCityService {
  constructor(@InjectRepository(CnCity) private cityRepository: Repository<CnCity>) {}
}
