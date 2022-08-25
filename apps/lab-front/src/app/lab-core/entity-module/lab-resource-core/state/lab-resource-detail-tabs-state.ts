import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable, Subscription} from 'rxjs';
import {LabResource} from '../../../model/entities/resource/lab-resource.entity';
import {ClCachedObservable} from '@monorepo/core-lib';
import {LabResourceService} from '../../../entity-service/lab-resource.service';
import {
  LabResourceView,
  LabResourceViewSpecWithConfig
} from '../../../model/entities/resource/lab-resource-view.entity';
import {LabTag} from '../../../model/entities/lab-tag.entity';
import {filter} from 'rxjs/operators';
import {FlPortalActionResult, FlPortalActionsService, FlPortalConfig, FlPortalService} from '@monorepo/front-core-lib';
import {LabConfigValues} from '../../../model/entities/lab-config.entity';
import {
  labConvertTransformersWithConfigToParams,
  LabTransformerWithConfig
} from '../../../model/global/lab-transformer.class';
import {
  LabResourceViewPortalComponent,
  LabResourceViewPortalInput
} from '../component/lab-resource-view-portal/lab-resource-view-portal.component';
import {RvViewConfig} from '@monorepo/resource-view';


export interface LabResourceTab {
  resourceId: string;
  viewSymbol: symbol;
}

interface LabResourceViewInfo {
  view$: ClCachedObservable<LabResourceView>;
  viewConfig: LabResourceViewSpecWithConfig;
}

/**
 * this state supports multi resources and multi views
 */
@Injectable()
export class LabResourceDetailTabsState implements OnDestroy {

  private readonly actionType: string = 'view-portal-loader';

  // store the different loaded resources (there can be multiple due to ResourceSet)
  private resources: Record<string, BehaviorSubject<LabResource>> = {};
  private views: Record<symbol, LabResourceViewInfo> = {};

  // store the list of tabs to show
  private tabs$: BehaviorSubject<LabResourceTab[]> = new BehaviorSubject([]);

  private viewPortalSubscription: Subscription;

  constructor(private resourceService: LabResourceService,
              private actionService: FlPortalActionsService,
              private portalService: FlPortalService) {
  }


  public init(resourceId: string): void {
    this.resources = {};
    this.views = {};
    this.tabs$.next([]);
    this.subscribeToViewPortal();

    this.loadDefaultView(resourceId);
  }


  ////////////////////////////////////// RESOURCES /////////////////////////////////////

  public getResource$(id: string): Observable<LabResource> {
    return this.resources[id].asObservable().pipe(filter(
      resource => resource != null
    ));
  }

  public getResourcePromise(id: string): Promise<LabResource> {
    return firstValueFrom(this.getResource$(id));
  }

  public updateResource(resource: LabResource): void {
    if (this.resources[resource.id]) {
      this.resources[resource.id].next(resource);
    }
  }

  public updateResourceTags(resourceId: string, tags: LabTag[]): void {
    if (this.resources[resourceId]) {
      this.resources[resourceId].value.tags = tags;
    }
  }

  /**
   * Load the resource and store the subject
   * @param resourceId
   * @private
   */
  private loadResource(resourceId: string): void {
    const subject = new BehaviorSubject<LabResource>(null);
    this.resourceService.getById(resourceId).subscribe({
      next: value => subject.next(value),
      error: error => subject.error(error)
    });
    this.resources[resourceId] = subject;
  }

  ////////////////////////////////////// VIEWS /////////////////////////////////////


  public getView$(viewSymbol: symbol): Observable<LabResourceView> {
    return this.views[viewSymbol].view$.getObs();
  }

  public getViewConfig(viewSymbol: symbol): LabResourceViewSpecWithConfig {
    return this.views[viewSymbol].viewConfig;
  }


  public loadDefaultView(resourceId: string): void {
    const viewConfig: LabResourceViewSpecWithConfig = {
      resourceId: resourceId,
      displayMode: 'fullScreen', viewMethodName: LabResourceService.defaultViewName,
      viewName: 'Default', viewConfigValues: {}, transformersWithConfig: [], isDefaultView: true
    };

    this.loadViewInTabs(viewConfig);
  }

