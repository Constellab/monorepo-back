import { Component, OnInit } from '@angular/core';
import {DaDocumentationService} from '../../../da-core/da-service/da-documentation.service';
import {DaDocumentationDTO} from '../../../da-core/da-model/da-entities/da-documentation.class';

@Component({
  selector: 'da-da-public-sidenav',
  templateUrl: './da-public-sidenav.component.html',
  styleUrls: ['./da-public-sidenav.component.scss']
})
export class DaPublicSidenavComponent implements OnInit {

  docs: DaDocumentationDTO[] = [];

  constructor(
    private daDocumentationService: DaDocumentationService
  ) { }

  ngOnInit(): void {
    this.daDocumentationService.get().subscribe((docs) => {
      docs.map(doc => this.docs.push(doc));
    })
  }

}
