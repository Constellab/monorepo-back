import {Component, ElementRef, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxResource} from '../../../../../core/model/entities/resource/biox-resource.entity';
import {first, tap} from 'rxjs/operators';
import {BioxResourceDetailPageState, BioxResourceViewEvent} from '../../state/biox-resource-detail-page.state';
import {
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
import {BioxResourceViewSpecsPortalComponent} from '../biox-resource-view-specs-portal/biox-resource-view-specs-portal.component';
import {BioxResourceViewPortalComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-view-portal/biox-resource-view-portal.component';
import {bioxResourceViewGetComponentType} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-view/biox-resource-view.component';
import {BioxTagService} from '../../../../../core/entity-service/biox-tag.service';
import {BioxTag} from '../../../../../core/model/entities/biox-tag.entity';

@Component({
  selector: 'gen-biox-resource-detail-page',
  templateUrl: './biox-resource-detail-page.component.html',
  styleUrls: ['./biox-resource-detail-page.component.scss'],
  providers: [BioxResourceDetailPageState]
})
export class BioxResourceDetailPageComponent implements OnInit {

  @ViewChild('viewSpecButton', {static: false, read: ElementRef}) viewSpecButton: ElementRef<HTMLElement>;
  @ViewChild('viewContainer', {static: false, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  resource$: Observable<BioxResource>;
  fullScreenView: BioxResourceView;

  title: string;

  toolbarOverlay: FlOverlayRef;


  showLoader: boolean = true;
  errorText: string;

  constructor(private resourceService: BioxResourceService,
              private route: ActivatedRoute,
              private router: Router,
              private state: BioxResourceDetailPageState,
              private portalService: FlPortalService,
              private translateService: FlTranslateService,
              private tagDialogService: FlTagDialogService,
              private tagService: BioxTagService) {
  }

  ngOnInit(): void {
    this.route.params.pipe(first()).subscribe(
      params => this.init(params.type, params.id)
    );
  }

  private init(type: string, id: string): void {
    this.state.init(type, id);
    this.resource$ = this.state.getResource$().pipe(
      tap(resource => this.initTitle(resource))
    );

    this.state.getView$().subscribe(
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
    } else {
      this.openViewInPortal(viewEvent.view);
    }
  }

  private openViewInPortal(view: BioxResourceView): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        panelClass: 'g-portal-background',
        elevation: true,
        disposeOnNavigation: true,
        customProviders: [{provide: BioxResourceDetailPageState, useValue: this.state}]
      });

    this.portalService.createPortal(BioxResourceViewPortalComponent, portalConfig, view);
  }

  openViewSpecs(): void {
    if (this.toolbarOverlay != null) return;
    const config: FlPortalConfig = this.portalService.configureRelativePortal(
      this.viewSpecButton.nativeElement, ['bottom'],
      {
        elevation: true,
        disposeOnNavigation: true,
        viewPortMargin: 0,
        customProviders: [{provide: BioxResourceDetailPageState, useValue: this.state}],
        hasBackdrop: true,
        transparentBackdrop: true,
        disposeOnBackdropClick: true,
      });

    this.toolbarOverlay = this.portalService.createPortal(BioxResourceViewSpecsPortalComponent, config);

    this.toolbarOverlay.detachments().subscribe(() => this.toolbarOverlay = null);
  }

  private initTitle(resource: BioxResource): void {
    this.title = resource.name;
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
}
