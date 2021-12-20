import {CnAbstractService} from './cn-abstract.service';
import {Body, Delete, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {BlEntityWithId, BlParsePipe} from '@monorepo/back-core-lib';

export abstract class CnAbstractController<T extends BlEntityWithId> {

  private readonly parsePipe: BlParsePipe<T>;

  protected constructor(private abstractService: CnAbstractService<T>,
                        private classReference: new() => T) {
    this.parsePipe = new BlParsePipe<T>(classReference);
  }

  @Post()
  create(@Body() entity: T): Promise<T> {
    const convertedEntity: T = this.parsePipe.transform(entity);
    return this.abstractService.create(convertedEntity);
  }

  @Put()
  update(@Body() entity: T): Promise<T> {
    const convertedEntity: T = this.parsePipe.transform(entity);
    return this.abstractService.update(convertedEntity);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.abstractService.deleteById(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<T> {
    return this.abstractService.findByIdAndCheck(id);
  }

}
