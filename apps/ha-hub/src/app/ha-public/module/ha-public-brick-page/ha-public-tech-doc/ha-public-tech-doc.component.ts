import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {HaAuthenticatedUserService} from '../../../../ha-core/ha-service/ha-authenticated-user.service';
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
  activatedRoute: ActivatedRoute = this.route;
  isLoading: boolean = true;
  techDocNotFound: boolean = false;

  constructor(
    private brickService: HaBrickService,
    private documentationService: HaDocumentationService,
    private authUserService: HaAuthenticatedUserService,
    private route: ActivatedRoute) {
  }


  ngOnInit(): void {
    this.getActiveDoc();
  }

  private getActiveDoc(): void {
    this.route.params.subscribe(params => {
      this.techDocNotFound = false;
      this.isLoading = true;
      this.brickService.getTechDocByPath(params.brickName, params.version,
        params.type, params.uniqueName).subscribe(techDoc => {
        if (techDoc == null) {
          this.techDocNotFound = true;
        }
        this.techDoc = techDoc;
        this.isLoading = false;
      });
    });
  }
}
