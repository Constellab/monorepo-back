import {Component, OnInit} from '@angular/core';
import {CaSmartDbService} from '../../../service/ca-smart-db.service';
import {FlDialogService} from '@monorepo/front-core-lib';
import {CaSmartDbImportDialogComponent} from '../ca-smart-db-import-dialog/ca-smart-db-import-dialog.component';

/**
 * Component to manage the smart DB (export, import)
 */
@Component({
  selector: 'ca-smart-db-management',
  templateUrl: './ca-smart-db-management.component.html',
  styleUrls: ['./ca-smart-db-management.component.scss']
})
export class CaSmartDbManagementComponent implements OnInit {

  downloadUrl: string;

  constructor(private smartDbService: CaSmartDbService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.downloadUrl = this.smartDbService.getDownloadSmartDbLink();
  }

  openUploadDialog(): void {
    this.dialogService.openSmallDialog(CaSmartDbImportDialogComponent);
  }

}
