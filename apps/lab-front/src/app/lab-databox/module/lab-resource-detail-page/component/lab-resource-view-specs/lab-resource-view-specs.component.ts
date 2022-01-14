import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  LabResourceViewSpec,
  LabResourceViewSpecsByType,
  LabResourceViewSpecWithConfig
} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';
import {LabResourceDetailState} from '../../state/lab-resource-detail-state.service';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  LabConfigureResourceViewComponent,
  LabConfigureResourceViewInput,
} from '../lab-configure-resource-view/lab-configure-resource-view.component';

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
  selectedView: LabResourceViewSpecWithConfig;

  constructor(private overlayRef: FlOverlayRef,
              private state: LabResourceDetailState,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.state.getSelectedViewSpec$().subscribe(
      view => this.selectedView = view
    );
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
    return this.selectedView?.viewSpec.methodName === view.methodName;
  }

  selectView(view: LabResourceViewSpec, viewByType: LabResourceViewSpecsByType): void {
    this.openConfigPortal(view, viewByType);
  }

  // prepare the data and open the view configuration portal
  private openConfigPortal(view: LabResourceViewSpec, viewByType: LabResourceViewSpecsByType): void {
    const resource = this.state.getCurrentResource();

    // if this view was previously selected, get the config value from it
    let specWithConfig: LabResourceViewSpecWithConfig;
    if (this.isSpecIsSelected(view)) {
      specWithConfig = this.selectedView;
    } else {
      specWithConfig = {
        viewSpec: view,
        displayMode: viewByType.viewTypeInfo.defaultDisplayMode,
        viewConfigValues: {},
        transformersWithConfig: []
      };
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
    this.state.selectViewSpec(config);
  }

  closeOverlay(): void {
    this.overlayRef.dispose();
  }

}
