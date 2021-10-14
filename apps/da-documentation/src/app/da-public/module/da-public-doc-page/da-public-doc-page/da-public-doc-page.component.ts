import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, UrlSegment} from '@angular/router';
import { Observable } from 'rxjs';
import { DaDocumentation } from '../../../../da-core/da-model/da-entities/da-documentation.class';
import { DaDocumentationService } from '../../../../da-core/da-service/da-documentation.service';

@Component({
  selector: 'da-da-public-doc-page',
  templateUrl: './da-public-doc-page.component.html',
  styleUrls: ['./da-public-doc-page.component.scss']
})
export class DaPublicDocPageComponent implements OnInit {

  path: string;
  documentation$: Observable<DaDocumentation> | DaDocumentation;
  showFiller = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private daDocumentationService: DaDocumentationService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.url.subscribe(url => {
      if(url.length == 0){

      }
      this.getDocumentationByPath(url);
    });
  }

  public getDocumentationByPath(url: UrlSegment[]): void{
    this.path = url.join('/');
    this.documentation$ = this.daDocumentationService.getByPath(this.path);
  }
}
