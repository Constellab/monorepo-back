import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {CaGroupService} from '../../../../service-api/ca-group.service';
import {Observable} from 'rxjs';
import {CaGroup} from '../../../../model/entities/ca-group.entity';

/**
 * Component for mat-select or mat-autocomplete to list the current group of the user
 */
@Component({
  selector: 'ca-group-select-options',
  templateUrl: './ca-group-select-options.component.html',
  styleUrls: ['./ca-group-select-options.component.scss']
})
export class CaGroupSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  groups$: Observable<CaGroup[]>;

  constructor(@Host() private select: MatSelect,
              private groupService: CaGroupService) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.groups$ = this.groupService.getCurrentAllGroups();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
