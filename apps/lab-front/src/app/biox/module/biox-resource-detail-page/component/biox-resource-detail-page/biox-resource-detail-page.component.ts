import {Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxResource} from '../../../../../core/model/entities/resource/biox-resource.entity';
import {first, tap} from 'rxjs/operators';
import {FileResource} from '../../../../../core/model/entities/resource/file-resource.entity';
import {BioxResourceDetailPageState, BioxResourceViewEvent} from '../../state/biox-resource-detail-page.state';
import {FlOverlayRef, FlPortalConfig, FlPortalService, FlTranslateService} from '@monorepo/front-core-lib';
import {BioxResourceView, BioxResourceViewType} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResourceJsonComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-json/biox-resource-json.component';
import {ComponentType} from '@angular/cdk/overlay';
import {BioxResourceViewDirective} from '../../../../../core/entity-module/biox-resource-core/model/biox-resource-view-component.class';
import {BioxResourceTextComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-text/biox-resource-text.component';
import {BioxResourceViewSpecsPortalComponent} from '../biox-resource-view-specs-portal/biox-resource-view-specs-portal.component';
import {BioxResourceSpreadsheetComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-spreadsheet/biox-resource-spreadsheet.component';
import {BioxResourceNetworkComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-network/biox-resource-network.component';
import {BioxResourceChart2dComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-chart-2d/biox-resource-chart-2d.component';
import {BioxResourceHistogramComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-histogram/biox-resource-histogram.component';
import {
  BioxResourcePortalViewInput,
  BioxResourceViewPortalComponent
} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-view-portal/biox-resource-view-portal.component';

@Component({
  selector: 'gen-biox-resource-detail-page',
  templateUrl: './biox-resource-detail-page.component.html',
  styleUrls: ['./biox-resource-detail-page.component.scss'],
  providers: [BioxResourceDetailPageState]
})
export class BioxResourceDetailPageComponent implements OnInit, OnDestroy {

  @ViewChild('viewSpecButton', {static: false, read: ElementRef}) viewSpecButton: ElementRef<HTMLElement>;
  @ViewChild('viewContainer', {static: false, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  resource$: Observable<BioxResource>;

  title: string;

  toolbarOverlay: FlOverlayRef;
  viewComponentRef: ComponentRef<BioxResourceViewDirective>;

  viewIsLoading: boolean = true;
  error: string;

  constructor(private resourceService: BioxResourceService,
              private route: ActivatedRoute,
              private router: Router,
              private state: BioxResourceDetailPageState,
              private portalService: FlPortalService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private translateService: FlTranslateService) {
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

  private initView(viewEvent: BioxResourceViewEvent): void {

    this.viewIsLoading = false;
    this.error = null;

    // if view is null, it mean it is loading
    if (viewEvent.status === 'loading') {
      this.destroyViewComponentRef();
      this.viewIsLoading = true;
      return;
    } else if (viewEvent.status === 'error') {
      this.destroyViewComponentRef();
      this.error = viewEvent.error.logDetail.message;
      return;
    }

    // dynamically create the view component
    const componentType = this.getComponentType(viewEvent.view.type);
    if (componentType == null) {
      this.error = this.translateService.translate('biox.view_type_node_supported');
      return;
    }

    if (viewEvent.displayMode === 'fullScreen') {
      this.destroyViewComponentRef();
      this.openViewInFullScreen(componentType, viewEvent.view);

    } else {
      this.openViewInPortal(componentType, viewEvent.view);
    }
  }

  private openViewInFullScreen(componentType: ComponentType<BioxResourceViewDirective>, view: BioxResourceView): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);

    this.viewComponentRef = this.viewContainer.createComponent(componentFactory);
    this.viewComponentRef.instance.view = view;
  }

  private openViewInPortal(componentType: ComponentType<BioxResourceViewDirective>, view: BioxResourceView): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        panelClass: 'g-portal-background',
        elevation: true,
        disposeOnNavigation: true
      });

    const input: BioxResourcePortalViewInput = {
      viewComponentType: componentType,
      view: view
    };
    this.portalService.createPortal(BioxResourceViewPortalComponent, portalConfig, input);
  }

  private getComponentType(viewType: BioxResourceViewType): ComponentType<BioxResourceViewDirective> {
    switch (viewType) {
      case 'json-view':
        return BioxResourceJsonComponent;
      case 'text-view':
        return BioxResourceTextComponent;
      case 'table-view':
        return BioxResourceSpreadsheetComponent;
      case 'network-view':
        return BioxResourceNetworkComponent;
      case 'scatter-plot-2d':
      case 'line-plot-2d':
        return BioxResourceChart2dComponent;
      case 'histogram':
        return BioxResourceHistogramComponent;
      default:
        console.error(`View of type ${viewType} not supported`);
        return null;
    }
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
    if (resource instanceof FileResource) {
      this.title = resource.name;
    } else {
      this.title = resource.resourceHumanName;
    }
  }

  private destroyViewComponentRef(): void {
    this.viewComponentRef?.destroy();
    this.viewComponentRef = null;
  }

  ngOnDestroy(): void {
    this.destroyViewComponentRef();
  }


}
