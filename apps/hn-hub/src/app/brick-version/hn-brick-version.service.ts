import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickVersion, HnNewVersionDTO, HnReferenceDTO} from './hn-brick-version.entity';
import {EntityManager, getManager, Repository} from 'typeorm';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {BlAbstractService, BlTransportService} from '@monorepo/back-core-lib';
import {HnBrickTransportDto} from '../brick/hn-brick.dto';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {ClPageI} from '@monorepo/core-lib';
import {CmVersion} from '@monorepo/common-model';
import {HnBrickVersionReferenceService} from '../brick-version-reference/hn-brick-version-reference.service';
import {
  HnBrickVersionReference,
  HnBrickVersionRefState
} from '../brick-version-reference/hn-brick-version-reference.entity';

@Injectable()
export class HnBrickVersionService extends BlAbstractService<HnBrickVersion> {

  constructor(
    @InjectRepository(HnBrickVersion)
    private brickVersionsRepository: Repository<HnBrickVersion>,
    private transportService: BlTransportService,
    private brickVersionReferenceService: HnBrickVersionReferenceService,
    private entityManager: EntityManager
  ) {
    super(brickVersionsRepository, HnBrickVersion);
  }

  async create(brickVersion: HnBrickVersion): Promise<HnBrickVersion> {
    brickVersion = await this.brickVersionsRepository.save(brickVersion);
    await this.sendBrickVersionIdToTransport(brickVersion.id);
    return brickVersion;
  }

  async createFirstBrickVersion(brickVersion: HnBrickVersion, entityManager: EntityManager): Promise<HnBrickVersion> {
    return await entityManager.save(brickVersion);
  }


  async createNewBrickVersion(brickMajorVersion: HnBrickMajorVersion, newVersion: HnNewVersionDTO): Promise<HnBrickVersion> {
    let res: HnBrickVersion = null;
    res = await getManager().transaction(async entityManager => {
      const newBrickVersion: HnBrickVersion = new HnBrickVersion();
      const version: CmVersion = CmVersion.fromString(newVersion.version);
      const bv: HnBrickVersion = await this.brickVersionsRepository.findOne({
        where: {
          brickMajorVersion: {
            id : brickMajorVersion.id
          },
          minor: version.minor,
          patch: version.patch,
          subPatch: version.subPatch
        }
      })
      if(bv != null){
        bv.initialize(brickMajorVersion, version, newVersion.repoType, newVersion.technicalInfo);
        res = await entityManager.save(bv);
        await this.brickVersionReferenceService.deleteByBrickVersionId(res.id, entityManager);
      } else {
        newBrickVersion.initialize(brickMajorVersion, version, newVersion.repoType, newVersion.technicalInfo);
        res = await entityManager.save(newBrickVersion);
      }

      if (newVersion.references && newVersion.references.length > 0) {

        const refs: HnBrickVersionReference[] = [];

        for (const ref of newVersion.references) {
          if (refs.find(r => r.brickVersion.brickMajorVersion.brick.name == ref.name)) {
            throw new UnauthorizedException(`There is more than one reference of the brick ${ref.name}`);
          }
          const cmV: CmVersion = CmVersion.fromString(ref.version);
          const brickVersion: HnBrickVersion = await this.brickVersionsRepository.findOne({
            where: {
              brickMajorVersion: {
                brick: {
                  name: ref.name
                },
                major: cmV.major
              },
              minor: cmV.minor,
              patch: cmV.patch,
              subPatch: cmV.subPatch
            },
            relations: ['brickMajorVersion', 'brickMajorVersion.brick']
          });
          if (!brickVersion) {
            throw new UnauthorizedException(`The referenced brick ${ref.name} with the version ${ref.version} is not in the hub`);
          }
          refs.push({
            brickVersion: res,
            reference: brickVersion,
            versionState: HnBrickVersionRefState.DIRECT
          } as HnBrickVersionReference);
        }
        for (let r of refs) {
          const ref: HnBrickVersionReference = new HnBrickVersionReference();
          Object.assign(ref, r);

          r = await entityManager.save(ref);
        }
      }

      return res;
    });
    await this.sendBrickVersionIdToTransport(res.id);
    return res;
  }

  /**
   * Send all bricks to queue
   */
  public async sendAllBrickVersionToQueue(): Promise<void> {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();

    if (!user.isAdmin()) {
      throw new UnauthorizedException('You must be an admin to synchronize the versions');
    }

    // retrieve all the versions
    const brickVersions = await this.brickVersionsRepository.find({
      relations: ['brickMajorVersion', 'brickMajorVersion.brick']
    });

    for (const brickVersion of brickVersions) {
      this.sendBrickVersionToTransport(brickVersion);
    }
  }


