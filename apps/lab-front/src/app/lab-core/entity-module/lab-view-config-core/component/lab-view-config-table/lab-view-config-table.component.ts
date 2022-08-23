import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  FlDropEvent,
  FlOverlayRef,
  FlPaginatedTableAbstractDirective,
  FlPortalConfig,
  FlPortalService,
  FlTag,
  FlTagSelectedEvent
} from '@monorepo/front-core-lib';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {
  LabResourceViewPortalComponent,
  LabResourceViewPortalInput
} from '../../../lab-resource-core/component/lab-resource-view-portal/lab-resource-view-portal.component';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {ClHelpService} from '@monorepo/core-lib';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabDragType} from '../../../../model/global/lab-drag-type.class';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';

@Component({
  selector: 'lab-view-config-table',
  templateUrl: './lab-view-config-table.component.html',
  styleUrls: ['./lab-view-config-table.component.scss']
})
export class LabViewConfigTableComponent extends FlPaginatedTableAbstractDirective<LabViewConfig> implements OnInit, OnDestroy {

  // when true, the row become clickable and resourceSelected event is trigger
  @Input() selectableRow: boolean = false;

  @Input() tagSelectable: boolean = true;

  @Output() tagSelected: EventEmitter<FlTag> = new EventEmitter();

  @Output() viewConfigSelected: EventEmitter<LabViewConfig> = new EventEmitter();

  // enable drop tags
  supportedDropType: LabDragType = LabDragType.TAG;

  private previewOverlay: FlOverlayRef;

  constructor(private portalService: FlPortalService,
              private viewConfigService: LabViewConfigService) {
    super(['viewType', 'createdAt', 'preview', 'resource', 'action', 'tags', 'flagged']);
  }

  ngOnInit(): void {
  }

  rowClicked(viewConfig: LabViewConfig): void {
    if (this.selectableRow) {
      this.viewConfigSelected.next(viewConfig);
    }
  }

  showPreview(viewConfig: LabViewConfig, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.closeOverlay();

    // load the view and show it in a portal
    this.viewConfigService.callViewConfig(viewConfig.id).subscribe(
      view => this.openPortal(viewConfig, view, event.target as any),
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

  onUpdate(viewConfig: LabViewConfig): void {
    this.datasource.updateItem(viewConfig);
  }


  onUpdateTags(viewConfig: LabViewConfig, newTags: LabTag[]): void {
    if (newTags != null) {
      viewConfig.tags = newTags;
    }
  }

  onTagSelected(tagEvent: FlTagSelectedEvent): void {
    ClHelpService.stopEventPropagation(tagEvent.event);
    this.tagSelected.next(tagEvent.tag);
  }

  onDrop(viewConfig: LabViewConfig, event: FlDropEvent<FlTag>): void {
    if (!event.data) return;

    viewConfig.addTag(event.data);
    this.viewConfigService.saveTags(viewConfig.id, viewConfig.tags).subscribe();
  }

  ngOnDestroy(): void {
    this.closeOverlay();
  }


}
