import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {Observable} from 'rxjs';
import {CaOrganization} from '../../../../ca-core/model/entities/ca-organization.class';
import {CaCurrentOrganizationService} from '../../../../ca-core/service-api/ca-current-organization.service';

@Component({
  selector: 'ca-current-organization-page',
  templateUrl: './ca-current-organization-page.component.html',
  styleUrls: ['./ca-current-organization-page.component.scss']
})
export class CaCurrentOrganizationPageComponent implements OnInit {

  organization$: Observable<CaOrganization>;



  constructor(private route: ActivatedRoute,
              private organizationService: CaOrganizationService,
              private currentOrganizationService: CaCurrentOrganizationService) {
  }

  ngOnInit(): void {
    this.organization$ = this.currentOrganizationService.getCurrentOrganization$();
  }

}
