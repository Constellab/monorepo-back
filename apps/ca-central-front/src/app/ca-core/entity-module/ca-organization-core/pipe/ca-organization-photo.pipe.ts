import {Pipe, PipeTransform} from '@angular/core';
import {CaOrganization} from '../../../model/entities/ca-organization.class';
import {CaOrganizationService} from '../../../service-api/ca-organization.service';

@Pipe({
  name: 'caOrganizationPhoto'
})
export class CaOrganizationPhotoPipe implements PipeTransform {

  constructor(private organizationService: CaOrganizationService) {
  }

  transform(value: CaOrganization | string): string {
    if (!value) return null;

    let photo: string;
    if (typeof value === 'string') {
      photo = value;
    } else {
      photo = value.photo;
    }

    if (!photo) return null;

    return this.organizationService.getOrganizationPhoto(photo);
  }

}
