import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  LabResourceDetailState,
  LabResourceViewEvent
} from '../../../../../lab-databox/module/lab-resource-detail-page/state/lab-resource-detail-state.service';
import {Observable, Subscription} from 'rxjs';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {
  LabResourceView,
  LabResourceViewSpecWithConfig
} from '../../../../model/entities/resource/lab-resource-view.entity';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  LabResourceViewSpecsPortalComponent
} from '../../../../../lab-databox/module/lab-resource-detail-page/component/lab-resource-view-specs-portal/lab-resource-view-specs-portal.component';
import {
  LabTransformResourcePortalComponent,
  LabTransformResourcePortalInput
} from '../../../lab-transformer/component/lab-transform-resource-portal/lab-transform-resource-portal.component';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {LabRouterService} from '../../../../service/lab-router.service';

@Component({
  selector: 'lab-resource-detail',
  templateUrl: './lab-resource-detail.component.html',
  styleUrls: ['./lab-resource-detail.component.scss'],
  providers: [LabResourceDetailState]
})
export class LabResourceDetailComponent implements OnInit, OnDestroy {

  @Input() resourceId: string | Observable<string>;

  // when true, the transform, import button are deactivate
  @Input() readOnly: boolean = false;

  resource$: Observable<LabResource>;
  fullScreenView: LabResourceView;
  fullScreenViewConfig: LabResourceViewSpecWithConfig;

  showLoader: boolean = true;

  private overlayRef: FlOverlayRef;
  private subscription: Subscription;

  constructor(private state: LabResourceDetailState,
              private portalService: FlPortalService,
              private routerService: LabRouterService) {
  }

  ngOnInit(): void {
    if (this.resourceId instanceof Observable) {
      this.resourceId.subscribe(resourceId => this.state.init(resourceId));
    } else {
      this.state.init(this.resourceId);
    }
    this.resource$ = this.state.getResource$();

    // subscribe to fullscreen view
    this.subscription = this.state.getView$().subscribe(
      view => this.showFullScreenView(view)
    );
  }


  private showFullScreenView(viewEvent: LabResourceViewEvent): void {
    this.showLoader = false;

    if (viewEvent.viewEvent && viewEvent.viewEvent.viewConfig.displayMode === 'fullScreen') {
      this.fullScreenView = viewEvent.viewEvent.view;
      this.fullScreenViewConfig = viewEvent.viewEvent.viewConfig;
    }
  }


  openViewSpecs(event: MouseEvent): void {
    this.overlayRef?.dispose();

    const config: FlPortalConfig = this.portalService.configureRelativePortal(
      event.target as any, ['bottom'],
      {
        elevation: true,
        disposeOnNavigation: true,
        viewPortMargin: 0,
        customProviders: [{provide: LabResourceDetailState, useValue: this.state}],
        hasBackdrop: true,
        transparentBackdrop: true,
        disposeOnBackdropClick: true,
      });

    this.overlayRef = this.portalService.createPortal(LabResourceViewSpecsPortalComponent, config);
    this.overlayRef.detachments().subscribe(() => this.overlayRef = null);
  }

  async openTransformerResource(): Promise<void> {
    this.overlayRef?.dispose();

    const resource = await this.state.getResourcePromise();

    const config: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
        hasBackdrop: true,
        transparentBackdrop: true,
      });

    const input: LabTransformResourcePortalInput = {
      resourceName: resource.name,
      resourceTypingName: resource.resourceTypingName,
      resourceId: resource.id
    };

    this.overlayRef = this.portalService.createPortal(LabTransformResourcePortalComponent, config, input);
    this.overlayRef.detachments().subscribe(() => this.overlayRef = null);
  }


  onUpdate(resource: LabResource): void {
    this.state.updateResource(resource);
  }

  onUpdateTags(tags: LabTag[]): void {
    if (tags != null) {
      this.state.setTags(tags);
    }
  }

  onDelete(): void {
    this.routerService.navigateToDatabox();
  }


  private clearComponent(): void {
    this.subscription?.unsubscribe();
    this.overlayRef?.dispose();
    this.state.clear();
    this.fullScreenView = null;
  }

  ngOnDestroy(): void {
    this.clearComponent();
  }

}
