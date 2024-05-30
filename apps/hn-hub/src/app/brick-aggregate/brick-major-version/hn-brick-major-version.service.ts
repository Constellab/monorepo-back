import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickMajorVersion, HnVersionState} from './hn-brick-major-version.entity';
import {EntityManager, Repository} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnCreateBrickDTO} from '../brick/hn-brick.dto';

@Injectable()
export class HnBrickMajorVersionService {

  constructor(@InjectRepository(HnBrickMajorVersion)
              private brickMajorVersionsRepository: Repository<HnBrickMajorVersion>) {
  }

  async create(brick: HnBrick, createdBrick: HnCreateBrickDTO, entityManager: EntityManager): Promise<HnBrickMajorVersion> {
    const brickMajorVersion: HnBrickMajorVersion = new HnBrickMajorVersion();
    brickMajorVersion.initialize(brick, createdBrick.version.major);
    return entityManager.save(brickMajorVersion);
  }

  async findBrickMajorVersionsByBrick(brick: HnBrick): Promise<HnBrickMajorVersion[]> {
    return this.brickMajorVersionsRepository.find({
      where: {
        brick: {
          id: brick.id
        }
      }
    });
  }

  async findBrickMajorVersionByBrickAndVersion(brick: HnBrick, version: string): Promise<HnBrickMajorVersion> {
    let major: number;

    if (version != 'latest') {
      version = version.slice(1);
      major = +(version.split('.')[0]);
      return await this.brickMajorVersionsRepository.findOne({where: {brick: {id: brick.id}, major: major}});
    }

    return this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id: brick.id
        },
        versionState: HnVersionState.LATEST
      }
    });
  }

  async getLatestBrickMajorVersion(brickId: string): Promise<HnBrickMajorVersion> {
    return await this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id: brickId
        },
        versionState: HnVersionState.LATEST
      }, relations: ['brick']
    });
  }

  async findOneByBrickIdAndMajor(brickId: string, major: number): Promise<HnBrickMajorVersion> {
    return this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id: brickId
        },
        major: major
      }
    });
  }

  async findBrickMajorVersionByBrickAndMajor(brick: HnBrick, major: number): Promise<HnBrickMajorVersion> {
    return this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id: brick.id
        },
        major: major
      },
      relations: ['brick']
    });
  }
}
