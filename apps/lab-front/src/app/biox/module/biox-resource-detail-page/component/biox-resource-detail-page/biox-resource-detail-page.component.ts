import {Component, ComponentFactoryResolver, ComponentRef, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {BioxResourceService} from '../../../../../core/entity-service/biox-resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {BioxResource} from '../../../../../core/model/entities/resource/biox-resource.entity';
import {first, tap} from 'rxjs/operators';
import {FileResource} from '../../../../../core/model/entities/resource/file-resource.entity';
import {BioxResourceDetailPageState} from '../../state/biox-resource-detail-page.state';
import {FlOverlayRef, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {BioxResourceView, BioxResourceViewType} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResourceJsonComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-json/biox-resource-json.component';
import {ComponentType} from '@angular/cdk/overlay';
import {BioxResourceViewComponent} from '../../../../../core/entity-module/biox-resource-core/model/biox-resource-view-component.class';
import {BioxResourceTextComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-text/biox-resource-text.component';
import {BioxResourceViewSpecsPortalComponent} from '../biox-resource-view-specs-portal/biox-resource-view-specs-portal.component';
import {BioxResourceSpreadsheetComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-spreadsheet/biox-resource-spreadsheet.component';
import {BioxResourceNetworkComponent} from '../../../../../core/entity-module/biox-resource-core/component/biox-resource-network/biox-resource-network.component';

@Component({
  selector: 'gen-biox-resource-detail-page',
  templateUrl: './biox-resource-detail-page.component.html',
  styleUrls: ['./biox-resource-detail-page.component.scss'],
  providers: [BioxResourceDetailPageState]
})
export class BioxResourceDetailPageComponent implements OnInit, OnDestroy {

  @ViewChild('viewSpecButton', {static: true, read: ElementRef}) viewSpecButton: ElementRef<HTMLElement>;
  @ViewChild('viewContainer', {static: false, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  resource$: Observable<BioxResource>;


  title: string;

  toolbarOverlay: FlOverlayRef;

  viewComponentRef: ComponentRef<BioxResourceViewComponent>;

  constructor(private resourceService: BioxResourceService,
              private route: ActivatedRoute,
              private router: Router,
              private state: BioxResourceDetailPageState,
              private portalService: FlPortalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
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

  private initView(view: BioxResourceView): void {
    // destroy previous if it exists
    this.destroyViewComponentRef();

    if (view == null) {
      this.viewComponentRef = null;
      return;
    }

    // dynamically create the view component
    const componentType = this.getComponentType(view.type);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);

    this.viewComponentRef = this.viewContainer.createComponent(componentFactory);
    this.viewComponentRef.instance.view = view;

  }

  private getComponentType(viewType: BioxResourceViewType): ComponentType<BioxResourceViewComponent> {
    switch (viewType) {
      case 'json-view':
        return BioxResourceJsonComponent;
      case 'text-view':
        return BioxResourceTextComponent;
      case 'table-view':
        return BioxResourceSpreadsheetComponent;
      case 'network-view':
        return BioxResourceNetworkComponent;
      default:
        throw new Error(`View of type ${viewType} not supported`);
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
      this.title = resource.filename;
    } else {
      this.title = resource.id;
    }
  }

  private destroyViewComponentRef(): void {
    this.viewComponentRef?.destroy();
  }

  ngOnDestroy(): void {
    this.destroyViewComponentRef();
  }


}
