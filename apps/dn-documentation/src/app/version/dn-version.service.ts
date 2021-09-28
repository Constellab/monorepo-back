import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Version } from './dn-version.entity';

@Injectable()
export class VersionService {
  // constructor(
  //   @InjectRepository(Version)
  //   private versionsRepository: Repository<Version>,
  // ){}

  // create(createVersionRes: Version): Promise<Version> {
  //   const createVersion = {
  //     title: createVersionRes.title,
  //     content: createVersionRes.content
  //   }
  //   return this.versionsRepository.save(createVersion);
  // }

  // findAll(): Promise<Version[]> {
  //   return this.versionsRepository.find();
  // }

  // findOne(id: string): Promise<Version> {
  //   return this.versionsRepository.findOne(id);
  // }

  // update(updateVersion: Version): Promise<Version> {
  //   return this.versionsRepository.save(updateVersion);
  // }

  // async remove(id: string): Promise<void> {
  //   await this.versionsRepository.delete(id);
  // }
}
