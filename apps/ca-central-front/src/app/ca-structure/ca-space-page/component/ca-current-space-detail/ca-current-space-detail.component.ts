import {Component, OnInit} from '@angular/core';
import {CaSaveSpaceDTO, CaSpace} from '../../../../ca-core/model/entities/ca-space.class';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput
} from '@monorepo/front-core-lib';
import {
  CaSpaceFormDialogComponent
} from '../../../../ca-core/entity-module/ca-space-core/component/ca-space-form-dialog/ca-space-form-dialog.component';
import {CaSpaceService} from '../../../../ca-core/service-api/ca-space.service';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';
import {
  CaSpaceUploadPhotoDialogComponent,
  CaSpaceUploadPhotoDialogInput
} from '../ca-space-upload-photo-dialog/ca-space-upload-photo-dialog.component';
import {CaCurrentSpaceService} from '../../../../ca-core/service-api/ca-current-space.service';
import {Observable} from 'rxjs';
import {CaRequestNewLicensesComponent} from '../ca-request-new-licenses/ca-request-new-licenses.component';

/**
 * Show all the information about an space
 */
@Component({
  selector: 'ca-current-space-detail',
  templateUrl: './ca-current-space-detail.component.html',
  styleUrls: ['./ca-current-space-detail.component.scss']
})
export class CaCurrentSpaceDetailComponent implements OnInit {

  space$: Observable<CaSpace>;

  constructor(private dialogService: FlDialogService,
              private spaceService: CaSpaceService,
              private currentSpaceService: CaCurrentSpaceService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.space$ = this.currentSpaceService.getCurrentSpace$();
  }

  openUploadPhotoDialog(space: CaSpace): void {
    const data: CaSpaceUploadPhotoDialogInput = {
      spaceId: space.id
    };

    this.dialogService.openSmallDialog(CaSpaceUploadPhotoDialogComponent,
      {data: data}).afterClosed().subscribe(
      (result: CaSpace) => this.onUploadPhotoClosed(result));
  }

  private onUploadPhotoClosed(space?: CaSpace): void {
    if (space) {
      this.currentSpaceService.setCurrentSpace(space);
    }
  }

  openUpdateDialog(space: CaSpace): void {
    const data: FlFormDialogInput<CaSaveSpaceDTO> = {
      mode: 'update',
      object: {
        id: space.id,
        name: space.name,
        domain: space.domain,
        nbLicenses: space.nbLicenses
      }
    };

    this.dialogService.openSmallDialog(CaSpaceFormDialogComponent, {data: data}).afterClosed().subscribe(
      space => this.onUpdateClosed(space)
    );
  }

  private onUpdateClosed(space?: CaSpace): void {
    if (space) {
      this.currentSpaceService.setCurrentSpace(space);
    }
  }

  openDeleteSpace(space: CaSpace): void {
    const data: FlConfirmDialogInput = {
      title: 'delete_space',
      content: 'delete_space_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceService.deleteById(space.id),
      successMessage: 'space_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteClosed(result)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.routerService.navigateToAdmin();
    }
  }

  openRequestNewLicense(space: CaSpace): void {
    this.dialogService.openMediumDialog(CaRequestNewLicensesComponent, {data: space.id});
  }

}
