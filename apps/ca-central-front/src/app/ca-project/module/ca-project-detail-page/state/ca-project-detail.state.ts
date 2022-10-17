import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, filter, Observable, switchMap} from 'rxjs';
import {CaProject} from '../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';
import {CaUser} from '../../../../ca-core/model/entities/ca-user.class';
import {map} from 'rxjs/operators';
import {CaAuthenticatedUserService} from '../../../../ca-core/service-api/ca-authenticated-user.service';
import {FlQueryParamHandler, FlQuillJson} from '@monorepo/front-core-lib';
import {ActivatedRoute, Router} from '@angular/router';
import {CaReport} from '../../../../ca-core/model/entities/ca-report.class';
import {CaExperiment} from '../../../../ca-core/model/entities/ca-experiment.class';
import {CaReportService} from '../../../../ca-core/service-api/ca-report.service';
import {CaExperimentService} from '../../../../ca-core/service-api/ca-experiment.service';

export type CaProjectDetailRightPanel = {
  type: 'description' | 'report' | 'experiment'
  objectId?: string;
}


@Injectable()
export class CaProjectDetailState implements OnDestroy {

  private id$: Observable<string>;

  private project$: BehaviorSubject<CaProject>;
  private users$: BehaviorSubject<CaUser[]>;
  private reports$: BehaviorSubject<CaReport[]>;
  private experiments$: BehaviorSubject<CaExperiment[]>;
  private rightPanelState$: BehaviorSubject<CaProjectDetailRightPanel>;

  private queryParamHandler: FlQueryParamHandler<CaProjectDetailRightPanel>;


  constructor(private projectService: CaProjectService,
              private authenticatedUserService: CaAuthenticatedUserService,
              private route: ActivatedRoute,
              private router: Router,
              private experimentService: CaExperimentService,
              private reportService: CaReportService) {
    this.queryParamHandler = new FlQueryParamHandler(router, route);
  }

  public init(id$: Observable<string>): void {
    this.id$ = id$;
    this.project$ = new BehaviorSubject<CaProject>(null);
    this.users$ = new BehaviorSubject<CaUser[]>(null);
    this.reports$ = new BehaviorSubject<CaReport[]>(null);
    this.experiments$ = new BehaviorSubject<CaExperiment[]>(null);
    this.rightPanelState$ = new BehaviorSubject<CaProjectDetailRightPanel>(null);

    this.id$.pipe(
      switchMap(id => this.projectService.getById(id))
    ).subscribe({
      next: project => this.initProject(project),
      error: error => this.project$.error(error)
    });

    this.id$.pipe(
      switchMap(id => this.projectService.getUsersOfProject(id))
    ).subscribe({
      next: users => this.users$.next(users),
      error: error => this.users$.error(error)
    });

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

  private initProject(project: CaProject): void {
    this.project$.next(project);

    // if the project is a leaf, load the reports and experiments
    if (project.isLeaf()) {
      this.reportService.getReportsByProject(project.id).subscribe({
        next: reports => this.reports$.next(reports),
        error: error => this.reports$.error(error)
      });
      this.experimentService.getExperimentsByProject(project.id).subscribe({
        next: experiments => this.experiments$.next(experiments),
        error: error => this.experiments$.error(error)
      });
    }
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

  public getReports$(): Observable<CaReport[]> {
    return this.reports$.asObservable().pipe(
      filter(reports => reports != null)
    );
  }

  public getReport$(id: string): Observable<CaReport> {
    return this.getReports$().pipe(
      map(reports => reports.find(report => report.id === id))
    );
  }

  public getExperiments$(): Observable<CaExperiment[]> {
    return this.experiments$.asObservable().pipe(
      filter(experiments => experiments != null)
    );
  }

  public getExperiment(id: string): Observable<CaExperiment> {
    return this.getExperiments$().pipe(
      map(experiments => experiments.find(experiment => experiment.id === id))
    );
  }

  ngOnDestroy(): void {
    this.project$?.complete();
    this.users$?.complete();
    this.reports$?.complete();
    this.experiments$?.complete();
    this.rightPanelState$?.complete();
  }


}
