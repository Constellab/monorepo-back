import {AfterViewInit, Component, Host, OnDestroy, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {Observable} from 'rxjs';
import {BioxLabTypeEntity, BioxLabTypeEntityDatasource} from '../../../../model/entities/lab-type/biox-lab-type.entity';

/**
 * Component to place under a mat-select to show the list of resource type
 */
@Component({
  selector: 'gen-biox-resource-type-select-options',
  templateUrl: './biox-resource-type-select-options.component.html',
  styleUrls: ['./biox-resource-type-select-options.component.scss']
})
export class BioxResourceTypeSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  datasource: BioxLabTypeEntityDatasource;

  resourceTypes$: Observable<BioxLabTypeEntity[]>;

  constructor(@Host() @Optional() public select: MatSelect,
              private bioxResourceService: BioxResourceService) {
    super(select);
  }

  ngOnInit(): void {
    this.datasource = this.bioxResourceService.getResourceTypesDatasource();
    this.resourceTypes$ = this.datasource.connect();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource.disconnect();
  }


}
