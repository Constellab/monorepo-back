import {Component, Input, OnInit} from '@angular/core';
import {CaOrganization} from '../../../../model/entities/ca-organization.class';
import {CaOrganizationService} from '../../../../service-api/ca-organization.service';
import {ClHelpService} from '@monorepo/core-lib';

export type CaOrganizationPhotoSize = 'small' | 'medium' | 'big';


/**
 * Component to show the photo of an organization or the initial of the organization name
 */
@Component({
  selector: 'ca-organization-photo',
  templateUrl: './ca-organization-photo.component.html',
  styleUrls: ['./ca-organization-photo.component.scss']
})
export class CaOrganizationPhotoComponent implements OnInit {

  @Input() organization: CaOrganization;

  @Input()
  size: CaOrganizationPhotoSize | string = 'medium';


  sizeNumber: number = 3;
  fontSize: number;

  photo: string;
  initial: string;

  constructor(private organizationService: CaOrganizationService) {
  }

  ngOnInit(): void {
    if (!ClHelpService.isNullOrEmpty(this.organization.photo)) {
      this.photo = this.organizationService.getOrganizationPhoto(this.organization.photo);
    }
    this.initial = this.organization.label.charAt(0).toUpperCase();

    switch (this.size) {
      case 'small':
        this.sizeNumber = 2.5;
        break;
      case 'medium':
        this.sizeNumber = 3;
        break;
      case 'big':
        this.sizeNumber = 6;
        break;
      default:
        this.sizeNumber = +this.size;
    }
    this.fontSize = this.sizeNumber / 4;
  }

}
