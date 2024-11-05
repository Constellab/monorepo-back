import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CnCountry } from './cn-country.entity';

@Injectable()
export class CnCountryService {
  constructor(@InjectRepository(CnCountry) private countryRepository: Repository<CnCountry>) {}

  public get(): Promise<CnCountry[]> {
    return this.countryRepository.find({
      relations: ['cities'],
      order: {
        name: 'ASC',
      },
    });
  }
}
