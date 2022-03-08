import {BadRequestException, Injectable} from '@nestjs/common';
import {CnBrick} from './cn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnBrickVersion} from './cn-brick-version.entity';
import {CmVersion} from '@monorepo/common-model';
import {CnBrickSaveDTO} from './cn-brick.dto';
import {BlAbstractService} from '@monorepo/back-core-lib';

@Injectable()
export class CnBricksService extends BlAbstractService<CnBrick> {

  constructor(@InjectRepository(CnBrick) private brickRepo: Repository<CnBrick>,
              @InjectRepository(CnBrickVersion) private brickVersionRepo: Repository<CnBrickVersion>) {
    super(brickRepo, CnBrick);
  }


  public async saveBrick(brickSaveDTO: CnBrickSaveDTO): Promise<void> {
    // create or update the brick
    let brick: CnBrick = new CnBrick();
    brick.id = brickSaveDTO.id;
    brick.name = brickSaveDTO.name;
    brick.pipRepo = brickSaveDTO.pipRepo;
    brick.gitRepo = brickSaveDTO.gitRepo;
    brick = await this.brickRepo.save(brick);

    // create or update brick version
    for (const versionDTO of brickSaveDTO.versions) {
      const brickVersion = new CnBrickVersion();
      brickVersion.id = versionDTO.id;
      brickVersion.major = versionDTO.major;
      brickVersion.minor = versionDTO.minor;
      brickVersion.patch = versionDTO.patch;
      brickVersion.versionState = versionDTO.versionState;
      brickVersion.repoType = versionDTO.repoType;
      brickVersion.brick = brick;
      await this.brickVersionRepo.save(brickVersion);
    }
  }

  public findByName(name: string): Promise<CnBrick> {
    return this.brickRepo.findOne({where: {name: name}});
  }

  public getBrickVersion(name: string, version: CmVersion): Promise<CnBrickVersion | null> {
    return this.brickVersionRepo.findOne(
      {
        where: {
          brick: {name: name},
          major: version.major,
          minor: version.minor,
          patch: version.patch
        },
        relations: ['brick']
      });
  }

  public async getBrickVersionAndCheck(name: string, version: CmVersion): Promise<CnBrickVersion> {
    const brickVersion = await this.getBrickVersion(name, version);

    if (brickVersion == null) {
      // eslint-disable-next-line max-len
      throw new BadRequestException(`The version '${version.toString()}' does not exist on brick '${name}'. Please register the version on the hub.`);
    }

    return brickVersion;
  }

  public getAllBricks(): Promise<CnBrick[]> {
    return this.brickRepo.find({relations: ['versions']});
  }

  public getBrickVersions(brickName: string): Promise<CnBrickVersion[]> {
    return this.brickVersionRepo.find({
      where: {
        brick: {name: brickName},
      },
      order: {
        major: 'DESC',
        minor: 'DESC',
        patch: 'DESC'
      },
      relations: ['brick']
    });
  }
}
