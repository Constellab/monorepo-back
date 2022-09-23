import {Component, OnInit} from '@angular/core';
import {HaBrick, HaEditBrickDTO} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {ActivatedRoute} from '@angular/router';
import {HaBrickVersion} from '../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';
import {CmVersion} from '@monorepo/common-model';
import {FlDialogService, FlFormDialogInput} from '@monorepo/front-core-lib';
import {HaPublicEditBrickDialogComponent} from '../ha-public-edit-brick-dialog/ha-public-edit-brick-dialog.component';
import {HaReferenceDTO} from '../../../../ha-core/ha-model/ha-entities/ha-version.class';
import {HaBrickVersionService} from '../../../../ha-core/ha-service/ha-brick-version.service';
import {HaAuthenticatedUserService} from '../../../../ha-core/ha-service/ha-authenticated-user.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-public-brick-description-page',
  templateUrl: './ha-public-brick-description.component.html',
  styleUrls: ['./ha-public-brick-description.component.scss']
})
export class HaPublicBrickDescriptionComponent implements OnInit {

  brick: HaBrick;
  latestBrickVersion: HaBrickVersion;
  lastVersion: CmVersion;
  references: HaReferenceDTO[];

  constructor(
    private route: ActivatedRoute,
    private brickService: HaBrickService,
    private brickVersionService: HaBrickVersionService,
    private dialogService: FlDialogService,
    private authUserService: HaAuthenticatedUserService
  ) {
  }

  ngOnInit(): void {
    this.route.parent.params.subscribe(params => {
      this.setLastBrickVersion(params.brickName);
      this.brickService.getByName(params.brickName).subscribe(brick => {
        this.brick = brick;
      });


    });
  }

  private setLastBrickVersion(brickName: string): void {
    this.brickService.getLastVersion(brickName).subscribe(res => {
      this.latestBrickVersion = res;
      this.lastVersion = new CmVersion(res.brickMajorVersion.major, res.minor, res.patch, res.subPatch);
      this.setDirectReferences(res.id);
    });
  }

  private setDirectReferences(brickVersionId: string): void{
    this.brickVersionService.getDirectReferences(brickVersionId).subscribe(res => {
      this.references = res;
    })
  }

  createEditBrickDialog(): void {
    const node: HaEditBrickDTO = new HaEditBrickDTO();
    node.id = this.brick.id;
    node.description = this.brick.description;
    node.gitRepo = this.brick.gitRepo;
    node.pipRepo = this.brick.pipRepo;
    node.visibility = this.brick.visibility;

    const input: FlFormDialogInput<HaEditBrickDTO> = {
      mode: 'update',
      object: node
    };

    this.openSmallDialog(input);
  }

  private openSmallDialog(input: any): void {
    this.dialogService.openSmallDialog(HaPublicEditBrickDialogComponent, {data: input}).afterClosed().subscribe(
      (res: HaBrick) => {
        if (res != null) {
          this.brick = res;
          this.setLastBrickVersion(this.brick.name);
        }
      }
    );
  }

  isAdmin$(): Observable<boolean>{
    return this.authUserService.isAdmin()
  }
}
