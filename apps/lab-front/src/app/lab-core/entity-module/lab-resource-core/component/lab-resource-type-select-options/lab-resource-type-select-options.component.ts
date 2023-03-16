import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {Observable} from 'rxjs';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {MatSelect} from '@angular/material/select';

/**
 * Component to place under a mat-select to show the list of resource type
 */
@Component({
  selector: 'lab-resource-type-select-options',
  templateUrl: './lab-resource-type-select-options.component.html',
  styleUrls: ['./lab-resource-type-select-options.component.scss']
})
export class LabResourceTypeSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {


  resourceTypes$: Observable<LabTypeEntity[]>;

  constructor(@Host() @Optional() public select: MatSelect,
              private resourceService: LabResourceService) {
    super(select);
  }

  ngOnInit(): void {
    this.resourceTypes$ = this.resourceService.getResourceTypes();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
