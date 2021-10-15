import {Component, OnInit} from '@angular/core';
import {DaDocumentationService} from '../../../da-core/da-service/da-documentation.service';
import {DaDocumentationDTO} from '../../../da-core/da-model/da-entities/da-documentation.class';
import {DaAuthService} from '../../../da-core/da-service/da-auth.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'da-da-public-sidenav',
  templateUrl: './da-public-sidenav.component.html',
  styleUrls: ['./da-public-sidenav.component.scss']
})
export class DaPublicSidenavComponent implements OnInit {

  docs$: Observable<DaDocumentationDTO[]>;
  isConnected = false;

  constructor(
    private daDocumentationService: DaDocumentationService,
    private daAuthService: DaAuthService
  ) {
  }

  ngOnInit(): void {
    this.docs$ = this.daDocumentationService.get();

    this.isConnected = this.daAuthService.hasAuthorizationCookie();
  }

}
