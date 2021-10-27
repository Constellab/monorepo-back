import {Component, Inject, OnInit} from '@angular/core';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface FlPrettyJsonDialogInput {
  title: string;
  translateTitle: boolean;
  object: any;
}

@Component({
  selector: 'fl-pretty-json-dialog',
  templateUrl: './fl-pretty-json-dialog.component.html',
  styleUrls: ['./fl-pretty-json-dialog.component.scss']
})
export class FlPrettyJsonDialogComponent implements OnInit {

  title: string;
  object: any;

  constructor(@Inject(MAT_DIALOG_DATA) input: FlPrettyJsonDialogInput,
              private translateService: FlTranslateService) {
    this.title = input.translateTitle ? translateService.translate(input.title) : input.title;
    this.object = input.object;
  }

  ngOnInit(): void {
  }

}
