import {Component, OnDestroy, OnInit} from '@angular/core';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {BioxResource} from '../../../../../core/model/entities/resource/biox-resource.entity';
import {BioxResourceDetailPageState, BioxResourceViewEvent} from '../../state/biox-resource-detail-page.state';
import {
  FlDialogService,
  FlOverlayRef,
  FlPortalActionResult,
  FlPortalConfig,
  FlPortalService,
  FlTagDialogService,
  FlTranslateService
} from '@monorepo/front-core-lib';
import {
  BioxResourceView,
  BioxResourceViewDisplayMode,
  BioxResourceViewTypeInfo,
  constBioxResourceViewTypeInfos
} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {
  BioxResourceViewSpecsPortalComponent
} from '../biox-resource-view-specs-portal/biox-resource-view-specs-portal.component';
import {
  BioxResourceViewPortalComponent
} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-view-portal/biox-resource-view-portal.component';
import {
  bioxResourceViewGetComponentType
} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-view/biox-resource-view.component';
import {BioxTagService} from '../../../../../core/entity-service/biox-tag.service';
import {BioxTag} from '../../../../../core/model/entities/biox-tag.entity';
import {
  BioxTransformResourcePortalComponent,
  BioxTransformResourcePortalInput
} from '../../../../../core/entity-module/biox-transformer/component/biox-transform-resource-portal/biox-transform-resource-portal.component';
import {
  BioxImportResourceDialogComponent,
  BioxImportResourceDialogInput
} from '../../../../../core/entity-module/biox-resource-core/component/biox-import-resource-dialog/biox-import-resource-dialog.component';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';

@Component({
  selector: 'gen-biox-resource-detail-page',
  templateUrl: './biox-resource-detail-page.component.html',
  styleUrls: ['./biox-resource-detail-page.component.scss'],
  providers: [BioxResourceDetailPageState]
})
export class BioxResourceDetailPageComponent implements OnInit, OnDestroy {

  resource$: Observable<BioxResource>;
  fullScreenView: BioxResourceView;
  fullScreenViewName: string;

  showLoader: boolean = true;
  errorText: string;

  private viewOverlay: FlOverlayRef;
  private transformerOverlay: FlOverlayRef;
  private subscription: Subscription;

  constructor(private resourceService: BioxResourceService,
              private route: ActivatedRoute,
              private router: Router,
              private state: BioxResourceDetailPageState,
              private portalService: FlPortalService,
              private translateService: FlTranslateService,
              private tagDialogService: FlTagDialogService,
              private tagService: BioxTagService,
              private dialogService: FlDialogService,
              private fileService: FileResourceService) {
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

    this.subscription = this.state.getView$().subscribe(
      view => this.initView(view)
    );
  }


  private initView(result: FlPortalActionResult<BioxResourceViewEvent>): void {
    this.showLoader = false;
    this.errorText = null;

    if (result.status === 'error') {
      return;
    }

    const viewEvent: BioxResourceViewEvent = result.result;

    // dynamically create the view component
    const componentType = bioxResourceViewGetComponentType(viewEvent.view.type);
    const viewTypeInfo: BioxResourceViewTypeInfo = constBioxResourceViewTypeInfos[viewEvent.view.type];
    if (componentType == null || viewTypeInfo == null) {
      this.errorText = this.translateService.translate('biox.view_type_node_supported');
      if (viewEvent.displayMode === 'fullScreen') this.fullScreenView = null;
      return;
    }

    // if the view as a force display mode, use it. Otherwise use the selected display mode
    const displayMode: BioxResourceViewDisplayMode = viewTypeInfo.forceDefaultDisplayMode ?
      viewTypeInfo.defaultDisplayMode : viewEvent.displayMode;


    if (displayMode === 'fullScreen') {
      this.fullScreenView = viewEvent.view;
      this.fullScreenViewName = viewEvent.viewName;
    } else {
      this.openViewInPortal(viewEvent.view);
    }
  }

  private openViewInPortal(view: BioxResourceView): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
        customProviders: [{provide: BioxResourceDetailPageState, useValue: this.state}]
      });

    this.portalService.createPortal(BioxResourceViewPortalComponent, portalConfig, view);
  }

  openViewSpecs(event: MouseEvent): void {
    if (this.viewOverlay != null) return;
    const config: FlPortalConfig = this.portalService.configureRelativePortal(
      event.target as any, ['bottom'],
      {
        elevation: true,
        disposeOnNavigation: true,
        viewPortMargin: 0,
        customProviders: [{provide: BioxResourceDetailPageState, useValue: this.state}],
        hasBackdrop: true,
        transparentBackdrop: true,
        disposeOnBackdropClick: true,
      });

    this.viewOverlay = this.portalService.createPortal(BioxResourceViewSpecsPortalComponent, config);

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

    const input: BioxTransformResourcePortalInput = {
      resourceName: resource.name,
      resourceTypingName: resource.resourceTypingName,
      resourceId: resource.id
    };

    this.transformerOverlay = this.portalService.createPortal(BioxTransformResourcePortalComponent, config, input);
    this.transformerOverlay.detachments().subscribe(() => this.transformerOverlay = null);
  }


  async openTagFormDialog(): Promise<void> {
    const resource = await this.state.getResourcePromise();

    this.tagDialogService.openUpdateTagDialog({
      tags: resource.tags,
      updateMethod: (tags) => this.tagService.saveTags(resource.typingName, resource.id, tags)
    }).afterClosed().subscribe(
      (newTags: BioxTag[]) => {
        if (newTags != null) {
          this.state.setTags(newTags);
        }
      }
    );
  }

  async openImportResource(): Promise<void> {
    const resource = await this.state.getResourcePromise();

    const input: BioxImportResourceDialogInput = {
      resourceId: resource.id,
      resourceHumanName: resource.resourceTypeHumanName,
      resourceTypingName: resource.resourceTypingName
    };

    this.dialogService.openMediumDialog(BioxImportResourceDialogComponent, {data: input});
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
