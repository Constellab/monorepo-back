import {Component, OnInit} from '@angular/core';
import {TableAbstractDirective} from '../../../../abstract-directive/table-abstract.directive';
import {Lab} from '../../../../model/entities/lab.class';
import {DialogService} from '../../../../service/dialog.service';
import {FormDialogInput} from '../../../../model/global/form.class';
import {LabFormDialogComponent} from '../lab-form-dialog/lab-form-dialog.component';

@Component({
  selector: 'gen-lab-table',
  templateUrl: './lab-table.component.html',
  styleUrls: ['./lab-table.component.scss']
})
export class LabTableComponent extends TableAbstractDirective<Lab> implements OnInit {

  constructor(private dialogService: DialogService) {
    super(['createdAt', 'lastModifiedAt', 'actions']);
  }

  ngOnInit(): void {
  }

  openUpdateLabDialog(lab: Lab): void {
    const dialogInput: FormDialogInput<Lab> = {
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
