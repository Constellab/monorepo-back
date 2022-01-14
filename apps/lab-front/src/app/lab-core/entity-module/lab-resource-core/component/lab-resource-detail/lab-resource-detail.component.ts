import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  LabResourceDetailState,
  LabResourceViewEvent
} from '../../../../../lab-databox/module/lab-resource-detail-page/state/lab-resource-detail-state.service';
import {Observable, Subscription} from 'rxjs';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabResourceView} from '../../../../model/entities/resource/lab-resource-view.entity';
import {
  FlDialogService,
  FlOverlayRef,
  FlPortalConfig,
  FlPortalService,
  FlTagDialogService
} from '@monorepo/front-core-lib';
import {LabTagService} from '../../../../entity-service/lab-tag.service';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {
  LabResourceViewSpecsPortalComponent
} from '../../../../../lab-databox/module/lab-resource-detail-page/component/lab-resource-view-specs-portal/lab-resource-view-specs-portal.component';
import {
  LabTransformResourcePortalComponent,
  LabTransformResourcePortalInput
} from '../../../lab-transformer/component/lab-transform-resource-portal/lab-transform-resource-portal.component';
import {LabTag} from '../../../../model/entities/lab-tag.entity';
import {
  LabImportResourceDialogComponent,
  LabImportResourceDialogInput
} from '../lab-import-resource-dialog/lab-import-resource-dialog.component';

@Component({
  selector: 'lab-resource-detail',
  templateUrl: './lab-resource-detail.component.html',
  styleUrls: ['./lab-resource-detail.component.scss'],
  providers: [LabResourceDetailState]
})
export class LabResourceDetailComponent implements OnInit, OnDestroy {

  @Input() resourceId: string;

  // when true, the transform, import button are deactivate
  @Input() readOnly: boolean = false;

  resource$: Observable<LabResource>;
  fullScreenView: LabResourceView;
  fullScreenViewName: string;

  showLoader: boolean = true;

  private overlayRef: FlOverlayRef;
  private subscription: Subscription;

  constructor(private state: LabResourceDetailState,
              private portalService: FlPortalService,
              private tagDialogService: FlTagDialogService,
              private tagService: LabTagService,
              private dialogService: FlDialogService,
              private fileService: LabFileResourceService) {
  }

  ngOnInit(): void {
    this.state.init(this.resourceId);
    this.resource$ = this.state.getResource$();

    // subscribe to fullscreen view
    this.subscription = this.state.getView$('fullScreen').subscribe(
      view => this.showFullScreenView(view)
    );
  }


  private showFullScreenView(viewEvent: LabResourceViewEvent): void {
    this.showLoader = false;

    this.fullScreenView = viewEvent.view;
    this.fullScreenViewName = viewEvent.viewName;
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


  async openTagFormDialog(): Promise<void> {
    const resource = await this.state.getResourcePromise();

    this.tagDialogService.openUpdateTagDialog({
      tags: resource.tags,
      updateMethod: (tags) => this.tagService.saveTags(resource.typingName, resource.id, tags)
    }).afterClosed().subscribe(
      (newTags: LabTag[]) => {
        if (newTags != null) {
          this.state.setTags(newTags);
        }
      }
    );
  }

  async openImportResource(): Promise<void> {
    const resource = await this.state.getResourcePromise();

    const input: LabImportResourceDialogInput = {
      resourceId: resource.id,
      resourceHumanName: resource.resourceTypeHumanName,
      resourceTypingName: resource.resourceTypingName
    };

    this.dialogService.openMediumDialog(LabImportResourceDialogComponent, {data: input});
  }


  async downloadFile(): Promise<void> {
    const resource = await this.state.getResourcePromise();
    this.fileService.downloadFile(resource.id, resource.name).subscribe();
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
