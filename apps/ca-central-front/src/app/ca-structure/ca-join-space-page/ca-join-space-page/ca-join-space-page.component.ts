import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaSpaceInvitFull} from '../../../ca-core/model/entities/space/ca-space-invit.class';
import {CaSpaceInvitService} from '../../../ca-core/service-api/ca-space-invit.service';
import {ActivatedRoute} from '@angular/router';
import {CaSpaceService} from '../../../ca-core/service-api/ca-space.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

/**
 * Component to join an space when the user already have an account and is logged in.
 */
@Component({
  selector: 'ca-join-space-page',
  templateUrl: './ca-join-space-page.component.html',
  styleUrls: ['./ca-join-space-page.component.scss']
})
export class CaJoinSpacePageComponent implements OnInit {

  invitation$: Observable<CaSpaceInvitFull>;

  invitationCode: string;

  acceptIsLoading: boolean = false;

  constructor(private spaceInvitService: CaSpaceInvitService,
              private spaceService: CaSpaceService,
              private route: ActivatedRoute,
              private snackBarService: FlSnackBarService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.code)
    );
  }

  private init(code: string): void {
    this.invitationCode = code;
    this.invitation$ = this.spaceInvitService.getInvitationByCode(code);
  }

  acceptInvitation(): void {
    this.acceptIsLoading = true;
    this.spaceInvitService.acceptInvitationExistingUser(this.invitationCode).subscribe({
      next: () => this.acceptInvitationSuccess(),
      error: () => this.acceptIsLoading = false
    });
  }

  private acceptInvitationSuccess(): void {
    this.acceptIsLoading = false;
    this.snackBarService.openSuccessMessage({text: 'join_space_existing_user_success', translateText: true});
    this.routerService.navigateToDashboard();
  }

}
