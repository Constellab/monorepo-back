import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatLegacySelect as MatSelect} from '@angular/material/legacy-select';
import {RvResourceViewTypeInfo} from '@monorepo/resource-view';
import {labConstResourceViewTypeInfos} from '../../../../model/entities/resource/lab-resource-view-type.class';
import {LabViewConfigSearch} from '../../model/lab-view-config-search.class';

@Component({
  selector: 'lab-select-view-type-options',
  templateUrl: './lab-select-view-type-options.component.html',
  styleUrls: ['./lab-select-view-type-options.component.scss']
})
export class LabSelectViewTypeOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  viewTypes: Record<string, RvResourceViewTypeInfo>;

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    const viewTypes: Record<string, RvResourceViewTypeInfo> = {};

    // retrieve all the view types but the excluded one for the search
    for (const key of Object.keys(labConstResourceViewTypeInfos)) {
      if (!LabViewConfigSearch.excludedViewTypes.includes(key as any)) {
        viewTypes[key] = labConstResourceViewTypeInfos[key];
      }
    }

    this.viewTypes = viewTypes;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }
}
