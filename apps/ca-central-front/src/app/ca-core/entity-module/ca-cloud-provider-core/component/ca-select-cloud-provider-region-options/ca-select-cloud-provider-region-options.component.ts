import {AfterViewInit, Component, Host, OnDestroy, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';
import {CaCloudProviderService} from '../../../../service-api/ca-cloud-provider.service';
import {
  CaCloudProviderRegion,
  CaCloudProviderRegionDatasource
} from '../../../../model/entities/ca-cloud-provider.class';

@Component({
  selector: 'ca-select-cloud-provider-region-options',
  templateUrl: './ca-select-cloud-provider-region-options.component.html',
  styleUrls: ['./ca-select-cloud-provider-region-options.component.scss']
})
export class CaSelectCloudProviderRegionOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  datasource: CaCloudProviderRegionDatasource;
  regions$: Observable<CaCloudProviderRegion[]>;


  constructor(private cloudProviderService: CaCloudProviderService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.datasource = this.cloudProviderService.getAllRegionsDatasource();
    this.regions$ = this.datasource.connect();
  }


  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource.disconnect();
  }

}
