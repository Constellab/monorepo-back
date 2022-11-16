import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, first, Observable, share, switchMap} from 'rxjs';
import {
  CaProjectAncestorTreeDTO,
  CaProjectObjectRef,
  CaProjectTreeDto
} from '../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';
import {ClCachedObservable} from '@monorepo/core-lib';
import {FlQueryParamHandler, FlRouterHelper} from '@monorepo/front-core-lib';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {map} from 'rxjs/operators';

/**
 * State for the CaProjectObjectDetailPageComponent
 */
@Injectable()
export class CaProjectObjectDetailState implements OnDestroy {

  private projectAncestors$: Observable<CaProjectAncestorTreeDTO[]>;
  private projectTree$: ClCachedObservable<CaProjectTreeDto>;

  private treeDrawerOpened$: BehaviorSubject<boolean>;
  private queryParamHandler: FlQueryParamHandler<{ showTree?: boolean }>;

  constructor(private projectService: CaProjectService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  public init(): void {
    const projectObjectRef$ = FlRouterHelper.listenToChildrenParams(this.router, this.route)
      .pipe(
        map(params => this.getProjectObjectRef(params))
      );

    this.projectAncestors$ = projectObjectRef$.pipe(
      switchMap(projectObjectRef => this.projectService.getObjectProjectAncestors(projectObjectRef.type, projectObjectRef.id)),
      share() // share the observable result for multiple subscribers, use share not ClCachedObservable because it emits multiples values
    );

    this.projectTree$ = new ClCachedObservable(projectObjectRef$.pipe(
      // as the tree start with the root, it only needs to be loaded once
      first(),
      switchMap(projectObject => this.projectService.getProjectTree(projectObject.type, projectObject.id)),
    ));
    this.treeDrawerOpened$ = new BehaviorSubject(false);

    this.initTreeDrawerOpened();

    // if there is no hierarchy, force the tree to be closed
    this.rootProjectHasChildren$().subscribe(
      hasChildren => {
        if (!hasChildren) {
          this.setTreeOpened(false);
        }
      });
  }

  public rootProjectHasChildren$(): Observable<boolean> {
    return this.getProjectTree$().pipe(
      map(ancestors => ancestors.children.length > 0)
    );
  }

  private getProjectObjectRef(params: Params): CaProjectObjectRef {
    if (params.experimentId) {
      return {
        type: 'experiment',
        id: params.experimentId
      };
    } else if (params.reportId) {
      return {
        type: 'report',
        id: params.reportId
      };
    } else {
      return {
        type: 'project',
        id: params.projectId
      };
    }
  }

  private initTreeDrawerOpened(): void {
    this.queryParamHandler = new FlQueryParamHandler(this.router, this.route);
    // init tree open
    this.queryParamHandler.getFirstQueryParams().subscribe(
      params => {
        if (params.showTree) {
          this.treeDrawerOpened$.next(true);
        }
      }
    );
  }

  toggleTree(): void {
    this.setTreeOpened(!this.treeDrawerOpened$.value);
  }

  public setTreeOpened(treeOpened: boolean): void {
    this.treeDrawerOpened$.next(treeOpened);
    if (treeOpened) {
      this.queryParamHandler.mergeQueryParams({showTree: true});
    } else {
      this.queryParamHandler.mergeQueryParams({showTree: null});
    }
  }

  public getProjectAncestors$(): Observable<CaProjectAncestorTreeDTO[]> {
    return this.projectAncestors$;
  }

  public getProjectTree$(): Observable<CaProjectTreeDto> {
    return this.projectTree$.getObs();
  }

  public getTreeDrawerOpened$(): Observable<boolean> {
    return this.treeDrawerOpened$.asObservable();
  }

  ngOnDestroy(): void {
    this.treeDrawerOpened$?.complete();
  }


}
