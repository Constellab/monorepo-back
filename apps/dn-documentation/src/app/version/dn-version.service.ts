import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Version } from './dn-version.entity';

@Injectable()
export class VersionService {
    constructor(
        @InjectRepository(Version)
        private versionsRepository: Repository<Version>,
    ){}

    getByVersionNumber(vNumber: string): Promise<Version>{
        return this.versionsRepository.findOne({where: {versionNumber: vNumber}});
    }
}
