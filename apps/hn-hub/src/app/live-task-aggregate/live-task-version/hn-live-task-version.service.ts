import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnLiveTaskVersion} from './hn-live-task-version.entity';

@Injectable()
export class HnLiveTaskVersionService {
  constructor(
    @InjectRepository(HnLiveTaskVersion)
    private liveTaskVersionRepository: Repository<HnLiveTaskVersion>
  ) {
  }
}
