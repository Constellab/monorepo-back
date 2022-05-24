import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabRouterService} from '../../../../service/lab-router.service';

@Component({
  selector: 'lab-type-dialog',
  templateUrl: './lab-type-dialog.component.html',
  styleUrls: ['./lab-type-dialog.component.scss']
})
export class LabTypeDialogComponent implements OnInit {

  type: LabTypeEntity;

  detailRoute: string;

  constructor(@Inject(MAT_DIALOG_DATA) type: LabTypeEntity) {
    this.type = type;
    this.detailRoute = LabRouterService.getTechnicalDocRoute(type.typingName);
  }

  ngOnInit(): void {
  }

}
