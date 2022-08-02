import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  LabResourceViewSpec,
  LabResourceViewSpecWithConfig
} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  LabConfigureResourceViewComponent,
  LabConfigureResourceViewInput,
} from '../lab-configure-resource-view/lab-configure-resource-view.component';
import {LabResourceViewState} from '../../state/lab-resource-view.state';
import {LabResourceViewSpecsByType} from '../../../../model/entities/resource/lab-resource-view-type.class';

/**
 * List of view specs class by type and possibility to select a view specs
 */
@Component({
  selector: 'lab-resource-view-specs',
  templateUrl: './lab-resource-view-specs.component.html',
  styleUrls: ['./lab-resource-view-specs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabResourceViewSpecsComponent implements OnInit {

  @Input() viewsByType: LabResourceViewSpecsByType[];

  constructor(private overlayRef: FlOverlayRef,
              private state: LabResourceViewState,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
  }

  getSelectedClass(viewSpec: LabResourceViewSpec): string {
    if (this.isSpecIsSelected(viewSpec)) {
      return 'g-primary-border';
    } else {
      return 'view-box-unselected';
    }
  }

  // return true if the view is the last view selected (so we can keep the previous config)
  private isSpecIsSelected(view: LabResourceViewSpec): boolean {
    const lastView = this.state.getLastViewSpec();

    // if there is no last view selected or the last is the default view,
    // select the default view
    if (lastView == null || lastView.isDefaultView) {
      return view.defaultView;
    }
    return lastView.viewMethodName === view.methodName;
  }

  selectView(view: LabResourceViewSpec, viewByType: LabResourceViewSpecsByType): void {
    this.openConfigPortal(view, viewByType);
  }

  // prepare the data and open the view configuration portal
  private async openConfigPortal(view: LabResourceViewSpec, viewByType: LabResourceViewSpecsByType): Promise<void> {
    const resource = await this.state.getResourcePromise();

    const specWithConfig: LabResourceViewSpecWithConfig = {
      resourceId: resource.id,
      viewName: view.getName(),
      viewMethodName: view.methodName,
      displayMode: viewByType.viewTypeInfo.defaultDisplayMode,
      viewConfigValues: {},
      transformersWithConfig: [],
      isDefaultView: view.defaultView
    };

    // if this view was previously selected, pre fill the config and transformer with previous values
    const lastView = this.state.getLastViewSpec();
    if (lastView && this.isSpecIsSelected(view)) {
      specWithConfig.viewConfigValues = lastView.viewConfigValues;
      specWithConfig.transformersWithConfig = lastView.transformersWithConfig;
    }

    const data: LabConfigureResourceViewInput = {
      viewSpecConfig: specWithConfig,
      title: view.getName(),
      viewTypeInfo: viewByType.viewTypeInfo,
      resourceTypingName: resource.resourceTypingName,
      resourceId: resource.id
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

    this.closeOverlay();
  }

  private onConfigDialogClosed(config: LabResourceViewSpecWithConfig): void {
    if (config == null) return;
    this.state.callView(config);
  }

  closeOverlay(): void {
    this.overlayRef.dispose();
  }

}
