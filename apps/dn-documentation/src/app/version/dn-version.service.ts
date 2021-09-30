import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DnVersion } from './dn-version.entity';

@Injectable()
export class DnVersionService {
    constructor(
        @InjectRepository(DnVersion)
        private versionsRepository: Repository<DnVersion>,
    ){}

    getByVersionNumber(vNumber: string): Promise<DnVersion>{
        return this.versionsRepository.findOne({where: {versionNumber: vNumber}});
    }
}
