import {Component, OnDestroy, OnInit} from '@angular/core';
import {LabResourceService} from '../../../../../lab-core/entity-service/lab-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {LabResource} from '../../../../../lab-core/model/entities/resource/lab-resource.entity';
import {LabResourceDetailPageState, LabResourceViewEvent} from '../../state/lab-resource-detail-page.state';
import {
  FlDialogService,
  FlOverlayRef,
  FlPortalConfig,
  FlPortalService,
  FlTagDialogService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {LabResourceView} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';
import {
  LabResourceViewSpecsPortalComponent
} from '../lab-resource-view-specs-portal/lab-resource-view-specs-portal.component';
import {LabTagService} from '../../../../../lab-core/entity-service/lab-tag.service';
import {LabTag} from '../../../../../lab-core/model/entities/lab-tag.entity';
import {
  LabTransformResourcePortalComponent,
  LabTransformResourcePortalInput
} from '../../../../../lab-core/entity-module/lab-transformer/component/lab-transform-resource-portal/lab-transform-resource-portal.component';
import {
  LabImportResourceDialogComponent,
  LabImportResourceDialogInput
} from '../../../../../lab-core/entity-module/lab-resource-core/component/lab-import-resource-dialog/lab-import-resource-dialog.component';
import {LabFileResourceService} from '../../../../../lab-core/entity-service/lab-file-resource.service';

@Component({
  selector: 'lab-resource-detail-page',
  templateUrl: './lab-resource-detail-page.component.html',
  styleUrls: ['./lab-resource-detail-page.component.scss'],
  providers: [LabResourceDetailPageState]
})
export class LabResourceDetailPageComponent implements OnInit, OnDestroy {

  resource$: Observable<LabResource>;
  fullScreenView: LabResourceView;
  fullScreenViewName: string;

  showLoader: boolean = true;

  private viewOverlay: FlOverlayRef;
  private transformerOverlay: FlOverlayRef;
  private subscription: Subscription;

  constructor(private resourceService: LabResourceService,
              private route: ActivatedRoute,
              private router: Router,
              private state: LabResourceDetailPageState,
              private portalService: FlPortalService,
              private translateService: FlTranslateService,
              private tagDialogService: FlTagDialogService,
              private tagService: LabTagService,
              private dialogService: FlDialogService,
              private fileService: LabFileResourceService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.id)
    );
  }

  private init(id: string): void {
    this.clearComponent();

    this.state.init(id);
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
    if (this.viewOverlay != null) return;
    const config: FlPortalConfig = this.portalService.configureRelativePortal(
      event.target as any, ['bottom'],
      {
        elevation: true,
        disposeOnNavigation: true,
        viewPortMargin: 0,
        customProviders: [{provide: LabResourceDetailPageState, useValue: this.state}],
        hasBackdrop: true,
        transparentBackdrop: true,
        disposeOnBackdropClick: true,
      });

    this.viewOverlay = this.portalService.createPortal(LabResourceViewSpecsPortalComponent, config);

    this.viewOverlay.detachments().subscribe(() => this.viewOverlay = null);
  }

  async openTransformerResource(event: MouseEvent): Promise<void> {
    if (this.transformerOverlay != null) return;

    const resource = await this.state.getResourcePromise();

    const config: FlPortalConfig = this.portalService.configureRelativePortal(
      event.target as any, ['right'],
      {
        elevation: true,
        disposeOnNavigation: true,
        viewPortMargin: 0,
        hasBackdrop: true,
        transparentBackdrop: true,
      });

    const input: LabTransformResourcePortalInput = {
      resourceName: resource.name,
      resourceTypingName: resource.resourceTypingName,
      resourceId: resource.id
    };

    this.transformerOverlay = this.portalService.createPortal(LabTransformResourcePortalComponent, config, input);
    this.transformerOverlay.detachments().subscribe(() => this.transformerOverlay = null);
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
    this.viewOverlay?.dispose();
    this.transformerOverlay?.dispose();
    this.state.clear();
    this.fullScreenView = null;
  }

  ngOnDestroy(): void {
    this.clearComponent();
  }


}
