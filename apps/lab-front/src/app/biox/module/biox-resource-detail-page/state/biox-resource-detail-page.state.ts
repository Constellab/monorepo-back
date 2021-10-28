import {Injectable, OnDestroy} from '@angular/core';
import {ClCachedObservable} from '@monorepo/core-lib';
import {BioxResourceService} from '../../../../core/entity-service/biox-resource.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {
  BioxResourceView,
  BioxResourceViewConfig,
  BioxResourceViewDisplayMode,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType,
  BioxResourceViewSpecWithConfig
} from '../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResource} from '../../../../core/model/entities/resource/biox-resource.entity';
import {map, mergeMap} from 'rxjs/operators';
import {FlPortalActionResult, FlPortalActionsService} from '@monorepo/front-core-lib';

// Event on view loaded
export interface BioxResourceViewEvent {
  view: BioxResourceView;
  displayMode?: BioxResourceViewDisplayMode; // mode to where show the view when success
}

@Injectable()
export class BioxResourceDetailPageState implements OnDestroy {

  private readonly actionType: string = 'view-loader';

  private type: string;
  private id: string;

  private resource$: ClCachedObservable<BioxResource>;
  private view$: BehaviorSubject<BioxResourceViewEvent>;
  private viewSpecs$: ClCachedObservable<BioxResourceViewSpecsByType[]>;
  private selectedViewSpec$: BehaviorSubject<BioxResourceViewSpecWithConfig>;


  constructor(private resourceService: BioxResourceService,
              private flActionService: FlPortalActionsService) {
  }

  public init(type: string, id: string): void {
    this.type = type;
    this.id = id;
    this.resource$ = new ClCachedObservable(this.resourceService.getByTypingNameAndId(type, id));

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
  }

  public getResource$(): Observable<BioxResource> {
    return this.resource$.getObs();
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
      this.selectViewSpec({viewSpec: defaultView, displayMode: 'fullScreen', viewConfig: new BioxResourceViewConfig()},
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

  private loadView(viewSpecConfigured: BioxResourceViewSpecWithConfig, isDefaultView: boolean = false): void {
    const actionObs: Observable<BioxResourceViewEvent> =
      this.callResourceView(viewSpecConfigured.viewSpec.methodName, viewSpecConfigured.viewConfig).pipe(
        map(view => ({view: view, displayMode: viewSpecConfigured.displayMode}))
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

    return this.callResourceView(this.selectedViewSpec$.value.viewSpec.methodName, config);
  }

  private callResourceView(methodName: string, config: BioxResourceViewConfig): Observable<BioxResourceView> {
    return this.resourceService.callResourceView(this.type, this.id, methodName, config.configValues);
  }

  public getView$(): Observable<FlPortalActionResult<BioxResourceViewEvent>> {
    return this.flActionService.getResult$(this.actionType);
  }


  ngOnDestroy(): void {
    this.selectedViewSpec$.complete();
    this.view$.complete();
  }


}
