import {Injectable} from '@nestjs/common';
import {AbstractService} from '../core/class/abstract.service';
import {Protocol} from './protocol.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {User} from '../users/user.entity';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {Page} from '../core/model/config/page.class';

@Injectable()
export class ProtocolsService extends AbstractService<Protocol> {

  constructor(@InjectRepository(Protocol) private repository: Repository<Protocol>) {
    super(repository, Protocol);
  }

  getCurrentProtocols(page: number, size: number): Promise<Page<Protocol>> {
    const user: User = RequestContextHelper.getAndCheckCurrentUser();

    return this.findPaginated(page, size, {
      where: {
        createdBy: {id: user.id}
      }
    });
  }

  findByIdWithExperiments(id: string, entityManager?: EntityManager): Promise<Protocol> {
    return this.findByIdAndCheck(id, {
      relations: ['experiments']
    }, entityManager);
  }

  /**
   * Get the protocol and delete it if the protocol is not used by an experiment
   */
  async deleteProtocolIfNotUsed(id: string, entityManager: EntityManager): Promise<void> {
    const protocol: Protocol = await this.findByIdWithExperiments(id, entityManager);

    if (protocol.experiments.length === 0) {
      await this.deleteById(id, entityManager);
    }
  }
}
