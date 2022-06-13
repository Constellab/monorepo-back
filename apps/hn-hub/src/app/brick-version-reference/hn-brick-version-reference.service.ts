import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickVersionReference} from './hn-brick-version-reference.entity';
import {Repository} from 'typeorm';

@Injectable()
export class HnBrickVersionReferenceService {

  constructor(
    @InjectRepository(HnBrickVersionReference)
    private brickVersionReferenceRepository: Repository<HnBrickVersionReference>
  ) {
  }

}
