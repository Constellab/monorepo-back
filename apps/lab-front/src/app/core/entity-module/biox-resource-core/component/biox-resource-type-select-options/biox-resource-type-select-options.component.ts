import {AfterViewInit, Component, Host, OnInit, Optional} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {Observable} from 'rxjs';
import {BioxLabTypeEntity} from '../../../../model/entities/lab-type/biox-lab-type.entity';

/**
 * Component to place under a mat-select to show the list of resource type
 */
@Component({
  selector: 'gen-biox-resource-type-select-options',
  templateUrl: './biox-resource-type-select-options.component.html',
  styleUrls: ['./biox-resource-type-select-options.component.scss']
})
export class BioxResourceTypeSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {


  resourceTypes$: Observable<BioxLabTypeEntity[]>;

  constructor(@Host() @Optional() public select: MatSelect,
              private bioxResourceService: BioxResourceService) {
    super(select);
  }

  ngOnInit(): void {
    this.resourceTypes$ = this.bioxResourceService.getResourceTypes();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
