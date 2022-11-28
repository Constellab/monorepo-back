import {AfterViewInit, Component, Host, OnDestroy, OnInit} from '@angular/core';
import {FlDatasourcePaginated, FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {CaSpace} from '../../../../model/entities/ca-space.class';
import {CaSpaceService} from '../../../../service-api/ca-space.service';
import {MatSelect} from '@angular/material/select';

/**
 * Component to be placed in a mat-select to add option of all space
 */
@Component({
  selector: 'ca-select-space-options',
  templateUrl: './ca-select-space-options.component.html',
  styleUrls: ['./ca-select-space-options.component.scss']
})
export class CaSelectSpaceOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  constructor(private spaceService: CaSpaceService,
              @Host() private select: MatSelect) {
    super(select);
  }

  datasource: FlDatasourcePaginated<CaSpace>;

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.datasource = this.spaceService.getAllDatasource();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource?.disconnect();
  }
}
