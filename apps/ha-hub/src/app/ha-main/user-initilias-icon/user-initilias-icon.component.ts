import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {HaUser} from '../../ha-core/ha-model/ha-entities/ha-user';
import {HaAuthenticatedUserService} from '../../ha-core/ha-service/ha-authenticated-user.service';

@Component({
  selector: 'user-initilias-icon',
  templateUrl: './user-initilias-icon.component.html',
  styleUrls: ['./user-initilias-icon.component.scss']
})
export class UserInitiliasIconComponent implements OnInit {

  @Input()
  userConnected: any;

  initials: string;

  constructor(
  ) { }

  ngOnInit(): void {
    console.log(this.userConnected);
    this.initials = (this.userConnected.firstname.charAt(0) + this.userConnected.lastname.charAt(0)).toUpperCase();
  }

}
