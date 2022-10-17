import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {CaProject} from '../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';
import {CaUser} from '../../../../ca-core/model/entities/ca-user.class';
import {map} from 'rxjs/operators';
import {CaAuthenticatedUserService} from '../../../../ca-core/service-api/ca-authenticated-user.service';
import {FlQueryParamHandler, FlQuillJson} from '@monorepo/front-core-lib';
import {ActivatedRoute, Router} from '@angular/router';

export type CaProjectDetailRightPanel = {
  type: 'description' | 'report' | 'experiment'
  objectId?: string;
}


@Injectable()
export class CaProjectDetailState implements OnDestroy {

  private id$: Observable<string>;

  private project$: BehaviorSubject<CaProject>;
  private users$: BehaviorSubject<CaUser[]>;
  private rightPanelState$: BehaviorSubject<CaProjectDetailRightPanel>;

  private queryParamHandler: FlQueryParamHandler<CaProjectDetailRightPanel>;


  constructor(private projectService: CaProjectService,
              private authenticatedUserService: CaAuthenticatedUserService,
              private route: ActivatedRoute,
              private router: Router) {
    this.queryParamHandler = new FlQueryParamHandler(router, route);
  }

  public init(id$: Observable<string>): void {
    this.id$ = id$;
    this.project$ = new BehaviorSubject<CaProject>(null);
    this.users$ = new BehaviorSubject<CaUser[]>(null);
    this.rightPanelState$ = new BehaviorSubject<CaProjectDetailRightPanel>(null);


    this.id$.subscribe(
      id => this.initProject(id)
    );

    this.queryParamHandler.getFirstQueryParams().subscribe(
      params => {
        if (params && params.type) {
          this.updateRightPanelState(params);
        } else {
          // for the default mode, don't update the url
          this.rightPanelState$.next({type: 'description'});
        }
      }
    );
  }

  private initProject(id: string): void {
    this.projectService.getById(id).subscribe({
      next: project => this.project$.next(project),
      error: error => this.project$.error(error)
    });

    this.projectService.getUsersOfProject(id).subscribe({
      next: users => this.users$.next(users),
      error: error => this.users$.error(error)
    });
  }

  public getProjectId$(): Observable<string> {
    return this.id$;
  }


  public updateCurrentProject(project: CaProject): void {
    this.project$.next(project);
  }

  public getCurrentProject(): CaProject | null {
    return this.project$.value;
  }

  public getProject$(skipNull: boolean = true): Observable<CaProject> {
    return this.project$.asObservable().pipe(
      filter(project => !skipNull || project != null)
    );
  }

  public getUsers$(): Observable<CaUser[]> {
    return this.users$.asObservable().pipe(
      filter(users => users != null)
    );
  }

  public updateRightPanelState(state: CaProjectDetailRightPanel): void {
    // update the url
    this.queryParamHandler.mergeQueryParams(state);

    // check if the state has changed
    const currentState = this.rightPanelState$.value;
    if (currentState && currentState.type === state.type &&
      currentState.objectId === state.objectId) {
      return;
    }

    this.rightPanelState$.next(state);
  }

  public getRightPanelState$(): Observable<CaProjectDetailRightPanel> {
    return this.rightPanelState$.asObservable().pipe(filter(state => state != null));
  }

  public canEditProject$(): Observable<boolean> {
    const user = this.authenticatedUserService.getUser();
    return this.getProject$(false).pipe(
      map(project => project != null && project.leader.id === user.id)
    );
  }

  public updateDescription(description: FlQuillJson): void {
    const project = this.getCurrentProject();
    project.description = description as any;
    this.projectService.updateDescription(project.id, description as any).subscribe();
  }

  ngOnDestroy(): void {
    this.project$?.complete();
    this.users$?.complete();
    this.rightPanelState$?.complete();
  }


}
