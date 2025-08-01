import { BlAbstractService } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CnServerStandard } from './cn-server-standard.entity';

@Injectable()
export class CnServerStandardService extends BlAbstractService<CnServerStandard> {
  constructor(@InjectRepository(CnServerStandard) private repository: Repository<CnServerStandard>) {
    super(repository, CnServerStandard);
  }

  public findAll(page: number, size: number): Promise<ClPage<CnServerStandard>> {
    return this.findPaginated(page, size, {
      order: { name: 'ASC' },
    });
  }

  public findByNames(names: string[]): Promise<CnServerStandard[]> {
    return this.repository.find({
      where: {
        name: In(names),
      },
      order: { name: 'ASC' },
    });
  }
}
