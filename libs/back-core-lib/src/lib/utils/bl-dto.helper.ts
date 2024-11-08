import { ClPage, ClPageI } from '@monorepo/core-lib';

/**
 * Class to convert object to DTO
 */
export class BlDtoHelper {
  public static listToDto<T, H>(dtoType: new (entity: H) => T, entities: H[]): T[] {
    return entities.map((entity) => new dtoType(entity));
  }

  public static pageToDto<T, H>(dtoType: new (entity: H) => T, entities: ClPageI<H>): ClPage<T> {
    return new ClPage(
      entities.first,
      entities.last,
      entities.totalElements,
      entities.currentPage,
      entities.pageSize,
      BlDtoHelper.listToDto(dtoType, entities.objects)
    );
  }
}
