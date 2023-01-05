import {Injectable, OnDestroy} from '@angular/core';
import {CaLabInstanceService} from '../../ca-core/service-api/ca-lab-instance.service';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {
  CaLabInstance,
  CaLabInstanceFindOneDto,
  CaLabInstanceStatusDTO,
} from '../../ca-core/model/entities/lab/ca-lab-instance.class';
import {map} from 'rxjs/operators';
import {CaAuthenticatedUserService} from '../../ca-core/service-api/ca-authenticated-user.service';
import {CaLabInstanceUserRole} from '../../ca-core/model/entities/lab/ca-lab-instance-user.class';

@Injectable()
export class CaLabInstanceDetailPageState implements OnDestroy {

  private labInstance$: BehaviorSubject<CaLabInstance>;
  private userRole$: BehaviorSubject<CaLabInstanceUserRole>;
  private status$: BehaviorSubject<CaLabInstanceStatusDTO>;

  private id: string;

  private timeout: any;

  constructor(private labInstanceService: CaLabInstanceService,
              private authenticatedUserService: CaAuthenticatedUserService) {
  }

  public init(id: string): void {
    this.id = id;
    this.labInstance$ = new BehaviorSubject(null);
    this.userRole$ = new BehaviorSubject(null);
    this.labInstanceService.findById(id).subscribe({
      next: labInstance => this.getLabInstanceSuccess(labInstance),
      error: error => this.getLabInstanceError(error)
    });

    this.status$ = new BehaviorSubject(null);
    this.refreshStatus();
  }

  private getLabInstanceSuccess(labInstance: CaLabInstanceFindOneDto): void {
    this.labInstance$.next(labInstance.labInstance);
    this.userRole$.next(labInstance.userRole);
  }

  private getLabInstanceError(error: any): void {
    this.labInstance$.error(error);
    this.userRole$.error(error);
  }

  public refreshStatus(): void {
    this.labInstanceService.getStatus(this.id).subscribe({
      next: status => this.setStatus(status),
      error: error => this.status$.error(error)
    });
  }


  public setStatus(status: CaLabInstanceStatusDTO): void {
    this.status$.next(status);

    // clear the timeout if exist to avoid duplicates
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // if the lab is busy, refresh the status every 10 seconds
    if (status.labStatus.value === 'STARTING' || status.labStatus.value === 'STOPPING') {
      this.timeout = setTimeout(() => this.refreshStatus(), 10000);
    }
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

  public getStatus$(): Observable<CaLabInstanceStatusDTO> {
    return this.status$.asObservable().pipe(
      filter(status => status != null),
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
    this.refreshStatus();
  }

  public getLabInstanceId(): string {
    return this.id;
  }

  ngOnDestroy(): void {
    this.labInstance$?.complete();
    this.userRole$?.complete();
    this.status$?.complete();
  }

}
