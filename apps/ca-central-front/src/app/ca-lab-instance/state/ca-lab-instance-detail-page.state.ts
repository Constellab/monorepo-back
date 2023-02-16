import {Injectable, OnDestroy} from '@angular/core';
import {CaLabInstanceService} from '../../ca-core/service-api/ca-lab-instance.service';
import {BehaviorSubject, filter, Observable, Subscription} from 'rxjs';
import {
  CaLabInstance,
  CaLabInstanceFindOneDto,
  CaLabInstanceStatusDTO,
} from '../../ca-core/model/entities/lab/ca-lab-instance.class';
import {map} from 'rxjs/operators';
import {CaAuthenticatedUserService} from '../../ca-core/service-api/ca-authenticated-user.service';
import {CaLabInstanceUserRole} from '../../ca-core/model/entities/lab/ca-lab-instance-user.class';
import {FlPortalActionsService} from '@monorepo/front-core-lib';

/**
 * State for the lab instance detail page.
 */
@Injectable()
export class CaLabInstanceDetailPageState implements OnDestroy {

  public static readonly actionType = 'CaLabInstanceDetailPageState';

  private labInstance$: BehaviorSubject<CaLabInstance>;
  private userRole$: BehaviorSubject<CaLabInstanceUserRole>;
  private status$: BehaviorSubject<CaLabInstanceStatusDTO>;

  private id: string;

  private timeout: any;

  private subscription: Subscription;


  constructor(private labInstanceService: CaLabInstanceService,
              private authenticatedUserService: CaAuthenticatedUserService,
              private portalService: FlPortalActionsService) {
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
    this.getStatus();

    this.subscription = this.portalService.getResult$(CaLabInstanceDetailPageState.actionType).subscribe(
      (result) => this.getStatus(result.result)
    );
  }

  private getLabInstanceSuccess(labInstance: CaLabInstanceFindOneDto): void {
    this.labInstance$.next(labInstance.labInstance);
    this.userRole$.next(labInstance.userRole);
  }

  private getLabInstanceError(error: any): void {
    this.labInstance$.error(error);
    this.userRole$.error(error);
  }

  public getStatus(object?: CaLabInstanceStatusDTO): void {
    if (object && object instanceof CaLabInstanceStatusDTO) {
      this.setStatus(object);
    } else {
      // otherwise, request the status
      this.labInstanceService.getStatus(this.id).subscribe({
        next: status => this.setStatus(status),
        error: error => this.status$.error(error)
      });
    }
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
      this.timeout = setTimeout(() => this.getStatus(), 10000);
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

  /**
   * return true if the lab in on cloud
   */
  public isCloud$(): Observable<boolean> {
    return this.getLabInstance$().pipe(
      map(labInstance => labInstance.isCloud)
    );
  }

  public serverIsBusy$(): Observable<boolean> {
    return this.getStatus$().pipe(
      map(status => status.labStatus.value === 'STARTING' || status.labStatus.value === 'STOPPING')
    );
  }

  public updateLab(labInstance: CaLabInstance): void {
    this.labInstance$.next(labInstance);
    this.getStatus();
  }

  public getLabInstanceId(): string {
    return this.id;
  }

  ngOnDestroy(): void {
    this.labInstance$?.complete();
    this.userRole$?.complete();
    this.status$?.complete();
    this.subscription?.unsubscribe();
  }

}
