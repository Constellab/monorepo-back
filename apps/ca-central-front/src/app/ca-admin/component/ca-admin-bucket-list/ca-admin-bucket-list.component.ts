import {Component, OnInit} from '@angular/core';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaBucketFull, CaBucketFullDatasource} from '../../../ca-core/model/entities/ca-object-storage.class';
import {CaObjectStorageService} from '../../../ca-core/service-api/ca-object-storage.service';
import {
  CaBucketFormDialogComponent,
  CaBucketFormDialogInput
} from '../../../ca-core/entity-module/ca-object-storage-core/component/ca-bucket-form-dialog/ca-bucket-form-dialog.component';

@Component({
  selector: 'ca-admin-bucket-list',
  templateUrl: './ca-admin-bucket-list.component.html',
  styleUrls: ['./ca-admin-bucket-list.component.scss']
})
export class CaAdminBucketListComponent implements OnInit {

  buckets: CaBucketFullDatasource = this.objectStorageService.getAllBucketsDatasource();

  displayedColumns: FlTableColumn<CaBucketFull>[] =
    ['name', 'contentType', 'region', 'space', 'credentials', 'lastModified', 'actions'];

  constructor(private objectStorageService: CaObjectStorageService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openCreateDialog(): void {
    const input: CaBucketFormDialogInput = {
      mode: 'create',
    };

    this.dialogService.openSmallDialog(CaBucketFormDialogComponent, {data: input}).afterClosed().subscribe(
      credentials => this.onCreateClosed(credentials)
    );
  }

  private onCreateClosed(bucket?: CaBucketFull): void {
    if (bucket) {
      this.buckets.addItem(bucket);
    }
  }


}
