import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDbService} from '../../../../ca-core/service-api/ca-smart-db.service';
import {FlConfirmDialogInput, FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';
import {
  CaSmartDbImportDialogComponent,
  CaSmartDbImportDialogInput
} from '../ca-smart-db-import-dialog/ca-smart-db-import-dialog.component';
import {CaSmartDb} from '../../../../ca-core/model/entities/ca-smart-db.entity';
import {
  CaSmartDbFormDialogComponent,
  CaSmartDbFormDialogInput
} from '../../../../ca-core/entity-module/ca-smart-db-core/component/ca-smart-db-form-dialog/ca-smart-db-form-dialog.component';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';

/**
 * Component to manage the smart DB (export, import)
 */
@Component({
  selector: 'ca-smart-db-management',
  templateUrl: './ca-smart-db-management.component.html',
  styleUrls: ['./ca-smart-db-management.component.scss']
})
export class CaSmartDbManagementComponent implements OnInit {

  @Input() smartDb: CaSmartDb;

  downloadUrl: string;

  constructor(private smartDbService: CaSmartDbService,
              private dialogService: FlDialogService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.downloadUrl = this.smartDbService.getDownloadSmartDbLink(this.smartDb.id);
  }

  openUploadDialog(): void {
    const data: CaSmartDbImportDialogInput = {smartDbId: this.smartDb.id};
    this.dialogService.openSmallDialog(CaSmartDbImportDialogComponent, {data: data});
  }

  openSmartDbUpdateDialog(): void {
    const input: CaSmartDbFormDialogInput = {
      mode: 'update',
      object: {
        id: this.smartDb.id,
        name: this.smartDb.name,
        type: this.smartDb.type.value,
        group: this.smartDb.group
      }
    };

    this.dialogService.openSmallDialog(CaSmartDbFormDialogComponent, {data: input}).afterClosed().subscribe(
      newSmartDb => this.onSmartDbUpdateDialogClosed(newSmartDb)
    );
  }

  private onSmartDbUpdateDialogClosed(newSmartDb?: CaSmartDb): void {
    if (newSmartDb) {
      this.smartDb.name = newSmartDb.name;
      this.smartDb.type = newSmartDb.type;
    }
  }

  openSmartDbDeleteDialog(): void {
    const input: FlConfirmDialogInput = {
      title: 'smart_db.delete_smart_db',
      content: `smart_db.delete_smart_db_confirm`,
      translateTitleAndContent: true,
      observable: this.smartDbService.delete(this.smartDb.id),
      successMessage: 'smart_db.smart_db_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult<void>): void {
    if (result.choice) {
      this.routerService.navigateToMySmartDbs();
    }
  }
}
