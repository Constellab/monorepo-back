import {Component, OnInit} from '@angular/core';
import {CaUser} from '../../../ca-core/model/entities/ca-user.class';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {ActivatedRoute} from '@angular/router';
import {CaUsersService} from '../../../ca-core/service-api/ca-users.service';
import {Observable} from 'rxjs';

/**
 * Component that show a form on first user login to complete his information
 */
@Component({
  selector: 'ca-user-complete-info-page',
  templateUrl: './ca-user-complete-info-page.component.html',
  styleUrls: ['./ca-user-complete-info-page.component.scss']
})
export class CaUserCompleteInfoPageComponent implements OnInit {

  user$: Observable<CaUser>;
  isCurrent: boolean;


  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private route: ActivatedRoute,
              private userService: CaUsersService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.user$ = this.userService.getById(params.id);

      this.user$.subscribe((u) => {
        console.log(u)
      })
    })
  }

}
