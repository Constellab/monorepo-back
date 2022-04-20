import {Component, Input, OnInit} from '@angular/core';
import {LabResourceService} from '../../../../../lab-core/entity-service/lab-resource.service';
import {
  LabResourceView,
  LabResourceViewConfig
} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';

/**
 * Component used in the Text editor to show a resource view
 */
@Component({
  selector: 'lab-report-content-view',
  templateUrl: './lab-report-content-view.component.html',
  styleUrls: ['./lab-report-content-view.component.scss']
})
export class LabReportContentViewComponent implements OnInit {

  @Input() resourceId: string;
  @Input() viewMethodName: string;
  @Input() viewConfig: string;
  @Input() transformers: string;

  config: LabResourceViewConfig;
  view: LabResourceView;

  constructor(private resourceService: LabResourceService) {
  }

  ngOnInit(): void {
    const config: LabResourceViewConfig = {
      methodName: this.viewMethodName,
      configValues: JSON.parse(this.viewConfig),
      transformers: JSON.parse(this.transformers)
    };

    this.resourceService.callResourceView(this.resourceId, this.viewMethodName,
      config.configValues, config.transformers).subscribe(
      viewResult => this.view = viewResult.viewData
    );

    this.config = config;
  }

}
