import {AfterViewInit, Component, Host, OnDestroy, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {CaBucketRegion, CaBucketRegionDatasource} from '../../../../model/entities/ca-object-storage.class';
import {Observable} from 'rxjs';
import {CaObjectStorageService} from '../../../../service-api/ca-object-storage.service';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'ca-select-bucket-region-options',
  templateUrl: './ca-select-bucket-region-options.component.html',
  styleUrls: ['./ca-select-bucket-region-options.component.scss']
})
export class CaSelectBucketRegionOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  datasource: CaBucketRegionDatasource;
  regions$: Observable<CaBucketRegion[]>;


  constructor(private objectStorageService: CaObjectStorageService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.datasource = this.objectStorageService.getAllRegionsDatasource();
    this.regions$ = this.datasource.connect();
  }


  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource.disconnect();
  }

}
