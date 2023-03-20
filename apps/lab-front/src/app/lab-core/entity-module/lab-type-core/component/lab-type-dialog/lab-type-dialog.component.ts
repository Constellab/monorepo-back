import {Component, Inject, OnInit} from '@angular/core';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabRouterService} from '../../../../service/lab-router.service';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface LabTypeDialogInput {
  typingName: string;
}

@Component({
  selector: 'lab-type-dialog',
  templateUrl: './lab-type-dialog.component.html',
  styleUrls: ['./lab-type-dialog.component.scss']
})
export class LabTypeDialogComponent implements OnInit {

  type$: Observable<LabTypeEntity>;

  detailRoute: string;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabTypeDialogInput,
              private typeService: LabTypeService) {
    this.detailRoute = LabRouterService.getTechnicalDocRoute(input.typingName);
  }

  ngOnInit(): void {
    this.type$ = this.typeService.getTyping(this.input.typingName);
  }


}
