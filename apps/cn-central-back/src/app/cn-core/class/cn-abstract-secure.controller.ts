import {Body, Delete, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {CnAbstractSecurityLayer} from './cn-abstract-security.layer';
import {BlEntityWithId, BlParsePipe} from '@monorepo/back-core-lib';

/**
 * Abstract CRUD controller that call the security layer
 */
export abstract class CnAbstractSecureController<T extends BlEntityWithId> {

  private readonly parsePipe: BlParsePipe<T>;

  protected constructor(private secuLayer: CnAbstractSecurityLayer<T>,
                        private classReference: new() => T) {
    this.parsePipe = new BlParsePipe<T>(classReference);
  }

  @Post()
  create(@Body() entity: T): Promise<T> {
    const convertedEntity: T = this.parsePipe.transform(entity);
    return this.secuLayer.createSecure(convertedEntity);
  }

  @Put()
  update(@Body() entity: T): Promise<T> {
    const convertedEntity: T = this.parsePipe.transform(entity);
    return this.secuLayer.updateSecure(convertedEntity);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.secuLayer.deleteByIdSecure(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<T> {
    return this.secuLayer.findByIdAndCheckSecure(id);
  }

}
