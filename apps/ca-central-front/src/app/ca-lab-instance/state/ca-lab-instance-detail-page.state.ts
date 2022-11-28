import {Injectable, OnDestroy} from '@angular/core';
import {CaLabInstanceService} from '../../ca-core/service-api/ca-lab-instance.service';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {CaLabInstance, CaLabInstanceFindOneDto,} from '../../ca-core/model/entities/ca-lab-instance.class';
import {map} from 'rxjs/operators';
import {CaAuthenticatedUserService} from '../../ca-core/service-api/ca-authenticated-user.service';
import {CaLabInstanceUserRole} from '../../ca-core/model/entities/ca-lab-instance-user.class';

@Injectable()
export class CaLabInstanceDetailPageState implements OnDestroy {

  private labInstance$: BehaviorSubject<CaLabInstance>;
  private userRole$: BehaviorSubject<CaLabInstanceUserRole>;

  constructor(private labInstanceService: CaLabInstanceService,
              private authenticatedUserService: CaAuthenticatedUserService) {
  }

  public init(id: string): void {
    this.labInstance$ = new BehaviorSubject(null);
    this.userRole$ = new BehaviorSubject(null);
    this.labInstanceService.findById(id).subscribe({
      next: labInstance => this.getLabInstanceSuccess(labInstance),
      error: error => this.getLabInstanceError(error)
    });
  }

  private getLabInstanceSuccess(labInstance: CaLabInstanceFindOneDto): void {
    this.labInstance$.next(labInstance.labInstance);
    this.userRole$.next(labInstance.userRole);
  }

  private getLabInstanceError(error: any): void {
    this.labInstance$.error(error);
    this.userRole$.error(error);
  }

  public getLabInstance$(): Observable<CaLabInstance> {
    return this.labInstance$.asObservable().pipe(
      filter(labInstance => labInstance != null),
    );
  }

  public getCurrentUserRole$(): Observable<CaLabInstanceUserRole> {
    return this.userRole$.asObservable().pipe(
      filter(userRole => userRole != null),
    );
  }

  /**
   * return true if the user is an owner of the lab or an admin
   */
  public isLabOwner$(): Observable<boolean> {
    return this.getCurrentUserRole$().pipe(
      map(role => role === 'OWNER' || this.authenticatedUserService.isCurrentSpaceAdmin())
    );
  }

  public updateLab(labInstance: CaLabInstance): void {
    this.labInstance$.next(labInstance);
  }

  ngOnDestroy(): void {
    this.labInstance$?.complete();
    this.userRole$?.complete();
  }

}
