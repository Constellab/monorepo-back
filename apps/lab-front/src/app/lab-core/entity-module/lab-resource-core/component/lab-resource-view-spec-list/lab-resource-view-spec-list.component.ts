import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {Observable} from 'rxjs';
import {labConstResourceViewTypeInfos} from '../../../../model/entities/resource/lab-resource-view-type.class';
import {
  LabResourceViewSpec,
  LabResourceViewSpecWithConfig
} from '../../../../model/entities/resource/lab-resource-view.entity';
import {
  LabConfigureResourceViewComponent,
  LabConfigureResourceViewInput
} from '../lab-configure-resource-view/lab-configure-resource-view.component';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {RvResourceViewTypeInfo} from '@monorepo/resource-view';

@Component({
  selector: 'lab-resource-view-spec-list',
  templateUrl: './lab-resource-view-spec-list.component.html',
  styleUrls: ['./lab-resource-view-spec-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabResourceViewSpecListComponent implements OnInit, OnDestroy {

  @Input() resourceId: string;

  @Input() resourceTypingName: string;

  @Output() callView: EventEmitter<LabResourceViewSpecWithConfig> = new EventEmitter();

  viewSpecs$: Observable<LabResourceViewSpec[]>;

  private overlay: FlOverlayRef;

  private lastView: LabResourceViewSpecWithConfig;

  constructor(private resourceService: LabResourceService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.viewSpecs$ = this.resourceService.getResourceViewsList(this.resourceId);
  }

  // prepare the data and open the view configuration portal
  openConfigPortal(view: LabResourceViewSpec): void {
    const viewTypeInfo: RvResourceViewTypeInfo = labConstResourceViewTypeInfos[view.viewType];

    const specWithConfig: LabResourceViewSpecWithConfig = {
      resourceId: this.resourceId,
      viewName: view.getName(),
      viewMethodName: view.methodName,
      displayMode: viewTypeInfo.defaultDisplayMode,
      viewConfigValues: {},
      transformersWithConfig: [],
      isDefaultView: view.defaultView
    };

    // if this view was previously selected, pre fill the config and transformer with previous values
    if (this.lastView && this.lastView.viewMethodName === view.methodName) {
      specWithConfig.viewConfigValues = this.lastView.viewConfigValues;
      specWithConfig.transformersWithConfig = this.lastView.transformersWithConfig;
    }

    const data: LabConfigureResourceViewInput = {
      viewSpecConfig: specWithConfig,
      title: view.getName(),
      viewTypeInfo: viewTypeInfo,
      resourceTypingName: this.resourceTypingName,
      resourceId: this.resourceId
    };

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    this.portalService.createPortal(LabConfigureResourceViewComponent, portalConfig, data).detachments().subscribe(
      config => this.onConfigDialogClosed(config)
    );
  }

  private onConfigDialogClosed(config: LabResourceViewSpecWithConfig): void {
    if (config == null) return;
    this.callView.next(config);
    this.lastView = config;
  }

  ngOnDestroy(): void {
    this.overlay?.dispose();
  }


}
