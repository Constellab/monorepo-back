import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {LabResource} from '../../../model/entities/resource/lab-resource.entity';
import {ClCachedObservable} from '@monorepo/core-lib';
import {LabResourceService} from '../../../entity-service/lab-resource.service';
import {
  LabResourceView,
  LabResourceViewSpecWithConfig
} from '../../../model/entities/resource/lab-resource-view.entity';
import {filter, map} from 'rxjs/operators';
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
import {LabViewConfigService} from '../../../entity-service/lab-view-config.service';

type LabResourceTabType = 'resource' | 'view';

interface LabResourceTabInternal {
  viewSymbol: symbol;
  type: LabResourceTabType;
  obs: ClCachedObservable<LabResource | LabResourceView>;
}


export type LabResourceTab = {
  viewSymbol: symbol;
  type: 'resource';
  obs: Observable<LabResource>;
} | {
  viewSymbol: symbol;
  type: 'view';
  obs: Observable<LabResourceView>;
}


/**
 * State for the {@link LabResourceDetailTabsComponent}
 * This state supports multi resources and multi views
 */
@Injectable()
export class LabResourceDetailTabsState implements OnDestroy {

  private readonly actionType: string = 'view-portal-loader';

  // store the list of tabs to show
  private tabs$: BehaviorSubject<LabResourceTabInternal[]> = new BehaviorSubject([]);

  private viewPortalSubscription: Subscription;

  constructor(private resourceService: LabResourceService,
              private actionService: FlPortalActionsService,
              private portalService: FlPortalService,
              private viewConfigService: LabViewConfigService) {
  }


  public init(resourceId: string): void {
    this.tabs$.next([]);
    this.subscribeToViewPortal();

    this.addResourceTab(resourceId);
  }


  ////////////////////////////////////// RESOURCES /////////////////////////////////////

  public addResourceTab(resourceId: string): void {
    this.createTab({
      viewSymbol: Symbol(),
      type: 'resource',
      obs: new ClCachedObservable(this.resourceService.getById(resourceId))
    });
  }


  ////////////////////////////////////// VIEWS /////////////////////////////////////

  public addViewConfigTab(viewConfigId: string): void {
    this.createTab({
      viewSymbol: Symbol(),
      type: 'view',
      obs: new ClCachedObservable(this.viewConfigService.callViewConfig(viewConfigId))
    });
  }

  public addView(config: LabResourceViewSpecWithConfig): void {
    if (config.displayMode === 'fullScreen') {
      this.createTab({
        viewSymbol: Symbol(),
        type: 'view',
        obs: new ClCachedObservable(this.callResourceView(config.resourceId,
          config.viewMethodName, config.viewConfigValues, config.transformersWithConfig))
      });
    } else {
      this.loadViewInPortal(config);
    }
  }

  private callResourceView(resourceId: string, methodName: string, configValues: LabConfigValues,
                           transformers: LabTransformerWithConfig[]): Observable<LabResourceView> {
    return this.resourceService.callResourceView(resourceId, methodName, configValues,
      labConvertTransformersWithConfigToParams(transformers), true);
  }

  ////////////////////////////////////// VIEWS PORTAL /////////////////////////////////////

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
      (result: FlPortalActionResult<LabResourceView>) => this.openViewInPortal(result.result)
    );
  }


  private openViewInPortal(labView: LabResourceView): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });


    const config: LabResourceViewPortalInput = {
      labView: labView,
    };

    this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, config);
  }

  ////////////////////////////////////// TABS /////////////////////////////////////

  private createTab(tab: LabResourceTabInternal): void {
    // emit the list of resources with the view
    const resourceWithViews = [...this.tabs$.value];
    resourceWithViews.push(tab);
    this.tabs$.next(resourceWithViews);
  }

  public getTabs$(): Observable<LabResourceTab[]> {
    return this.tabs$.asObservable().pipe(
      map(tabs => this.toExternalLabResourceTab(tabs))
    );
  }

  private toExternalLabResourceTab(tabs: LabResourceTabInternal[]): LabResourceTab[] {
    return tabs.map(tab => ({
      viewSymbol: tab.viewSymbol,
      type: tab.type,
      obs: tab.obs.getObs()
    })) as any;
  }

  public closeTab(viewSymbol: symbol): void {
    const resourceWithViews = [...this.tabs$.value];
    const index = resourceWithViews.findIndex(rv => rv.viewSymbol === viewSymbol);
    if (index !== -1) {
      resourceWithViews.splice(index, 1);
      this.tabs$.next(resourceWithViews);
    }
  }

  ngOnDestroy(): void {
    this.tabs$.complete();
    this.viewPortalSubscription?.unsubscribe();
  }


}
