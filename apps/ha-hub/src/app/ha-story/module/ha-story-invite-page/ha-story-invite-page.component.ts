import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HaStoryService} from '../../../ha-core/ha-service/ha-story.service';
import {HaStoryAuthorInvite} from '../../../ha-core/ha-model/ha-entities/ha-story-author-invite.class';

@Component({
  selector: 'ha-story-invite-page',
  templateUrl: './ha-story-invite-page.component.html',
  styleUrls: ['./ha-story-invite-page.component.scss']
})
export class HaStoryInvitePageComponent implements OnInit {

  token: string;

  invite: HaStoryAuthorInvite;

  isLoading = false;

  constructor(
    private activeRoute: ActivatedRoute,
    private storyService: HaStoryService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(params => {
      this.token = params.token;
      this.checkValidity();
    });
  }

  checkValidity(): void {
    this.storyService.isInvitationValid(this.token).subscribe(invite => {
      this.invite = invite;
      if (!invite) {
        this.router.navigate(['/']);
      }
    });
  }

  acceptInvite(): void {
    this.isLoading = true;
    this.storyService.acceptInvite(this.token).subscribe((story) => {
      this.router.navigate(['/stories/edit/', story.id]);
      this.isLoading = false;
    });
  }

}
