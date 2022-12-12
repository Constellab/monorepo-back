import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlUser} from '../../model/fl-user.class';
import {FlUserConfig} from '../../service/fl-user-config.config';

/**
 * Simple portal to show the user information
 */
@Component({
  selector: 'fl-user-info-portal',
  templateUrl: './fl-user-info-portal.component.html',
  styleUrls: ['./fl-user-info-portal.component.scss']
})
export class FlUserInfoPortalComponent implements OnInit {

  user: FlUser;

  userRoute: string;

  constructor(@Inject(FL_PORTAL_DATA) private data: FlUser,
              private userConfig: FlUserConfig) {
    this.user = data;
  }

  ngOnInit(): void {
    this.userRoute = this.userConfig.getUserDetailRoute(this.user.id);
  }

}
