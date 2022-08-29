import {Component, Input, OnInit} from '@angular/core';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';
import {FlDatasourcePaginated, FlEntityPaginatedDatasource, FlTableColumn} from '@monorepo/front-core-lib';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabResourceDetailTabsState} from '../../state/lab-resource-detail-tabs-state.service';

/**
 * Show historic of views for a resource
 */
@Component({
  selector: 'lab-resource-view-historic',
  templateUrl: './lab-resource-view-historic.component.html',
  styleUrls: ['./lab-resource-view-historic.component.scss']
})
export class LabResourceViewHistoricComponent implements OnInit {

  @Input() resourceId: string;

  datasource: FlDatasourcePaginated<LabViewConfig>;

  columns: FlTableColumn<LabViewConfig>[] = ['title', 'tags', 'preview', 'flagged'];

  constructor(private viewConfigService: LabViewConfigService,
              private resourceTabState: LabResourceDetailTabsState) {
  }

  ngOnInit(): void {
    this.getByResourceDatasource();
  }

  private getByResourceDatasource(): void {
    this.datasource = new FlEntityPaginatedDatasource(
      (page, pageSize) => this.viewConfigService.getByResource(this.resourceId, page, pageSize),
      10
    );
  }

  onViewConfigSelect(viewConfig: LabViewConfig): void {
    this.resourceTabState.addViewConfigTab(viewConfig.id);
  }

  loadMoreResults(): void {
    this.datasource.getNextPage();
  }

}
