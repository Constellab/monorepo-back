import {Injectable, OnDestroy} from '@angular/core';
import {ClCachedObservable} from '@monorepo/core-lib';
import {BioxResourceService} from '../../../../core/entity-service/biox-resource.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {
  BioxResourceView,
  BioxResourceViewConfig,
  BioxResourceViewDisplayMode,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType,
  BioxResourceViewSpecWithConfig,
  BioxResourceViewTypeInfo,
  constBioxResourceViewTypeInfos
} from '../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResource} from '../../../../core/model/entities/resource/biox-resource.entity';
import {filter, map, mergeMap} from 'rxjs/operators';
import {
  FlPortalActionResult,
  FlPortalActionsService,
  FlPortalConfig,
  FlPortalService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {BioxTag} from '../../../../core/model/entities/biox-tag.entity';
import {BioxTransformerWithConfig, CallTransformerParams} from '../../../../core/model/global/biox-transformer.class';
import {
  BioxResourceViewPortalComponent
} from '../../../../core/entity-module/biox-resource-core/component/biox-resource-view-portal/biox-resource-view-portal.component';

// Event on view loaded
export interface BioxResourceViewEvent {
  view: BioxResourceView;
  displayMode?: BioxResourceViewDisplayMode; // mode to where show the view when success
  viewName: string;
}

@Injectable()
export class BioxResourceDetailPageState implements OnDestroy {

  private readonly actionType: string = 'view-loader';

  private id: string;

  private resource$: ClCachedObservable<BioxResource>;
  private viewSpecs$: ClCachedObservable<BioxResourceViewSpecsByType[]>;
  private selectedViewSpec$: BehaviorSubject<BioxResourceViewSpecWithConfig>;

  private subscription: Subscription;

  constructor(private resourceService: BioxResourceService,
              private flActionService: FlPortalActionsService,
              private portalService: FlPortalService,
              private flSnackBarService: FlSnackBarService) {
  }

  public init(id: string): void {
    this.id = id;
    this.resource$ = new ClCachedObservable(this.resourceService.getById(id));

    // load the views once the resource was found
    this.viewSpecs$ = new ClCachedObservable(
      this.resource$.getObs().pipe(
        mergeMap(resource => this.resourceService.getResourceViewsByType(resource.resourceTypingName))
      )
    );

    // load the views
    this.viewSpecs$.getObs().subscribe(
      views => this.onViewSpecsLoaded(views)
    );
    this.selectedViewSpec$ = new BehaviorSubject(null);

    // subscribe to portal view to open them
    this.subscription = this.getView$('portal').subscribe(
      viewEvent => this.openViewInPortal(viewEvent.view)
    );
  }

  public getResource$(): Observable<BioxResource> {
    return this.resource$.getObs();
  }

  public getCurrentResource(): BioxResource {
    return this.resource$.value;
  }

  public getResourcePromise(): Promise<BioxResource> {
    return this.resource$.toPromise();
  }

  public setTags(tags: BioxTag[]): void {
    this.resource$.value.tags = tags;
  }

  /////////////////////////////////// VIEW SPEC //////////////////////////////////////////

  // when views are loaded, set default view
  private onViewSpecsLoaded(views: BioxResourceViewSpecsByType[]): void {
    // find the default view
    let defaultView: BioxResourceViewSpec;
    for (const viewType of views) {
      defaultView = viewType.viewSpec.find(view => view.defaultView);
      if (defaultView != null) break;
    }

    if (defaultView) {
      this.selectViewSpec(
        {
          viewSpec: defaultView,
          displayMode: 'fullScreen',
          viewConfig: new BioxResourceViewConfig(),
          transformersWithConfig: []
        },
        true);
    }
  }

  public getViewSpecs$(): Observable<BioxResourceViewSpecsByType[]> {
    return this.viewSpecs$.getObs();
  }

  public getSelectedViewSpec$(): Observable<BioxResourceViewSpecWithConfig> {
    return this.selectedViewSpec$.asObservable();
  }

  public selectViewSpec(viewSpecConfigured: BioxResourceViewSpecWithConfig, isDefaultView: boolean = false): void {
    this.selectedViewSpec$.next(viewSpecConfigured);
    this.loadView(viewSpecConfigured, isDefaultView);
  }

  /////////////////////////////////// VIEW //////////////////////////////////////////

  /**
   * From a configured view spec, it creates an action to call and open the view
   * @param viewSpecConfigured
   * @param isDefaultView
   * @private
   */
  private loadView(viewSpecConfigured: BioxResourceViewSpecWithConfig, isDefaultView: boolean = false): void {
    const actionObs: Observable<BioxResourceViewEvent> =
      this.callResourceView(viewSpecConfigured.viewSpec.methodName,
        viewSpecConfigured.viewConfig, viewSpecConfigured.transformersWithConfig).pipe(
        map(view => ({
          view: view,
          displayMode: viewSpecConfigured.displayMode,
          viewName: viewSpecConfigured.viewSpec.humanName
        }))
      );

    this.flActionService.addAction(
      {
        type: this.actionType,
        text: viewSpecConfigured.viewSpec.getName(),
        action: actionObs
      },
      true,
      !isDefaultView); // for the default view, don't show the action portal
  }

  /**
   * Method to call the previous or next page of the view
   * @param pageConfig
   */
  public callPagination(pageConfig: Record<string, any>): Observable<BioxResourceView> {
    const config: BioxResourceViewConfig = this.selectedViewSpec$.value.viewConfig.clone();

    // override the view config with page config
    for (const key of Object.keys(pageConfig)) {
      config.configValues[key] = pageConfig[key];
    }

    return this.callResourceView(this.selectedViewSpec$.value.viewSpec.methodName, config,
      this.selectedViewSpec$.value.transformersWithConfig);
  }

  private callResourceView(methodName: string, config: BioxResourceViewConfig,
                           transformers: BioxTransformerWithConfig[]): Observable<BioxResourceView> {

    const transformerParams: CallTransformerParams[] = transformers.map(transformer => ({
      typing_name: transformer.transformer.typingName,
      config_values: transformer.config
    }));
    return this.resourceService.callResourceView(this.id, methodName, config.configValues, transformerParams);
  }

  private openViewInPortal(view: BioxResourceView): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '0'},
      {
        elevation: true,
        disposeOnNavigation: true,
      });

    this.portalService.createPortal(BioxResourceViewPortalComponent, portalConfig, view);
  }

  /**
   * Get the view to display
   * @param displayMode
   */
  public getView$(displayMode: BioxResourceViewDisplayMode): Observable<BioxResourceViewEvent> {
    return this.flActionService.getResult$(this.actionType).pipe(
      filter(actionResult => actionResult.status === 'success'),
      // convert the action result to BioxResourceViewEvent
      map((actionResult: FlPortalActionResult<BioxResourceViewEvent>) => {
        const viewEvent: BioxResourceViewEvent = actionResult.result;

        // if the view has a force display mode, use it. Otherwise, use the selected display mode
        const viewTypeInfo: BioxResourceViewTypeInfo = constBioxResourceViewTypeInfos[viewEvent.view.type];
        if (viewTypeInfo == null) {
          this.flSnackBarService.openErrorMessage('biox.view_type_node_supported', true);
          return actionResult.result;
        }

        viewEvent.displayMode = viewTypeInfo.forceDefaultDisplayMode ?
          viewTypeInfo.defaultDisplayMode : actionResult.result.displayMode;
        return actionResult.result;
      }),
      filter((viewEvent: BioxResourceViewEvent) => viewEvent.displayMode === displayMode)
    );
  }

  ngOnDestroy(): void {
    this.clear();
  }

  public clear(): void {
    this.selectedViewSpec$?.complete();
    this.subscription?.unsubscribe();
  }
}
