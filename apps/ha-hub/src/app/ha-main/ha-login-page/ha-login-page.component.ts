import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';

@Component({
  selector: 'ha-login-page',
  templateUrl: './ha-login-page.component.html',
  styleUrls: ['./ha-login-page.component.scss']
})
export class HaLoginPageComponent implements OnInit {

  constructor(private router: Router,
              private authenticatedUserService: HaAuthenticatedUserService) {
  }

  ngOnInit(): void {
  }

  onLoginSuccess(): void {
    this.authenticatedUserService.init();
    this.router.navigate(['/']);
  }

}
