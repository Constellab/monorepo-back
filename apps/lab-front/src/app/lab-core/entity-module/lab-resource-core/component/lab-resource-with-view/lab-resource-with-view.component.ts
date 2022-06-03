import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {Observable} from 'rxjs';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {RvViewConfig} from '@monorepo/resource-view';
import {labConvertTransformersWithConfigToParams} from '../../../../model/global/lab-transformer.class';
import {LabRouterService} from '../../../../service/lab-router.service';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {
  LabTransformResourcePortalComponent,
  LabTransformResourcePortalInput
} from '../../../lab-transformer/component/lab-transform-resource-portal/lab-transform-resource-portal.component';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {
  LabResourceViewSpecsPortalComponent
} from '../lab-resource-view-specs-portal/lab-resource-view-specs-portal.component';
import {LabResourceViewState} from '../../state/lab-resource-view.state';

/**
 * Component representing on tab inside ResourceDetailTabs to show resource with one view
 */
@Component({
  selector: 'lab-resource-with-view',
  templateUrl: './lab-resource-with-view.component.html',
  styleUrls: ['./lab-resource-with-view.component.scss'],
  providers: [LabResourceViewState]
})
export class LabResourceWithViewComponent implements OnInit, OnDestroy {

  @Input() resourceId: string;

  @Input() viewSymbol: symbol;

  // when true, the transform, import button are deactivate
  @Input() readOnly: boolean = false;

  resource$: Observable<LabResource>;
  view$: Observable<LabResourceView>;

  viewConfig: RvViewConfig;

  // if true it mean that the view is used transformers, so the resource edition button are disable
  isTransformedView: boolean;

  private overlayRef: FlOverlayRef;


  constructor(private state: LabResourceViewState,
              private routerService: LabRouterService,
              private portalService: FlPortalService) {
  }

  ngOnInit(): void {
    this.state.init(this.resourceId, this.viewSymbol);
    this.resource$ = this.state.getResource$();
    this.view$ = this.state.getView$();


    const viewWithConfig = this.state.getViewConfig();
    this.isTransformedView = viewWithConfig.transformersWithConfig?.length > 0 ?? false;

    this.viewConfig = {
      methodName: viewWithConfig.viewMethodName,
      configValues: viewWithConfig.viewConfigValues,
      transformers: labConvertTransformersWithConfigToParams(viewWithConfig.transformersWithConfig)
    };
  }

  async openTransformerResource(): Promise<void> {
    const resource = await this.state.getResourcePromise();
    this.overlayRef?.dispose();


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
      resourceId: resource.id,
      // retrieve the current transformer of the view to init the transformer form
      currentTransformers: this.state.getViewConfig()?.transformersWithConfig ?? []
    };

    this.overlayRef = this.portalService.createPortal(LabTransformResourcePortalComponent, config, input);
    this.overlayRef.detachments().subscribe(() => this.overlayRef = null);
  }

  openViewSpecs(event: MouseEvent): void {
    this.overlayRef?.dispose();

    const config: FlPortalConfig = this.portalService.configureRelativePortal(
      event.target as any, ['bottom'],
      {
        elevation: true,
        disposeOnNavigation: true,
        viewPortMargin: 0,
        customProviders: [{provide: LabResourceViewState, useValue: this.state}],
        hasBackdrop: true,
        transparentBackdrop: true,
        disposeOnBackdropClick: true,
      });

    this.overlayRef = this.portalService.createPortal(LabResourceViewSpecsPortalComponent, config);
    this.overlayRef.detachments().subscribe(() => this.overlayRef = null);
  }

  onUpdate(resource: LabResource): void {
    this.state.updateResource(resource);
  }

  onUpdateTags(tags: LabTag[]): void {
    if (tags != null) {
      this.state.setResourceTags(tags);
    }
  }

  onDelete(): void {
    this.routerService.navigateToDatabox();
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }


}
