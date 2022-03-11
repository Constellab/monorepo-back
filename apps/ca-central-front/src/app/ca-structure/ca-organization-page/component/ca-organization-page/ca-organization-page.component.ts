import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {mergeMap, Observable} from 'rxjs';
import {CaOrganization} from '../../../../ca-core/model/entities/ca-organization.class';

@Component({
  selector: 'ca-organization-page',
  templateUrl: './ca-organization-page.component.html',
  styleUrls: ['./ca-organization-page.component.scss']
})
export class CaOrganizationPageComponent implements OnInit {


  organization$: Observable<CaOrganization>;

  constructor(private route: ActivatedRoute,
              private organizationService: CaOrganizationService) {
  }

  ngOnInit(): void {
    this.organization$ = this.route.params.pipe(
      mergeMap(params => this.organizationService.getById(params.id))
    );
  }

}
