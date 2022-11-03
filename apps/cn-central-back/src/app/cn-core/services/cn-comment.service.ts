import {Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';

@Injectable()
export class CnCommentService<T> {

  protected constructor(public dataSource: DataSource) {
  }

  async createComment(comment: T): Promise<T> {
    return this.dataSource.manager.save(comment);
  }
}
