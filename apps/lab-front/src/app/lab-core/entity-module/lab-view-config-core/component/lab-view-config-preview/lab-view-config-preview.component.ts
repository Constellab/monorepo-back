import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  LabResourceViewPortalComponent,
  LabResourceViewPortalInput
} from '../../../lab-resource-core/component/lab-resource-view-portal/lab-resource-view-portal.component';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';

/**
 * Button to open the LabViewConfig preview in a portal
 */
@Component({
  selector: 'lab-view-config-preview',
  templateUrl: './lab-view-config-preview.component.html',
  styleUrls: ['./lab-view-config-preview.component.scss']
})
export class LabViewConfigPreviewComponent implements OnInit, OnDestroy {

  @Input() viewConfig: LabViewConfig;

  isLoading: boolean = false;

  private overlay?: FlOverlayRef;

  constructor(private viewConfigService: LabViewConfigService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
  }

  showPreview(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.closeOverlay();

    this.isLoading = true;
    // load the view and show it in a portal
    this.viewConfigService.callViewConfig(this.viewConfig.id).subscribe({
      next: (view) => this.openPortal(this.viewConfig, view, event.target as any),
      error: () => this.isLoading = false
    });
  }

  private openPortal(viewConfig: LabViewConfig, view: LabResourceView, element: HTMLElement): void {
    const portalConfig: FlPortalConfig = this.portalService.configureRelativePortal(
      element, ['left', 'bottom', 'right', 'top'],
      {
        elevation: true,
        disposeOnNavigation: true,
        disposeOnOutsideClick: true
      });

    const config: LabResourceViewPortalInput = {
      view: view,
      config: {
        methodName: viewConfig.viewName,
        configValues: viewConfig.configValues,
        transformers: viewConfig.transformers
      },
      resourceId: viewConfig.resource.id
    };

    this.overlay = this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, config);

    this.isLoading = false;
  }

  private closeOverlay(): void {
    this.overlay?.dispose();
  }

  ngOnDestroy(): void {
    this.closeOverlay();
  }
}
