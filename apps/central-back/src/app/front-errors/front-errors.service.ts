import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {FrontError} from './front-error.entity';


@Injectable()
export class FrontErrorsService {

  constructor(@InjectRepository(FrontError) private repository: Repository<FrontError>) {
  }

  logFrontError(error: FrontError): Promise<FrontError> {
    return this.repository.save(error);
  }
}
