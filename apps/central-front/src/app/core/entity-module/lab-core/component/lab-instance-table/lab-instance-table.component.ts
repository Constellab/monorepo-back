import {Component, OnInit} from '@angular/core';
import {LabInstance} from '../../../../model/entities/lab-instance.class';
import {TableAbstractDirective} from '../../../../abstract-directive/table-abstract.directive';
import {FormDialogInput} from '../../../../model/global/form.class';
import {DialogService} from '../../../../service/dialog.service';
import {LabInstanceFormDialogComponent} from '../lab-instance-form-dialog/lab-instance-form-dialog.component';


@Component({
  selector: 'gen-lab-instance-table',
  templateUrl: './lab-instance-table.component.html',
  styleUrls: ['./lab-instance-table.component.scss']
})
export class LabInstanceTableComponent extends TableAbstractDirective<LabInstance> implements OnInit {

  constructor(private dialogService: DialogService) {
    super(['lab', 'owner', 'createdBy', 'currentStatus', 'serverInfo', 'createdBy', 'actions']);
  }

  ngOnInit(): void {
  }

  openUpdateDialog(labInstance: LabInstance): void {
    const dialogInput: FormDialogInput<LabInstance> = {
      mode: 'update', object: labInstance
    };

    this.dialogService.openSmallDialog(LabInstanceFormDialogComponent, {data: dialogInput})
      .afterClosed().subscribe(
      result => this.onUpdateClosed(result)
    );
  }

  private onUpdateClosed(labInstance?: LabInstance): void {
    if (labInstance) {
      this.datasource.updateItem(labInstance);
    }
  }

}
