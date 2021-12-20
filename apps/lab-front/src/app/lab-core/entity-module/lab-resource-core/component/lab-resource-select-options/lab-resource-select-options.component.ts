import {AfterViewInit, Component, Host, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, flGetEmptyPaginatedDatasource} from '@monorepo/front-core-lib';
import {LabResource, LabResourceDatasource} from '../../../../model/entities/resource/lab-resource.entity';
import {Observable} from 'rxjs';
import {MatSelect} from '@angular/material/select';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {ClOnChange} from '@monorepo/core-lib';
import {LabBaseEntity} from '../../../../model/global/lab-entity.entity';

/**
 * Component to place under a mat-select to show the list of resource based on a type
 */
@Component({
  selector: 'lab-resource-select-options',
  templateUrl: './lab-resource-select-options.component.html',
  styleUrls: ['./lab-resource-select-options.component.scss']
})
export class LabResourceSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  @ClOnChange(function (this: LabResourceSelectOptionsComponent, value: string) {
    this.loadResources(value);
  })
  @Input() ressourceType: string;

  /**
   * If value mode is object the mat-option returns an object otherwise only the id
   */
  @Input() valueMode: 'object' | 'id' = 'object';

  datasource: LabResourceDatasource;

  resources$: Observable<LabResource[]>;

  constructor(@Host() @Optional() public select: MatSelect,
              private resourceService: LabResourceService) {
    super(select);
  }

  ngOnInit(): void {
    if (this.valueMode === 'object') {
      this.overrideCompareWithOnIds(this.select);
    }

  }

  private loadResources(type: string): void {
    // disconnect if a previous datasource existed
    this.datasource?.disconnect();

    let datasource: LabResourceDatasource;
    if (!type) {
      // clear the datasource
      datasource = flGetEmptyPaginatedDatasource();
    } else {
      datasource = this.resourceService.getResourcesByTypeDatasource(type);
    }

    this.datasource = datasource;
    this.resources$ = datasource.connect();
  }

  getValue(resource: LabBaseEntity): LabBaseEntity | string {
    return this.valueMode === 'object' ? resource : resource.id;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource.disconnect();
  }
}
