import {Component, Inject, OnInit} from '@angular/core';
import {HaBrickVersion} from '../../../../ha-core/ha-model/ha-entities/ha-brick-version.class';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {HaBrickVersionReferenceState, HaReferenceDTO} from '../../../../ha-core/ha-model/ha-entities/ha-version.class';
import {HaBrickVersionService} from '../../../../ha-core/ha-service/ha-brick-version.service';
import {HaAuthenticatedUserService} from '../../../../ha-core/ha-service/ha-authenticated-user.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-public-brick-version-detail-dialog',
  templateUrl: './ha-public-brick-version-detail-dialog.component.html',
  styleUrls: ['./ha-public-brick-version-detail-dialog.component.scss']
})
export class HaPublicBrickVersionDetailDialogComponent implements OnInit {

  bv: HaBrickVersion;

  references: HaReferenceDTO[];

  directReferences: HaReferenceDTO[] = [];

  indirectReferences: HaReferenceDTO[] = [];


  constructor(
    @Inject(MAT_DIALOG_DATA)
    private input: HaBrickVersion,
    private brickVersionService: HaBrickVersionService,
    private authUserService: HaAuthenticatedUserService
  ) {
  }

  ngOnInit(): void {
    this.bv = this.input;
    this.brickVersionService.getAllReferences(this.bv.id).subscribe((res) => {
      this.references = res;
      for(const r of this.references){
        if(r.referenceState == HaBrickVersionReferenceState.DIRECT) this.directReferences.push(r);
        else this.indirectReferences.push(r);
        console.log(this.directReferences, this.indirectReferences)
      }
    });
  }

  isAdmin$(): Observable<boolean>{
    return this.authUserService.isAdmin();
  }


}
