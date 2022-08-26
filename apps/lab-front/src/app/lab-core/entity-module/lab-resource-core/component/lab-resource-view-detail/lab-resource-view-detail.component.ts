import {Component, Input, OnInit} from '@angular/core';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {RvViewConfig} from '@monorepo/resource-view';
import {FlTag} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-resource-view-detail',
  templateUrl: './lab-resource-view-detail.component.html',
  styleUrls: ['./lab-resource-view-detail.component.scss']
})
export class LabResourceViewDetailComponent implements OnInit {

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
