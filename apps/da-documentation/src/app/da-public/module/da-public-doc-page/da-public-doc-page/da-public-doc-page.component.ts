import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, UrlSegment} from '@angular/router';
import {Observable} from 'rxjs';
import {DaDocumentation} from '../../../../da-core/da-model/da-entities/da-documentation.class';
import {DaDocumentationService} from '../../../../da-core/da-service/da-documentation.service';

@Component({
  selector: 'da-public-doc-page',
  templateUrl: './da-public-doc-page.component.html',
  styleUrls: ['./da-public-doc-page.component.scss']
})
export class DaPublicDocPageComponent implements OnInit {

  documentation$: Observable<DaDocumentation>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private daDocumentationService: DaDocumentationService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.url.subscribe((url: UrlSegment[]) => {
      this.getDocumentationByPath(url);
    });
  }

  private getDocumentationByPath(url: UrlSegment[]): void {
    const path = url.join('/');
    this.documentation$ = this.daDocumentationService.getByPath(path);
  }
}
