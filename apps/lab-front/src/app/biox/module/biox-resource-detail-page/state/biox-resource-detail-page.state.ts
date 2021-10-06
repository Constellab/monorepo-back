import {Injectable, OnDestroy} from '@angular/core';
import {ClCachedObservable} from '@monorepo/core-lib';
import {BioxResourceService} from '../../../../core/entity-service/biox-resource.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {
  BioxResourceView,
  BioxResourceViewConfig,
  BioxResourceViewSpec,
  BioxResourceViewSpecsByType,
  BioxResourceViewSpecWithConfig
} from '../../../../core/model/entities/resource/biox-resource-view.entity';
import {BioxResource} from '../../../../core/model/entities/resource/biox-resource.entity';
import {mergeMap} from 'rxjs/operators';

@Injectable()
export class BioxResourceDetailPageState implements OnDestroy {

  private type: string;
  private id: string;

  private resource$: ClCachedObservable<BioxResource>;
  private view$: BehaviorSubject<BioxResourceView>;
  private viewSpecs$: ClCachedObservable<BioxResourceViewSpecsByType[]>;
  private selectedViewSpec$: BehaviorSubject<BioxResourceViewSpecWithConfig>;

  constructor(private resourceService: BioxResourceService) {
  }

  public init(type: string, id: string): void {
    this.type = type;
    this.id = id;
    this.resource$ = new ClCachedObservable(this.resourceService.getByTypingNameAndId(type, id));
    this.view$ = new BehaviorSubject(null);

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
      this.selectViewSpec(defaultView);
    }
  }

  public getViewSpecs$(): Observable<BioxResourceViewSpecsByType[]> {
    return this.viewSpecs$.getObs();
  }

  public getSelectedViewSpec$(): Observable<BioxResourceViewSpecWithConfig> {
    return this.selectedViewSpec$.asObservable();
  }

  public selectViewSpec(viewSpec: BioxResourceViewSpec, viewConfig?: BioxResourceViewConfig): void {
    if (viewConfig == null) {
      viewConfig = new BioxResourceViewConfig();
    }
    const viewSpecConfigured: BioxResourceViewSpecWithConfig = {viewSpec: viewSpec, config: viewConfig};
    this.selectedViewSpec$.next(viewSpecConfigured);
    this.loadView(viewSpecConfigured);
  }

  /////////////////////////////////// VIEW //////////////////////////////////////////

  private loadView(viewSpecConfigured: BioxResourceViewSpecWithConfig): void {
    if (viewSpecConfigured == null) {
      this.view$.next(null);
    } else {
      this.resourceService.callResourceView(this.type, this.id, viewSpecConfigured.viewSpec.methodName, viewSpecConfigured.config)
        .subscribe(
          view => this.view$.next(view)
        );
    }
  }

  public getView$(): Observable<BioxResourceView> {
    return this.view$.asObservable();
  }


  ngOnDestroy(): void {
    this.selectedViewSpec$.complete();
    this.view$.complete();
  }


}
