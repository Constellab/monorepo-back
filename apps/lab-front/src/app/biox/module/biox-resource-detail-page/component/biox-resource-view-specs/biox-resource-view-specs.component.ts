import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
  BioxResourceViewConfig,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType,
  BioxResourceViewSpecWithConfig
} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResourceDetailPageState} from '../../state/biox-resource-detail-page.state';
import {FlDialogService, FlOverlayRef} from '@monorepo/front-core-lib';
import {
  BioxConfigureResourceViewComponent,
  BioxConfigureResourceViewInput,
  BioxConfigureResourceViewResult
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
              private dialogService: FlDialogService) {
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

  private isSpecIsSelected(view: BioxResourceViewSpec): boolean {
    return this.selectedView?.viewSpec.methodName === view.methodName;
  }

  selectView(view: BioxResourceViewSpec, viewByType: BioxResourceViewSpecsByType): void {
    if (view.methodSpecs.isEmpty() && view.viewSpecs.isEmpty() && viewByType.viewTypeInfo.forceDefaultDisplayMode) {
      this.selectViewSpec(view, {displayMode: viewByType.viewTypeInfo.defaultDisplayMode, viewConfig: new BioxResourceViewConfig()});
    } else {
      // if this view was previously selected, get the config value from it
      let specWithConfig: BioxResourceViewSpecWithConfig;
      if (this.isSpecIsSelected(view)) {
        specWithConfig = this.selectedView;
      } else {
        specWithConfig = {
          viewSpec: view,
          displayMode: viewByType.viewTypeInfo.defaultDisplayMode,
          viewConfig: new BioxResourceViewConfig()
        };
      }

      const data: BioxConfigureResourceViewInput = {
        viewSpecConfig: specWithConfig,
        title: view.getName(),
        viewTypeInfo: viewByType.viewTypeInfo
      };
      this.dialogService.openMediumDialog(BioxConfigureResourceViewComponent, {data: data}).afterClosed().subscribe(
        config => this.onConfigDialogClosed(view, config)
      );
    }
  }

  private onConfigDialogClosed(view: BioxResourceViewSpec, config: BioxConfigureResourceViewResult): void {
    if (config == null) return;
    this.selectViewSpec(view, config);
  }

  private selectViewSpec(viewSpec: BioxResourceViewSpec, config: BioxConfigureResourceViewResult): void {
    this.state.selectViewSpec(Object.assign(config, {viewSpec: viewSpec}));
    this.closeOverlay();
  }

  closeOverlay(): void {
    this.overlayRef.dispose();
  }

}
