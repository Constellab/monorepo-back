import {AfterViewInit, Component, Host, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, flGetEmptyPaginatedDatasource} from '@monorepo/front-core-lib';
import {BioxResource, BioxResourceDatasource} from '../../../../model/entities/resource/biox-resource.entity';
import {Observable} from 'rxjs';
import {MatSelect} from '@angular/material/select';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {ClOnChange} from '@monorepo/core-lib';
import {LabBaseEntity} from '../../../../model/global/lab-entity.entity';

/**
 * Component to place under a mat-select to show the list of resource based on a type
 */
@Component({
  selector: 'gen-biox-resource-select-options',
  templateUrl: './biox-resource-select-options.component.html',
  styleUrls: ['./biox-resource-select-options.component.scss']
})
export class BioxResourceSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  @ClOnChange(function (this: BioxResourceSelectOptionsComponent, value: string) {
    this.loadResources(value);
  })
  @Input() ressourceType: string;

  /**
   * If value mode is object the mat-option returns an object otherwise only the id
   */
  @Input() valueMode: 'object' | 'id' = 'object';

  datasource: BioxResourceDatasource;

  resources$: Observable<BioxResource[]>;

  constructor(@Host() @Optional() public select: MatSelect,
              private bioxResourceService: BioxResourceService) {
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

    let datasource: BioxResourceDatasource;
    if (!type) {
      // clear the datasource
      datasource = flGetEmptyPaginatedDatasource();
    } else {
      datasource = this.bioxResourceService.getResourcesByTypeDatasource(type);
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
