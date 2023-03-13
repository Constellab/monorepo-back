import {AfterViewInit, Component, Host, OnDestroy, OnInit} from '@angular/core';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {CaCloudProviderService} from '../../../../service-api/ca-cloud-provider.service';
import {CaCloudProvider, CaCloudProviderDatasource} from '../../../../model/entities/ca-cloud-provider.class';
import {Observable} from 'rxjs';

@Component({
  selector: 'ca-select-cloud-provider-options',
  templateUrl: './ca-select-cloud-provider-options.component.html',
  styleUrls: ['./ca-select-cloud-provider-options.component.scss']
})
export class CaSelectCloudProviderOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  datasource: CaCloudProviderDatasource;
  cloudProviders$: Observable<CaCloudProvider[]>;


  constructor(@Host() private select: MatSelect,
              private cloudProviderService: CaCloudProviderService) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select)
    this.datasource = this.cloudProviderService.findAllDatasource();
    this.cloudProviders$ = this.datasource.connect();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource.disconnect();
  }


}