  /**
   * Method to send the brick version into the transport when creating or updating a version
   * @param brickVersionId
   * @private
   */
  async sendBrickVersionIdToTransport(brickVersionId: string): Promise<void> {
    const brickVersion = await this.brickVersionsRepository.findOne({
      where: {
        id: brickVersionId,
      },
      relations: ['brickMajorVersion', 'brickMajorVersion.brick']
    });

    this.sendBrickVersionToTransport(brickVersion);
  }

  private sendBrickVersionToTransport(brickVersion: HnBrickVersion): void {
    const brick: HnBrickTransportDto = {
      id: brickVersion.brickMajorVersion.brick.id,
      name: brickVersion.brickMajorVersion.brick.name,
      pipRepo: brickVersion.brickMajorVersion.brick.pipRepo,
      gitRepo: brickVersion.brickMajorVersion.brick.gitRepo,
      versions: [{
        id: brickVersion.id,
        major: brickVersion.brickMajorVersion.major,
        minor: brickVersion.minor,
        patch: brickVersion.patch,
        versionType: brickVersion.versionType,
        subPatch: brickVersion.subPatch,
        versionState: brickVersion.brickMajorVersion.versionState,
        repoType: brickVersion.repoType,
        technicalInfo: brickVersion.technicalInfo
      }]
    };
    this.transportService.emit('brick', brick);
  }

  async getCurrentBrickVersion(page: number, size: number, brickId: string): Promise<ClPageI<HnBrickVersion>> {
    return this.findPaginated(page, size, {
      where: {
        brickMajorVersion: {
          brick: {
            id: brickId
          },
        }
      },
      order: {
        createdAt: 'DESC'
      },
      relations: ['brickMajorVersion']
    }
    );
  }

  async getLatestBrickVersion(brickMajorVersionId: string): Promise<HnBrickVersion> {
    const brickVersions: HnBrickVersion[] = await this.brickVersionsRepository.find({
      where: {
        brickMajorVersion: {
          id: brickMajorVersionId
        }
      },
      order: {
        minor: 'DESC',
        patch: 'DESC'
      }
    });
    return brickVersions[0];
  }

  async checkIfVersionExist(brickMajorVersion: HnBrickMajorVersion, version: string): Promise<[boolean, boolean]> {
    const v: CmVersion = CmVersion.fromString(version);
    const bv: HnBrickVersion = await this.brickVersionsRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersion.id
        },
        minor: v.minor,
        patch: v.patch,
        subPatch: v.subPatch
      }
    });
    if(bv && bv.version.major != v.major){
      throw new UnauthorizedException('Impossible to create a new major version');
    }
    return [true, bv != null];
  }

  async findDirectReferences(id: string): Promise<HnBrickVersionReference[]>{
    return await this.brickVersionReferenceService.findByBrickVersionId(id);
  }

  async findAllReferences(id: string, isUndirect?: boolean): Promise<HnBrickVersionReference[]>{
    const res: HnBrickVersionReference[] = await this.findDirectReferences(id);
    if(res.length == 0){
      return res;
    } else {
      for(const bVR of res){
        if(isUndirect){
          bVR.versionState = HnBrickVersionRefState.INDIRECT;
        }
        res.push(...await this.findAllReferences(bVR.referenceId, true));
      }
      return res;
    }
  }

  async getDirectReferences(id: string): Promise<HnReferenceDTO[]>{
    const res: HnReferenceDTO[] = [];
    for(const bVR of (await this.findDirectReferences(id))){
      res.push((await this.bVRToRef(bVR)));
    }
    return res;
  }

  async getAllReferences(id: string): Promise<HnReferenceDTO[]>{
    const res: HnReferenceDTO[] = [];
    for(const bVR of (await this.findAllReferences(id))){
      res.push(await this.bVRToRef(bVR));
    }
    return res.filter(function(value, index, array) {
      let t = true;
      for(const e of array){
        if(e.name == value.name && array.indexOf(e) != index){
          t = CmVersion.fromString(e.version) < CmVersion.fromString(value.version);
          console.log(t);
        }
      }
      return t;
    });
  }

  async bVRToRef(bVR: HnBrickVersionReference): Promise<HnReferenceDTO>{
    return {
      name : await this.getBrickName(bVR.referenceId),
      version : (await this.brickVersionsRepository.findOne(bVR.referenceId)).version.toString(),
      referenceState : bVR.versionState
    };
  }

  async getBrickName(id: string): Promise<string>{
    return (await this.brickVersionsRepository.findOne(id)).brickMajorVersion.brick.name;
  }

}
