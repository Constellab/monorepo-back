import {Injectable} from '@angular/core';
import {first, Observable, share, switchMap} from 'rxjs';
import {
  CaProjectAncestorTreeDTO,
  CaProjectObjectRef,
  CaProjectTreeDto
} from '../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';
import {ClCachedObservable} from '@monorepo/core-lib';

/**
 * State for the CaProjectObjectDetailPageComponent
 */
@Injectable()
export class CaProjectObjectDetailState {


  private projectObjectRef$: Observable<CaProjectObjectRef>;
  private projectAncestors$: Observable<CaProjectAncestorTreeDTO[]>;
  private projectTree$: ClCachedObservable<CaProjectTreeDto>;

  constructor(private projectService: CaProjectService) {
  }

  public init(projectObjectRef$: Observable<CaProjectObjectRef>): void {
    this.projectObjectRef$ = projectObjectRef$;
    this.projectAncestors$ = projectObjectRef$.pipe(
      switchMap(projectObjectRef => this.projectService.getObjectProjectAncestors(projectObjectRef.type, projectObjectRef.id)),
      share() // share the observable result for multiple subscribers, use share not ClCachedObservable because it emits multiples values
    );

    this.projectTree$ = new ClCachedObservable(projectObjectRef$.pipe(
      // as the tree start with the root, it only needs to be loaded once
      first(),
      switchMap(projectObject => this.projectService.getProjectTree(projectObject.type, projectObject.id)),
    ));
  }

  public getProjectAncestors$(): Observable<CaProjectAncestorTreeDTO[]> {
    return this.projectAncestors$;
  }

  public getProjectTree$(): Observable<CaProjectTreeDto> {
    return this.projectTree$.getObs();
  }
}
