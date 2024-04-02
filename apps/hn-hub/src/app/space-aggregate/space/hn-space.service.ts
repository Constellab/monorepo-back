import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnSpace} from './hn-space.entity';

@Injectable()
export class HnSpaceService {

  constructor(
    @InjectRepository(HnSpace)
    private spaceRepository: Repository<HnSpace>,
  ) {
  }

  public async find(): Promise<HnSpace[]> {
    return this.spaceRepository.find();
  }

  public async findOne(id: string): Promise<HnSpace> {
    return this.spaceRepository.findOneBy({id: id});
  }

  public async create(space: HnSpace): Promise<HnSpace> {
    return this.spaceRepository.save(space);
  }

  public async update(space: HnSpace): Promise<HnSpace> {
    return this.spaceRepository.save(space);
  }

}
