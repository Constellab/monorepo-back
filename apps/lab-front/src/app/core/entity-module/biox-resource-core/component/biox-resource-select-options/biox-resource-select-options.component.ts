import {AfterViewInit, Component, Host, Input, OnDestroy, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective, flGetEmptyPaginatedDatasource} from '@monorepo/front-core-lib';
import {BioxResourceDatasource} from '../../../../model/entities/biox-resource.entity';
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

  datasource: BioxResourceDatasource;

  resources$: Observable<LabBaseEntity[]>;

  constructor(@Host() @Optional() public select: MatSelect,
              private bioxResourceService: BioxResourceService) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);

  }

  private loadResources(type: string): void {
    console.log('New type', type)
    // disconnect if a previous datasource existed
    this.datasource?.disconnect();

    let datasource: BioxResourceDatasource;
    if (type == null) {
      // clear the datasource
      datasource = flGetEmptyPaginatedDatasource();
    } else {
      datasource = this.bioxResourceService.getResourcesByTypeDatasource(type);
    }

    this.datasource = datasource;
    this.resources$ = datasource.connect();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource.disconnect();
  }
}