  /**
   * Call the view and open it in a tab or in a portal
   */
  public loadView(viewSpecConfigured: LabResourceViewSpecWithConfig): void {
    if (viewSpecConfigured.displayMode === 'fullScreen') {
      this.loadViewInTabs(viewSpecConfigured);
    } else {
      this.loadViewInPortal(viewSpecConfigured);
    }
  }

  /**
   * Call and open the view in a tab. Load the resource if needed, and load the view
   * @param viewSpecConfigured
   * @private
   */
  private loadViewInTabs(viewSpecConfigured: LabResourceViewSpecWithConfig): void {
    const view$: Observable<LabResourceView> = this.callResourceView(viewSpecConfigured.resourceId,
      viewSpecConfigured.viewMethodName, viewSpecConfigured.viewConfigValues, viewSpecConfigured.transformersWithConfig);

    const viewSymbol: symbol = Symbol(`${viewSpecConfigured.resourceId}-view`);

    // store the view observable with the view config
    this.views[viewSymbol] = {view$: new ClCachedObservable(view$), viewConfig: viewSpecConfigured};

    // store the resource resourceId if not loaded yet
    if (!this.resources[viewSpecConfigured.resourceId]) {
      this.loadResource(viewSpecConfigured.resourceId);
    }

    // create the tab
    this.createTab(viewSpecConfigured.resourceId, viewSymbol);
  }

  /**
   * Call and open the view in a portal, using the action service
   * @param viewSpecConfigured
   * @private
   */
  private loadViewInPortal(viewSpecConfigured: LabResourceViewSpecWithConfig): void {
    this.actionService.addAction(
      {
        type: this.actionType,
        text: viewSpecConfigured.viewName,
        action: this.callResourceView(viewSpecConfigured.resourceId, viewSpecConfigured.viewMethodName,
          viewSpecConfigured.viewConfigValues, viewSpecConfigured.transformersWithConfig),
        additionalInformation: viewSpecConfigured
      },
      true);
  }

  /**
   * subscribe to action service to open views in a portal
   * @private
   */
  private subscribeToViewPortal(): void {
    this.viewPortalSubscription?.unsubscribe();
    // subscribe to portal view to open them
    this.viewPortalSubscription = this.actionService.getResult$(this.actionType).pipe(
      filter(result => result.status === 'success'),
    ).subscribe(
      (result: FlPortalActionResult<LabResourceView>) => this.openViewInPortal(result.result, result.additionalInformation)
    );
  }

  private openViewInPortal(labView: LabResourceView, viewSpecConfigured: LabResourceViewSpecWithConfig): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    const viewConfig: RvViewConfig = {
      methodName: viewSpecConfigured.viewMethodName,
      configValues: viewSpecConfigured.viewConfigValues,
      transformers: labConvertTransformersWithConfigToParams(viewSpecConfigured.transformersWithConfig)
    };

    const config: LabResourceViewPortalInput = {
      labView: labView,
      config: viewConfig,
      resourceId: viewSpecConfigured.resourceId
    };

    this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, config);
  }

  private callResourceView(resourceId: string, methodName: string, configValues: LabConfigValues,
                           transformers: LabTransformerWithConfig[]): Observable<LabResourceView> {
    return this.resourceService.callResourceView(resourceId, methodName, configValues,
      labConvertTransformersWithConfigToParams(transformers), true);
  }


  ////////////////////////////////////// TABS /////////////////////////////////////

  private createTab(resourceId: string, viewSymbol: symbol): void {
    // emit the list of resources with the view
    const resourceWithViews = [...this.tabs$.value];
    resourceWithViews.push({
      resourceId: resourceId,
      viewSymbol: viewSymbol
    });
    this.tabs$.next(resourceWithViews);
  }

  public getTabs$(): Observable<LabResourceTab[]> {
    return this.tabs$.asObservable();
  }

  public closeTab(viewSymbol: symbol): void {
    const resourceWithViews = [...this.tabs$.value];
    const index = resourceWithViews.findIndex(rv => rv.viewSymbol === viewSymbol);
    if (index !== -1) {
      resourceWithViews.splice(index, 1);
      this.tabs$.next(resourceWithViews);
    }
    delete this.views[viewSymbol];
  }

  ngOnDestroy(): void {
    this.tabs$.complete();
    this.viewPortalSubscription?.unsubscribe();
  }


}
