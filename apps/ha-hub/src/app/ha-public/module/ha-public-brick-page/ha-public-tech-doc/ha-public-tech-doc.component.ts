import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {FlTextEditorConfig} from '@monorepo/front-core-lib';
import {HaAuthenticatedUserService} from '../../../../ha-core/ha-service/ha-authenticated-user.service';
import {HaDocTextEditorConfig} from '../ha-doc-text-editor-config.class';
import {TdTypeEntity} from '@monorepo/technical-doc';

@Component({
  selector: 'ha-public-tech-doc-page',
  templateUrl: './ha-public-tech-doc.component.html',
  styleUrls: ['./ha-public-tech-doc.component.scss'],
})
export class HaPublicTechDocComponent implements OnInit {

  techDoc: TdTypeEntity;
  brickName: string;
  brickVersion: string;
  lastUrl: string = null;
  isCheck: boolean = false;
  activatedRoute: ActivatedRoute = this.route;
  isLoading: boolean = true;
  textEditorConfig: FlTextEditorConfig;

  constructor(
    private brickService: HaBrickService,
    private documentationService: HaDocumentationService,
    private authUserService: HaAuthenticatedUserService,
    private route: ActivatedRoute,
    private router: Router,
    textEditorConfig: HaDocTextEditorConfig) {
    this.textEditorConfig = textEditorConfig;
  }


  ngOnInit(): void {
    this.getActiveDoc();
  }

  private getActiveDoc(): void {
    this.route.params.subscribe(params => {
      this.isLoading = true;
      this.brickService.getTechDocByPath(params.brickName, params.version,
        params.type, params.uniqueName).subscribe(techDoc => {
        this.techDoc = techDoc;
        this.isLoading = false;
      });
    });
  }
}
