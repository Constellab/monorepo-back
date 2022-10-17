import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, Observable, switchMap} from 'rxjs';
import {CaProject} from '../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';

@Injectable()
export class CaProjectDetailState {

  private id$: Observable<string>;

  private project$: BehaviorSubject<CaProject>;

  constructor(private projectService: CaProjectService) {
  }

  public init(id$: Observable<string>): void {
    this.id$ = id$;
    this.project$ = new BehaviorSubject<CaProject>(null);


    this.id$.pipe(
      switchMap(id => this.projectService.getById(id))
    ).subscribe({
      next: project => this.project$.next(project),
      error: error => this.project$.error(error)
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
}
