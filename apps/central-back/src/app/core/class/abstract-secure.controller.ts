import {Body, Delete, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {AbstractSecurityLayer} from './abstract-security.layer';
import {BlEntityWithId, BlParsePipe} from '@monorepo/back-core-lib';

/**
 * Abstract CRUD controller that call the security layer
 */
export abstract class AbstractSecureController<T extends BlEntityWithId> {

  private readonly parsePipe: BlParsePipe<T>;

  protected constructor(private secuLayer: AbstractSecurityLayer<T>,
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
  delete(@Param('id', ParseUUIDPipe) id: string): void {
    this.secuLayer.deleteByIdSecure(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<T> {
    return this.secuLayer.findByIdAndCheckSecure(id);
  }

}
