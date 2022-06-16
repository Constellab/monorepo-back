import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickVersionReference} from './hn-brick-version-reference.entity';
import {EntityManager, Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';

@Injectable()
export class HnBrickVersionReferenceService extends BlAbstractService<HnBrickVersionReference>  {

  constructor(
    @InjectRepository(HnBrickVersionReference)
    private brickVersionReferenceRepository: Repository<HnBrickVersionReference>
  ) {
    super(brickVersionReferenceRepository, HnBrickVersionReference);
  }

  async createReferences(references: HnBrickVersionReference[], entityManager: EntityManager): Promise<HnBrickVersionReference[]> {
    const res: HnBrickVersionReference[] = []
    for (const r of references) {
      res.push(await entityManager.save(r));
    }
    return res;
  }

  async findByBrickVersionId(id: string): Promise<HnBrickVersionReference[]> {
    return this.brickVersionReferenceRepository.find({
      where: {
        brickVersion:{
          id: id
        }
      }
    });
  }

  async deleteByBrickVersionId(id: string, entityManager: EntityManager): Promise<void>{
    for(const bVR of await this.findByBrickVersionId(id)){
      await this.deleteById(bVR.id, entityManager);
    }
  }
}
