import {Component, Input, OnInit} from '@angular/core';
import {CaOrganization} from '../../../../model/entities/ca-organization.class';

@Component({
  selector: 'ca-organization-inline',
  templateUrl: './ca-organization-inline.component.html',
  styleUrls: ['./ca-organization-inline.component.scss']
})
export class CaOrganizationInlineComponent implements OnInit {

  @Input() organization: CaOrganization;

  constructor() { }

  ngOnInit(): void {
  }

}
