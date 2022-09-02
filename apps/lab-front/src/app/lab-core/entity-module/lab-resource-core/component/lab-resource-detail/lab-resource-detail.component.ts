import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabResourceDetailTabsState} from '../../state/lab-resource-detail-tabs-state.service';
import {LabResourceViewSpecWithConfig} from '../../../../model/entities/resource/lab-resource-view.entity';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabRouterService} from '../../../../service/lab-router.service';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  LabTransformResourcePortalComponent,
  LabTransformResourcePortalInput
} from '../../../lab-transformer-core/component/lab-transform-resource-portal/lab-transform-resource-portal.component';

/**
 * Component to show detail of a resource
 */
@Component({
  selector: 'lab-resource-detail',
  templateUrl: './lab-resource-detail.component.html',
  styleUrls: ['./lab-resource-detail.component.scss']
})
export class LabResourceDetailComponent implements OnInit, OnDestroy {

  @Input() resource: LabResource;

  @Input() readOnly: boolean = false;

  private overlay: FlOverlayRef;

  constructor(private state: LabResourceDetailTabsState,
              private routerService: LabRouterService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
  }

  callView(config: LabResourceViewSpecWithConfig): void {
    this.state.addView(this.resource.id, config);
  }

  onUpdate(resource: LabResource): void {
    this.resource = resource;
  }

  onUpdateTags(tags: LabTag[]): void {
    if (tags != null) {
      this.resource.tags = tags;
    }
  }

  onDelete(): void {
    this.routerService.navigateToDatabox();
  }

  async openTransformerResource(): Promise<void> {
    if (this.overlay) return;


    const config: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
        hasBackdrop: true,
        transparentBackdrop: true,
      });

    const input: LabTransformResourcePortalInput = {
      resourceName: this.resource.name,
      resourceTypingName: this.resource.resourceTypingName,
      resourceId: this.resource.id,
      currentTransformers: []
    };

    this.overlay = this.portalService.createPortal(LabTransformResourcePortalComponent, config, input);
    this.overlay.detachments().subscribe(() => this.overlay = null);
  }

  ngOnDestroy(): void {
    this.overlay?.dispose();
  }


}
