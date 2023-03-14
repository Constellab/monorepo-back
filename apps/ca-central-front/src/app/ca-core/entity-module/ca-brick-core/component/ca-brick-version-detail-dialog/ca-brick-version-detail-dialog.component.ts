import {Component, Inject, OnInit} from '@angular/core';
import {CaBrickService} from '../../../../service-api/ca-brick.service';
import {Observable} from 'rxjs';
import {CaBrickVersion} from '../../../../model/entities/ca-brick.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface CaBrickVersionDetailDialogInput {
  brickName: string;
  brickVersion: string;
}

/**
 * Simple dialog to load brick version detail and show it
 */
@Component({
  selector: 'ca-brick-version-detail-dialog',
  templateUrl: './ca-brick-version-detail-dialog.component.html',
  styleUrls: ['./ca-brick-version-detail-dialog.component.scss']
})
export class CaBrickVersionDetailDialogComponent implements OnInit {

  brickVersion$: Observable<CaBrickVersion>;
  brickName: string;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaBrickVersionDetailDialogInput,
              private brickService: CaBrickService) { }

  ngOnInit(): void {
    this.brickVersion$ = this.brickService.getBrickVersion(this.input.brickName, this.input.brickVersion);
    this.brickName = this.input.brickName;
  }

}
