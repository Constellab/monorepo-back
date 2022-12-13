import {Pipe, PipeTransform} from '@angular/core';
import {CaSpace} from '../../../model/entities/space/ca-space.class';
import {CaSpaceService} from '../../../service-api/ca-space.service';

@Pipe({
  name: 'caSpacePhoto'
})
export class CaSpacePhotoPipe implements PipeTransform {

  constructor(private spaceService: CaSpaceService) {
  }

  transform(value: CaSpace | string): string {
    if (!value) return null;

    let photo: string;
    if (typeof value === 'string') {
      photo = value;
    } else {
      photo = value.photo;
    }

    if (!photo) return null;

    return this.spaceService.getSpacePhoto(photo);
  }

}
