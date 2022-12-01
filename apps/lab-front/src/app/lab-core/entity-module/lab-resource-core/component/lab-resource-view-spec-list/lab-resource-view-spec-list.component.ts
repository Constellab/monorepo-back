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
  LabConfigureResourceViewInput,
  LabConfigureResourceViewOutput
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

  @Input() set resourceTypingName(resourceTypingName: string) {
    this._resourceTypingName = resourceTypingName;
    if (resourceTypingName) {
      this.viewSpecs$ = this.resourceService.getResourceViewsList(resourceTypingName);
    }
  }

  /**
   * The resourceId is optional
   */
  @Input() resourceId?: string;

  @Input() enableDisplayMode: boolean = true;

  @Output() viewConfigured: EventEmitter<LabResourceViewSpecWithConfig> = new EventEmitter();

  private _resourceTypingName: string;

  viewSpecs$: Observable<LabResourceViewSpec[]>;

  private overlay: FlOverlayRef;

  private lastView: LabResourceViewSpecWithConfig;

  constructor(private resourceService: LabResourceService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
  }

  callDefaultView(): void {
    this.viewConfigured.next({
      viewName: 'Default view',
      viewMethodName: LabResourceService.defaultViewName,
      transformersWithConfig: [],
      viewConfigValues: {},
      displayMode: 'fullScreen'
    });
  }

  // prepare the data and open the view configuration portal
  openConfigPortal(view: LabResourceViewSpec): void {
    const viewTypeInfo: RvResourceViewTypeInfo = labConstResourceViewTypeInfos[view.viewType];

    const specWithConfig: LabResourceViewSpecWithConfig = {
      viewName: view.getName(),
      viewMethodName: view.methodName,
      displayMode: viewTypeInfo.defaultDisplayMode,
      viewConfigValues: {},
      transformersWithConfig: [],
    };

    // if this view was previously selected, pre fill the config and transformer with previous values
    if (this.lastView && this.lastView.viewMethodName === view.methodName) {
      specWithConfig.viewConfigValues = this.lastView.viewConfigValues;
      specWithConfig.transformersWithConfig = this.lastView.transformersWithConfig;
    }

    const data: LabConfigureResourceViewInput = {
      resourceTypingName: this._resourceTypingName,
      resourceId: this.resourceId,
      title: view.getName(),
      viewMethodName: view.methodName,
      // don't show the button mode if the view type support only one mode
      showDisplayModeControl: !viewTypeInfo.forceDefaultDisplayMode && this.enableDisplayMode,
      preConfiguration: specWithConfig,
    };

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        disposeOnNavigation: true,
      });

    this.portalService.createPortal(LabConfigureResourceViewComponent, portalConfig, data).detachments().subscribe(
      config => this.onConfigDialogClosed(config, view.getName())
    );
  }

  private onConfigDialogClosed(config: LabConfigureResourceViewOutput, viewName: string): void {
    if (config == null) return;

    const fullConfig: LabResourceViewSpecWithConfig = {
      displayMode: config.displayMode,
      viewConfigValues: config.viewConfigValues,
      viewMethodName: config.viewMethodName,
      transformersWithConfig: config.transformersWithConfig,
      viewName: viewName
    };

    this.viewConfigured.next(fullConfig);
    this.lastView = fullConfig;
  }

  ngOnDestroy(): void {
    this.overlay?.dispose();
  }


}
