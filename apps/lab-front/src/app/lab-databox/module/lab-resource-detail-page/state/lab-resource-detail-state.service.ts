import {Injectable, OnDestroy} from '@angular/core';
import {ClCachedObservable} from '@monorepo/core-lib';
import {LabResourceService} from '../../../../lab-core/entity-service/lab-resource.service';
import {BehaviorSubject, firstValueFrom, Observable, Subscription} from 'rxjs';
import {
  labConstResourceViewTypeInfos,
  LabResourceView,
  LabResourceViewConfig,
  LabResourceViewSpecsByType,
  LabResourceViewSpecWithConfig,
  LabResourceViewTypeInfo
} from '../../../../lab-core/model/entities/resource/lab-resource-view.entity';
import {LabResource} from '../../../../lab-core/model/entities/resource/lab-resource.entity';
import {filter, map} from 'rxjs/operators';
import {
  FlPortalActionResult,
  FlPortalActionsService,
  FlPortalConfig,
  FlPortalService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {LabTag} from '../../../../lab-core/model/entities/lab-tag.entity';
import {
  labConvertTransformersWithConfigToParams,
  LabTransformerWithConfig
} from '../../../../lab-core/model/global/lab-transformer.class';
import {
  LabResourceViewPortalComponent,
  LabResourceViewPortalInput
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-view-portal/lab-resource-view-portal.component';
import {LabConfigValues} from '../../../../lab-core/model/entities/lab-config.entity';
import {RvViewDisplayMode} from '@monorepo/resource-view';

// Event on view loaded
export interface LabResourceViewEvent {
  status: 'success' | 'error';
  viewEvent?: {
    view: LabResourceView;
    viewConfig: LabResourceViewConfig;
    displayMode: RvViewDisplayMode;
  };
}

@Injectable()
export class LabResourceDetailState implements OnDestroy {

  private readonly actionType: string = 'view-loader';

  public id: string;

  private resource$: BehaviorSubject<LabResource> = new BehaviorSubject<LabResource>(null);
  private viewSpecs$: ClCachedObservable<LabResourceViewSpecsByType[]>;

  private lastViewSpec?: LabResourceViewSpecWithConfig = null;

  private subscription: Subscription;

  constructor(private resourceService: LabResourceService,
              private flActionService: FlPortalActionsService,
              private portalService: FlPortalService,
              private flSnackBarService: FlSnackBarService) {
  }

  public init(id: string): void {
    this.id = id;
    this.resource$.next(null);
    this.resourceService.getById(id).subscribe({
      next: resource => this.onResourceLoaded(resource),
      error: error => this.resource$.error(error)
    });

    // load the views once the resource was found
    this.viewSpecs$ = new ClCachedObservable(this.resourceService.getResourceViewsListGrouped(id));

    this.lastViewSpec = null;

    // subscribe to portal view to open them
    this.subscription = this.getView$().pipe(
      filter(viewEvent => viewEvent.status === 'success' && viewEvent.viewEvent.displayMode === 'portal'),
      map(viewEvent => viewEvent.viewEvent)
    ).subscribe(
      viewEvent => this.openViewInPortal(viewEvent.view, viewEvent.viewConfig)
    );
  }

  private onResourceLoaded(resource: LabResource): void {
    this.resource$.next(resource);
    // Call the default view
    this.loadDefaultView();
  }

  public getResource$(): Observable<LabResource> {
    return this.resource$.asObservable().pipe(filter(resource => resource != null));
  }

  public getCurrentResource(): LabResource {
    return this.resource$.value;
  }

  public getResourcePromise(): Promise<LabResource> {
    return firstValueFrom(this.getResource$());
  }

  public updateResource(resource: LabResource): void {
    this.resource$.next(resource);
    // reload the views
    this.viewSpecs$ = new ClCachedObservable(this.resourceService.getResourceViewsListGrouped(resource.id));
  }

  public setTags(tags: LabTag[]): void {
    this.resource$.value.tags = tags;
  }

  /////////////////////////////////// VIEW SPEC //////////////////////////////////////////
  public getViewSpecs$(): Observable<LabResourceViewSpecsByType[]> {
    return this.viewSpecs$.getObs();
  }

  public getLastViewSpec(): LabResourceViewSpecWithConfig {
    return this.lastViewSpec;
  }


  /////////////////////////////////// VIEW //////////////////////////////////////////
  public callView(viewSpecConfigured: LabResourceViewSpecWithConfig): void {
    this.lastViewSpec = viewSpecConfigured;
    this.loadView(viewSpecConfigured, false);
  }

  private loadDefaultView(): void {
    // generate the default view spec
    this.lastViewSpec = {
      displayMode: 'fullScreen', viewMethodName: LabResourceService.defaultViewName,
      viewName: 'Default', viewConfigValues: {}, transformersWithConfig: [], isDefaultView: true
    };

    this.flActionService.addAction(
      {
        type: this.actionType,
        text: 'Load default view',
        action: this.resourceService.callResourceDefaultView(this.id),
        additionalInformation: this.lastViewSpec
      },
      true, false); // for the default view, don't show the action portal
  }

  /**
   * From a configured view spec, it creates an action to call and open the view
   * @param viewSpecConfigured
   * @param isDefaultView
   * @private
   */
  private loadView(viewSpecConfigured: LabResourceViewSpecWithConfig, isDefaultView: boolean = false): void {
    this.flActionService.addAction(
      {
        type: this.actionType,
        text: viewSpecConfigured.viewName,
        action: this.callResourceView(viewSpecConfigured.viewMethodName,
          viewSpecConfigured.viewConfigValues, viewSpecConfigured.transformersWithConfig),
        additionalInformation: viewSpecConfigured
      },
      true,
      !isDefaultView); // for the default view, don't show the action portal
  }

  private callResourceView(methodName: string, configValues: LabConfigValues,
                           transformers: LabTransformerWithConfig[]): Observable<LabResourceView> {
    return this.resourceService.callResourceView(this.id, methodName, configValues,
      labConvertTransformersWithConfigToParams(transformers), true);
  }

  private openViewInPortal(view: LabResourceView, viewConfig: LabResourceViewConfig): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    const config: LabResourceViewPortalInput = {
      view: view,
      config: viewConfig,
      resourceId: this.id
    };

    this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, config);
  }

  /**
   * Get the view to display
   */
  public getView$(): Observable<LabResourceViewEvent> {
    return this.flActionService.getResult$(this.actionType).pipe(
      // convert the action result to LabResourceViewEvent
      map((actionResult: FlPortalActionResult<LabResourceView>) => {

        if (actionResult.status === 'error') {
          return {
            status: 'error'
          };
        }

        const view: LabResourceView = actionResult.result;

        // if the view has a force display mode, use it. Otherwise, use the selected display mode
        const viewTypeInfo: LabResourceViewTypeInfo = labConstResourceViewTypeInfos[view.type];

        const additionalInfo: LabResourceViewSpecWithConfig = actionResult.additionalInformation;
        const viewEvent: LabResourceViewEvent = {
          status: 'success',
          viewEvent: {
            view: view,
            viewConfig: {
              methodName: additionalInfo.viewMethodName,
              configValues: additionalInfo.viewConfigValues,
              transformers: labConvertTransformersWithConfigToParams(additionalInfo.transformersWithConfig),
            },
            displayMode: additionalInfo.displayMode
          }
        };

        if (viewTypeInfo == null) {
          this.flSnackBarService.openErrorMessage({
            text: 'rvResourceView.view_type_node_supported',
            translateText: true
          });
          return viewEvent;
        }

        // if the view has a force default display mode, set it
        if (viewTypeInfo.forceDefaultDisplayMode) {
          viewEvent.viewEvent.displayMode = viewTypeInfo.defaultDisplayMode;
        }

        return viewEvent;
      })
    );
  }

  ngOnDestroy(): void {
    this.clear();
  }

  public clear(): void {
    this.lastViewSpec = null;
    this.subscription?.unsubscribe();
    this.resource$?.complete();
  }
}
