import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnFrontError} from './cn-front-error.entity';


@Injectable()
export class CnFrontErrorsService {

  constructor(@InjectRepository(CnFrontError) private repository: Repository<CnFrontError>) {
  }

  logFrontError(error: CnFrontError): Promise<CnFrontError> {
    return this.repository.save(error);
  }
}
