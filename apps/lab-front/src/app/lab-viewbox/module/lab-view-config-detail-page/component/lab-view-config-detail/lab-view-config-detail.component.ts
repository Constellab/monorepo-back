import {Component, Input, OnInit} from '@angular/core';
import {LabViewConfig} from '../../../../../lab-core/model/entities/resource/lab-view-config.entity';
import {Observable} from 'rxjs';
import {LabResourceView} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';
import {LabViewConfigService} from '../../../../../lab-core/entity-service/lab-view-config.service';
import {RvViewConfig} from '@monorepo/resource-view';

@Component({
  selector: 'lab-view-config-detail',
  templateUrl: './lab-view-config-detail.component.html',
  styleUrls: ['./lab-view-config-detail.component.scss']
})
export class LabViewConfigDetailComponent implements OnInit {

  @Input() viewConfig: LabViewConfig;

  view$: Observable<LabResourceView>;

  rvViewConfig: RvViewConfig;

  constructor(private viewConfigService: LabViewConfigService) {
  }

  ngOnInit(): void {
    this.view$ = this.viewConfigService.callViewConfig(this.viewConfig.id);

    this.rvViewConfig = {
      methodName: this.viewConfig.viewName,
      configValues: this.viewConfig.configValues,
      transformers: this.viewConfig.transformers
    }
  }

}
