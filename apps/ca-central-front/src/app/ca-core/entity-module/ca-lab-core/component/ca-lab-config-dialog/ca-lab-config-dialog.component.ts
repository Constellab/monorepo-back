import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaLabConfig} from '../../../../model/entities/lab/ca-lab-config.class';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';


export type CaLabConfigDialogInput = Observable<CaLabConfig>;

/**
 * Show the configuration of a lab
 */
@Component({
  selector: 'ca-lab-config-dialog',
  templateUrl: './ca-lab-config-dialog.component.html',
  styleUrls: ['./ca-lab-config-dialog.component.scss']
})
export class CaLabConfigDialogComponent implements OnInit {

  labConfig$: Observable<CaLabConfig>;

  constructor(@Inject(MAT_DIALOG_DATA) input: CaLabConfigDialogInput) {
    this.labConfig$ = input;
  }

  ngOnInit(): void {
  }

}
