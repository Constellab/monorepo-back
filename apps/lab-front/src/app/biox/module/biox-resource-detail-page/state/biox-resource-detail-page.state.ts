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
  BioxResourceViewSpecWithConfig
} from '../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResource} from '../../../../core/model/entities/resource/biox-resource.entity';
import {mergeMap} from 'rxjs/operators';
import {FlServerError} from '@monorepo/front-core-lib';

// Event on view loaded
export interface BioxResourceViewEvent {
  status: 'success' | 'error' | 'loading';
  view?: BioxResourceView; // loaded view only if success
  error?: FlServerError; // error only if error
  displayMode?: BioxResourceViewDisplayMode; // mode to where show the view when success
}

@Injectable()
export class BioxResourceDetailPageState implements OnDestroy {

  private type: string;
  private id: string;

  private resource$: ClCachedObservable<BioxResource>;
  private view$: BehaviorSubject<BioxResourceViewEvent>;
  private viewSpecs$: ClCachedObservable<BioxResourceViewSpecsByType[]>;
  private selectedViewSpec$: BehaviorSubject<BioxResourceViewSpecWithConfig>;

  private viewSubscription: Subscription;

  constructor(private resourceService: BioxResourceService) {
  }

  public init(type: string, id: string): void {
    this.type = type;
    this.id = id;
    this.resource$ = new ClCachedObservable(this.resourceService.getByTypingNameAndId(type, id));
    this.view$ = new BehaviorSubject({status: 'loading'});

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
      this.selectViewSpec({viewSpec: defaultView, displayMode: 'fullScreen', viewConfig: new BioxResourceViewConfig()});
    }
  }

  public getViewSpecs$(): Observable<BioxResourceViewSpecsByType[]> {
    return this.viewSpecs$.getObs();
  }

  public getSelectedViewSpec$(): Observable<BioxResourceViewSpecWithConfig> {
    return this.selectedViewSpec$.asObservable();
  }

  public selectViewSpec(viewSpecConfigured: BioxResourceViewSpecWithConfig): void {
    this.selectedViewSpec$.next(viewSpecConfigured);
    this.loadView(viewSpecConfigured);
  }

  /////////////////////////////////// VIEW //////////////////////////////////////////

  private loadView(viewSpecConfigured: BioxResourceViewSpecWithConfig): void {
    // todo improve loading management
    if (viewSpecConfigured.displayMode === 'fullScreen') {
      // mark the view as loading
      this.view$.next({status: 'loading', displayMode: 'fullScreen'});
    }

    this.viewSubscription?.unsubscribe(); // unsubscribe previous loading (if multiple view are requested in a row)
    this.viewSubscription = this.callResourceView(viewSpecConfigured.viewSpec.methodName, viewSpecConfigured.viewConfig)
      .subscribe(
        view => this.onLoadViewSuccess(view, viewSpecConfigured.displayMode),
        (error: FlServerError) => this.view$.next({status: 'error', error: error})
      );

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

  private onLoadViewSuccess(view: BioxResourceView, displayMode: BioxResourceViewDisplayMode): void {
    this.viewSubscription = null;
    this.view$.next({status: 'success', view: view, displayMode: displayMode});
  }

  public getView$(): Observable<BioxResourceViewEvent> {
    return this.view$.asObservable();
  }


  ngOnDestroy(): void {
    this.selectedViewSpec$.complete();
    this.view$.complete();
  }


}
