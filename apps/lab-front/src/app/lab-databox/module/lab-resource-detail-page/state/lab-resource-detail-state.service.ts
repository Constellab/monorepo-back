import {Injectable, OnDestroy} from '@angular/core';
import {ClCachedObservable, ClHelpService} from '@monorepo/core-lib';
import {LabResourceService} from '../../../../lab-core/entity-service/lab-resource.service';
import {BehaviorSubject, firstValueFrom, Observable, Subscription} from 'rxjs';
import {
  labConstResourceViewTypeInfos,
  LabResourceView,
  LabResourceViewDisplayMode,
  LabResourceViewSpecsByType,
  LabResourceViewSpecWithConfig,
  LabResourceViewTypeInfo,
  LabViewCallResult
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
  LabCallTransformerParams,
  LabTransformerWithConfig
} from '../../../../lab-core/model/global/lab-transformer.class';
import {
  LabResourceViewPortalComponent
} from '../../../../lab-core/entity-module/lab-resource-core/component/lab-resource-view-portal/lab-resource-view-portal.component';
import {LabConfigValues} from '../../../../lab-core/model/entities/lab-config.entity';

// Event on view loaded
export interface LabResourceViewEvent {
  status: 'success' | 'error';
  viewEvent?: {
    view: LabResourceView;
    displayMode?: LabResourceViewDisplayMode; // mode to where show the view when success
    viewName: string;
  };
}

@Injectable()
export class LabResourceDetailState implements OnDestroy {

  private readonly actionType: string = 'view-loader';

  private id: string;

  private resource$: BehaviorSubject<LabResource> = new BehaviorSubject<LabResource>(null);
  private viewSpecs$: ClCachedObservable<LabResourceViewSpecsByType[]>;
  private selectedViewSpec$: BehaviorSubject<LabResourceViewSpecWithConfig> = new BehaviorSubject(null);

  private subscription: Subscription;

  constructor(private resourceService: LabResourceService,
              private flActionService: FlPortalActionsService,
              private portalService: FlPortalService,
              private flSnackBarService: FlSnackBarService) {
  }

  public init(id: string): void {
    this.id = id;
    this.resource$.next(null);
    this.resourceService.getById(id).subscribe(
      resource => this.resource$.next(resource),
      error => this.resource$.error(error)
    );

    // load the views once the resource was found
    this.viewSpecs$ = new ClCachedObservable(this.resourceService.getResourceViewsListGrouped(id));

    this.selectedViewSpec$.next(null);

    // Call the default view
    this.loadDefaultView();

    // subscribe to portal view to open them
    this.subscription = this.getView$().pipe(
      filter(viewEvent => viewEvent.status === 'success' && viewEvent.viewEvent.displayMode === 'portal'),
      map(viewEvent => viewEvent.viewEvent)
    ).subscribe(
      viewEvent => this.openViewInPortal(viewEvent.view)
    );
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

  public getSelectedViewSpec$(): Observable<LabResourceViewSpecWithConfig> {
    return this.selectedViewSpec$.asObservable();
  }

  public selectViewSpec(viewSpecConfigured: LabResourceViewSpecWithConfig, isDefaultView: boolean = false): void {
    this.selectedViewSpec$.next(viewSpecConfigured);
    this.loadView(viewSpecConfigured, isDefaultView);
  }

  /////////////////////////////////// VIEW //////////////////////////////////////////

  private loadDefaultView(): void {
    this.flActionService.addAction(
      {
        type: this.actionType,
        text: 'Load default view',
        action: this.resourceService.callResourceDefaultView(this.id),
        additionalInformation: 'fullScreen' as LabResourceViewDisplayMode
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
        text: viewSpecConfigured.viewSpec.getName(),
        action: this.callResourceView(viewSpecConfigured.viewSpec.methodName,
          viewSpecConfigured.viewConfigValues, viewSpecConfigured.transformersWithConfig),
        additionalInformation: viewSpecConfigured.displayMode
      },
      true,
      !isDefaultView); // for the default view, don't show the action portal
  }

  /**
   * Method to call the previous or next page of the view
   * @param pageConfig
   */
  public callPagination(pageConfig: LabConfigValues): Observable<LabResourceView> {
    const configValues: LabConfigValues = ClHelpService.deepClone(this.selectedViewSpec$.value.viewConfigValues);

    // override the view config with page config
    for (const key of Object.keys(pageConfig)) {
      configValues[key] = pageConfig[key];
    }

    return this.callResourceView(this.selectedViewSpec$.value.viewSpec.methodName, configValues,
      this.selectedViewSpec$.value.transformersWithConfig).pipe(
      map(result => result.viewData)
    );
  }

  private callResourceView(methodName: string, configValues: LabConfigValues,
                           transformers: LabTransformerWithConfig[]): Observable<LabViewCallResult> {

    const transformerParams: LabCallTransformerParams[] = transformers.map(transformer => ({
      typing_name: transformer.transformer.typingName,
      config_values: transformer.config
    }));
    return this.resourceService.callResourceView(this.id, methodName, configValues, transformerParams);
  }

  private openViewInPortal(view: LabResourceView): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    this.portalService.createPortal(LabResourceViewPortalComponent, portalConfig, view);
  }

  /**
   * Get the view to display
   */
  public getView$(): Observable<LabResourceViewEvent> {
    return this.flActionService.getResult$(this.actionType).pipe(
      // convert the action result to LabResourceViewEvent
      map((actionResult: FlPortalActionResult<LabViewCallResult>) => {

        if (actionResult.status === 'error') {
          return {
            status: 'error'
          };
        }

        const viewResult: LabViewCallResult = actionResult.result;

        // if the view has a force display mode, use it. Otherwise, use the selected display mode
        const viewTypeInfo: LabResourceViewTypeInfo = labConstResourceViewTypeInfos[viewResult.viewData.type];

        const viewEvent: LabResourceViewEvent = {
          status: 'success',
          viewEvent: {
            view: viewResult.viewData,
            viewName: viewResult.viewHumanName,
            displayMode: actionResult.additionalInformation
          }
        };

        if (viewTypeInfo == null) {
          this.flSnackBarService.openErrorMessage({text: 'biox.view_type_node_supported', translateText: true});
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
    this.selectedViewSpec$?.complete();
    this.subscription?.unsubscribe();
    this.resource$?.complete();
  }
}
