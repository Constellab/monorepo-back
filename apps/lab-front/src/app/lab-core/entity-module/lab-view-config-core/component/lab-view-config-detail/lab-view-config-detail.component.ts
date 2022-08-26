import {Component, Input, OnInit} from '@angular/core';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {RvViewConfig} from '@monorepo/resource-view';
import {FlTag} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-view-config-detail',
  templateUrl: './lab-view-config-detail.component.html',
  styleUrls: ['./lab-view-config-detail.component.scss']
})
export class LabViewConfigDetailComponent implements OnInit {

  @Input() labView: LabResourceView;

  rvViewConfig: RvViewConfig;

  constructor() {
  }

  ngOnInit(): void {
    this.rvViewConfig = {
      methodName: this.labView.viewConfig.viewName,
      configValues: this.labView.viewConfig.configValues,
      transformers: this.labView.viewConfig.transformers
    };
  }

  onUpdate(viewConfig: LabViewConfig): void {
    this.labView.viewConfig = viewConfig;
  }

  onTagUpdate(tags: FlTag[]): void {
    this.labView.viewConfig.tags = tags;
  }

}
