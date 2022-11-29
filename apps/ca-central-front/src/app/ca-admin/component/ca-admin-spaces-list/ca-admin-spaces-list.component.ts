import {Component, OnInit} from '@angular/core';
import {CaSpace, CaSpaceDatasource} from '../../../ca-core/model/entities/ca-space.class';
import {CaSpaceService} from '../../../ca-core/service-api/ca-space.service';
import {FlConfirmDialogInput, FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaSpaceFormDialogComponent
} from '../../../ca-core/entity-module/ca-space-core/component/ca-space-form-dialog/ca-space-form-dialog.component';

@Component({
  selector: 'ca-admin-spaces-list',
  templateUrl: './ca-admin-spaces-list.component.html',
  styleUrls: ['./ca-admin-spaces-list.component.scss']
})
export class CaAdminSpacesListComponent implements OnInit {

  spaces: CaSpaceDatasource;

  columns: FlTableColumn<CaSpace>[] = ['name', 'created', 'lastModified', 'type', 'detail'];

  constructor(private spaceService: CaSpaceService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.spaces = this.spaceService.getAllDatasource();
  }

  createSpace(): void {
    const input: FlFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaSpaceFormDialogComponent, {data: input}).afterClosed().subscribe(
      version => this.onCreateClosed(version)
    );
  }

  private onCreateClosed(space?: CaSpace): void {
    if (space) {
      this.spaces.addItem(space, () => true);
    }
  }

  generateAllUserPersonalSpaces(): void {
    const data: FlConfirmDialogInput = {
      title: 'generate_all_user_space',
      content: 'generate_all_user_space_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceService.generateAllUserPersonalSpace(),
      successMessage: 'all_user_space_generated',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data);
  }

}
