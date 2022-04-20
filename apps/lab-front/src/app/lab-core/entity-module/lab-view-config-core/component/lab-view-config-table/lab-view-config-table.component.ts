import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {
  FlOverlayRef,
  FlPaginatedTableAbstractDirective,
  FlPortalConfig,
  FlPortalService
} from '@monorepo/front-core-lib';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {
  LabResourceViewPortalComponent,
  LabResourceViewPortalInput
} from '../../../lab-resource-core/component/lab-resource-view-portal/lab-resource-view-portal.component';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'lab-view-config-table',
  templateUrl: './lab-view-config-table.component.html',
  styleUrls: ['./lab-view-config-table.component.scss']
})
export class LabViewConfigTableComponent extends FlPaginatedTableAbstractDirective<LabViewConfig> implements OnInit, OnDestroy {

  @Output() viewConfigSelected: EventEmitter<LabViewConfig> = new EventEmitter();

  private previewOverlay: FlOverlayRef;

  constructor(private portalService: FlPortalService,
              private resourceService: LabResourceService) {
    super(['viewType', 'createdAt', 'preview']);
  }

  ngOnInit(): void {
  }

  rowClicked(viewConfig: LabViewConfig): void {
    this.viewConfigSelected.next(viewConfig);
  }

  showPreview(viewConfig: LabViewConfig, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.closeOverlay();

    // load the view and show it in a portal
    this.resourceService.callResourceView(viewConfig.resource.id, viewConfig.viewName, viewConfig.configValues,
      viewConfig.transformers).subscribe(
      viewResult => this.openPortal(viewConfig, viewResult.viewData, event.target as any),
    );
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

    this.previewOverlay = this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, config);
  }

  private closeOverlay(): void {
    this.previewOverlay?.dispose();
  }

  ngOnDestroy(): void {
    this.closeOverlay();
  }


}
