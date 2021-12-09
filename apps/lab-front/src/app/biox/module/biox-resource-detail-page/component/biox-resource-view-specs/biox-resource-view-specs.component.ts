import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  BioxResourceViewConfig,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType,
  BioxResourceViewSpecWithConfig
} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResourceDetailPageState} from '../../state/biox-resource-detail-page.state';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  BioxConfigureResourceViewComponent,
  BioxConfigureResourceViewInput,
} from '../biox-configure-resource-view/biox-configure-resource-view.component';

/**
 * List of view specs class by type and possibility to select a view specs
 */
@Component({
  selector: 'gen-biox-resource-view-specs',
  templateUrl: './biox-resource-view-specs.component.html',
  styleUrls: ['./biox-resource-view-specs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxResourceViewSpecsComponent implements OnInit {

  @Input() viewsByType: BioxResourceViewSpecsByType[];
  selectedView: BioxResourceViewSpecWithConfig;

  constructor(private overlayRef: FlOverlayRef,
              private state: BioxResourceDetailPageState,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.state.getSelectedViewSpec$().subscribe(
      view => this.selectedView = view
    );
  }

  getSelectedClass(viewSpec: BioxResourceViewSpec): string {
    if (this.isSpecIsSelected(viewSpec)) {
      return 'g-primary-border';
    } else {
      return 'view-box-unselected';
    }
  }

  // return true if the view is the last view selected (so we can keep the previous config)
  private isSpecIsSelected(view: BioxResourceViewSpec): boolean {
    return this.selectedView?.viewSpec.methodName === view.methodName;
  }

  selectView(view: BioxResourceViewSpec, viewByType: BioxResourceViewSpecsByType): void {
    this.openConfigPortal(view, viewByType);

  }

  // prepare the data and open the view configuration portal
  private openConfigPortal(view: BioxResourceViewSpec, viewByType: BioxResourceViewSpecsByType): void {
    const resource = this.state.getCurrentResource();

    // if this view was previously selected, get the config value from it
    let specWithConfig: BioxResourceViewSpecWithConfig;
    if (this.isSpecIsSelected(view)) {
      specWithConfig = this.selectedView;
    } else {
      specWithConfig = {
        viewSpec: view,
        displayMode: viewByType.viewTypeInfo.defaultDisplayMode,
        viewConfig: new BioxResourceViewConfig(),
        transformersWithConfig: []
      };
    }

    const data: BioxConfigureResourceViewInput = {
      viewSpecConfig: specWithConfig,
      title: view.getName(),
      viewTypeInfo: viewByType.viewTypeInfo,
      resourceTypingName: resource.resourceTypingName
    };

    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    this.portalService.createPortal(BioxConfigureResourceViewComponent, portalConfig, data).detachments().subscribe(
      config => this.onConfigDialogClosed(config)
    );

    this.closeOverlay();
  }

  private onConfigDialogClosed(config: BioxResourceViewSpecWithConfig): void {
    if (config == null) return;
    this.state.selectViewSpec(config);
  }

  closeOverlay(): void {
    this.overlayRef.dispose();
  }

}
