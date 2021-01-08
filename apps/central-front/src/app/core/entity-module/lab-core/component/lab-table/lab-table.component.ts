import {Component, OnInit} from '@angular/core';
import {Lab} from '../../../../model/entities/lab.class';
import {LabFormDialogComponent} from '../lab-form-dialog/lab-form-dialog.component';
import {FlDialogService, FlFormDialogInput, FlTableAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-lab-table',
  templateUrl: './lab-table.component.html',
  styleUrls: ['./lab-table.component.scss']
})
export class LabTableComponent extends FlTableAbstractDirective<Lab> implements OnInit {

  constructor(private dialogService: FlDialogService) {
    super(['createdAt', 'lastModifiedAt', 'actions']);
  }

  ngOnInit(): void {
  }

  openUpdateLabDialog(lab: Lab): void {
    const dialogInput: FlFormDialogInput<Lab> = {
      mode: 'update',
      object: lab
    };

    this.dialogService.openSmallDialog(LabFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onUpdateDialogClosed(result)
    );
  }

  private onUpdateDialogClosed(lab?: Lab): void {
    if (lab) {
      this.datasource.updateItem(lab);
    }
  }

}
