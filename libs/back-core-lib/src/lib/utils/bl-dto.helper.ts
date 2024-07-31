import { Type } from '@nestjs/common';
import { BlEntityWithId, BlEntityWithIdDto } from '@monorepo/back-core-lib';
import { ClPage, ClPageI } from '@monorepo/core-lib';

/**
 * Class to convert object to DTO
 * The DTO class must instantiate all its field to null
 */
export class BlDtoHelper {

  public static fromDto<T extends BlEntityWithId>(type: Type<T>, dto: BlEntityWithIdDto): T {
    const entity: any = new type();
    for (const key of Object.keys(dto)) {
      // useful to skip getter or functions
      if(entity[key] !== undefined) continue
      entity[key] = (dto as any)[key] ;
    }
    return entity;
  }

  public static toDto<T extends BlEntityWithIdDto>(dtoType: Type<T>, entity: BlEntityWithId): T {
    const dto: any = new dtoType();
    for (const key of Object.keys(dto)) {
      dto[key] = (entity as any)[key];
    }

    return dto;
  }

  public static listToDto<T extends BlEntityWithIdDto>(dtoType: Type<T>, entities: BlEntityWithId[]): T[] {
    return entities.map(entity => BlDtoHelper.toDto(dtoType, entity));
  }

  public static pageToDto<T extends BlEntityWithIdDto>(dtoType: Type<T>, entities: ClPageI<BlEntityWithIdDto>): ClPage<T> {
    return new ClPage(entities.first, entities.last, entities.totalElements, entities.currentPage, entities.pageSize,
      BlDtoHelper.listToDto(dtoType, entities.objects));
  }
}
