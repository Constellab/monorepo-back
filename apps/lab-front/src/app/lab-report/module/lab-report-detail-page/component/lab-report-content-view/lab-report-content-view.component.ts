import {Component, ElementRef, HostBinding, Input, OnInit} from '@angular/core';
import {LabResourceService} from '../../../../../lab-core/entity-service/lab-resource.service';
import {
  LabResourceViewConfig,
  LabResourceViewData
} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';
import {FlTextEditorElementDirective, FlTextEditorsManagerState} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

/**
 * Component used in the Text editor to show a resource view
 */
@Component({
  selector: 'lab-report-content-view',
  templateUrl: './lab-report-content-view.component.html',
  styleUrls: ['./lab-report-content-view.component.scss']
})
export class LabReportContentViewComponent extends FlTextEditorElementDirective implements OnInit {

  @Input() resourceId: string;

  @Input() viewConfig: LabResourceViewConfig;

  @HostBinding('attr.view-title')
  @Input() viewTitle: string;

  @HostBinding('attr.caption')
  @Input() caption: string;

  view$: Observable<LabResourceViewData>;

  disabled$: Observable<boolean>;


  constructor(private resourceService: LabResourceService,
              elementRef: ElementRef<HTMLElement>,
              managersState: FlTextEditorsManagerState) {
    super(elementRef, managersState);
  }

  ngOnInit(): void {
    this.view$ = this.resourceService.callResourceViewData(this.resourceId, this.viewConfig.methodName,
      this.viewConfig.configValues, this.viewConfig.transformers);

    this.disabled$ = this.getDisabled$();
  }


}
