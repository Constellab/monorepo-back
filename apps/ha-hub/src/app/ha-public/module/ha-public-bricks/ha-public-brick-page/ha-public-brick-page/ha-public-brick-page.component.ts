import {Component, OnInit} from '@angular/core';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {HaBrick} from '../../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {Observable} from 'rxjs';
import {HaAuthService} from '../../../../../ha-core/ha-service/ha-auth.service';
import {HaNodeDTO} from '../../../../../ha-core/ha-model/ha-entities/ha-node.class';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';
import {HaNewVersionDTO} from '../../../../../ha-core/ha-model/ha-entities/ha-version.class';
import {HaPublicAddVersionDialogComponent} from './ha-public-add-version-dialog/ha-public-add-version-dialog.component';

@Component({
  selector: 'ha-public-list-bricks-page',
  templateUrl: './ha-public-brick-page.component.html',
  styleUrls: ['./ha-public-brick-page.component.scss']
})
export class HaPublicBrickPageComponent implements OnInit {

  brick$: Observable<HaBrick>;
  activeLink: string;

  constructor(
    private brickService: HaBrickService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: HaAuthService,
    private dialogService: FlDialogService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.brick$ = this.brickService.getByName(params.brickName);
    });
    this.activatedRoute.children[0].url.subscribe((sectionUrl) =>
      this.activeLink = sectionUrl[0].path
    );
  }

  private openNewVersionDialog(brickId: string): void {
    const input: FlFormDialogInput<HaNewVersionDTO> = {
      mode: 'create',
      object: {
        version: null,
        repoType: null,
        commit: null,
        brickId: brickId
      } as HaNewVersionDTO
    };

    this.dialogService.openSmallDialog(HaPublicAddVersionDialogComponent, {data: input}).afterClosed().subscribe(
      (res: HaNodeDTO) => {
        if (res != null) {

        }
      }
    );
  }
}

