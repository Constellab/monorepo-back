import {Injectable} from '@nestjs/common';
import {HnBrick} from './hn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, FindOptionsWhere, Repository} from 'typeorm';
import {HnErrorText} from '../../core/model/config/hn-error-text.class';
import {HnCreateBrickDTO, HnEditBrickDTO} from './hn-brick.dto';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlFile,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';

@Injectable()
export class HnBrickService {

  constructor(
    @InjectRepository(HnBrick)
    private bricksRepository: Repository<HnBrick>) {
  }

  async create(createdBrick: HnCreateBrickDTO, entityManager: EntityManager): Promise<HnBrick> {
    if (createdBrick.name.includes(' ')) {
      throw new BlBadRequestException(HnErrorText.BRICK_NAME_INVALID);
    }

    const brickExist: HnBrick = await this.bricksRepository.findOne({where: {name: createdBrick.name}});

    if (brickExist != null) {
      throw new BlBadRequestException(HnErrorText.BRICK_ALREADY_EXIST);
    }
    const brick: HnBrick = new HnBrick();
    brick.initialize(createdBrick);

    return entityManager.save(brick);
  }

  find(): Promise<HnBrick[]> {
    return this.bricksRepository.find();
  }

  async findBrickList(whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>,
                      page: number, size: number): Promise<ClPage<HnBrick>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: whereConditions
    }, this.bricksRepository.manager, HnBrick);
  }

  async findOne(whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>): Promise<HnBrick> {
    return this.bricksRepository.findOne({where: whereConditions});
  }

  async findByNameCentral(name: string): Promise<HnBrick> {
    return await this.bricksRepository.findOne({
      where: {name: name}
    });
  }

  async findBrickForInviteById(id: string): Promise<HnBrick> {
    return this.bricksRepository.findOneBy({id: id});
  }

  async editBrickImage(id: string, image: BlFile): Promise<HnBrick> {
    const brick = await this.bricksRepository.findOneBy({id: id});
    //brick.image = image.path;
    return this.bricksRepository.save(brick);
  }

  async editBrick(brick: HnBrick, editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    brick.description = editedBrick.description;
    brick.gitRepo = editedBrick.gitRepo;
    brick.pipRepo = editedBrick.pipRepo;
    brick.visibility = editedBrick.visibility;
    brick.credentialUsername = editedBrick.credentialUsername;
    brick.credentialPassword = editedBrick.credentialPassword;

    return this.bricksRepository.save(brick);
  }

  checkIfUserHasRightOnTheBrick(brick: HnBrick): void {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (currentUser.id != brick.createdBy.id &&
      !brick?.brickUsers.some(bu => bu.user.id === HnCurrentUserHelper.getCurrentUser()?.id)) {
      throw new BlUnauthorizedException('You are not authorized to edit this brick');
    }
  }

  userHasRightOnBrick(brick: HnBrick): boolean {
    return HnCurrentUserHelper.getCurrentUser()?.id === brick.createdBy?.id ||
      brick?.brickUsers.some(bu => bu.user.id === HnCurrentUserHelper.getCurrentUser()?.id);
  }
}

