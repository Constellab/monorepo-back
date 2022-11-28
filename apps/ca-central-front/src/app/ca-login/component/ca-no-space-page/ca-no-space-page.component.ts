import {Component, OnInit} from '@angular/core';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

/**
 * Page used when a user is not part of an space
 */
@Component({
  selector: 'ca-no-space-page',
  templateUrl: './ca-no-space-page.component.html',
  styleUrls: ['./ca-no-space-page.component.scss']
})
export class CaNoSpacePageComponent implements OnInit {

  loginRoute = CaRouterService.getLoginRoute();
  constructor() { }

  ngOnInit(): void {
  }

}
