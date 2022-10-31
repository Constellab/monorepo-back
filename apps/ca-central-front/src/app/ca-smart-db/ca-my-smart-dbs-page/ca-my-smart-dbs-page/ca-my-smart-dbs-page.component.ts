import {Component, OnInit} from '@angular/core';
import {CaSmartDb, CaSmartDbDatasource} from '../../../ca-core/model/entities/ca-smart-db.entity';
import {CaSmartDbService} from '../../../ca-core/service-api/ca-smart-db.service';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaSmartDbFormDialogComponent,
  CaSmartDbFormDialogInput
} from '../../../ca-core/entity-module/ca-smart-db-core/component/ca-smart-db-form-dialog/ca-smart-db-form-dialog.component';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

/**
 * Page to list the smart dbs of the user
 */
@Component({
  selector: 'ca-my-smart-dbs-page',
  templateUrl: './ca-my-smart-dbs-page.component.html',
  styleUrls: ['./ca-my-smart-dbs-page.component.scss']
})
export class CaMySmartDbsPageComponent implements OnInit {

  smartDbs$: CaSmartDbDatasource;

  constructor(private smartDbService: CaSmartDbService,
              private dialogService: FlDialogService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.smartDbs$ = this.smartDbService.getCurrentSmartDbsDatasource(20);
  }

  openCreateSmartDbDialog(): void {
    const input: CaSmartDbFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaSmartDbFormDialogComponent, {data: input}).afterClosed().subscribe(
      smartDb => this.onCreateSmartDbClosed(smartDb)
    );
  }

  private onCreateSmartDbClosed(smartDb?: CaSmartDb): void {
    if (smartDb) {
      this.routerService.navigateToSmartDbDetail(smartDb.id);
    }
  }

}
