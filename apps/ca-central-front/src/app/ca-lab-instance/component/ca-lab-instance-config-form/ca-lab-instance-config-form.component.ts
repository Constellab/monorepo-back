import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {FlDialogService, FlSnackBarService} from '@monorepo/front-core-lib';
import {
  CaLabManagerBrickVersionDTO,
  CaLabManagerConfig
} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {
  CaLabInstanceConfigBrickComponent
} from '../ca-lab-instance-config-brick/ca-lab-instance-config-brick.component';
import {
  CaBrickVersionDetailDialogComponent,
  CaBrickVersionDetailDialogInput
} from '../../../ca-core/entity-module/ca-brick-core/component/ca-brick-version-detail-dialog/ca-brick-version-detail-dialog.component';

/**
 * Form to update the lab instance config
 */
@Component({
  selector: 'ca-lab-instance-config-form',
  templateUrl: './ca-lab-instance-config-form.component.html',
  styleUrls: ['./ca-lab-instance-config-form.component.scss']
})
export class CaLabInstanceConfigFormComponent implements OnInit {
  @Input() labInstanceId: string;

  @Input() labConfig: CaLabManagerConfig;

  isLoading: boolean = false;

  constructor(private labInstanceService: CaLabInstanceService,
              private snackBarService: FlSnackBarService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  openBrickVersionDetailDialog(brickVersionDTO: CaLabManagerBrickVersionDTO): void {
    const data: CaBrickVersionDetailDialogInput = {
      brickName: brickVersionDTO.name,
      brickVersion: brickVersionDTO.version,
    };

    this.dialogService.openSmallDialog(CaBrickVersionDetailDialogComponent, {data: data});
  }

  openBrickVersionForm(brickVersionDTO?: CaLabManagerBrickVersionDTO): void {
    this.dialogService.openSmallDialog(CaLabInstanceConfigBrickComponent, {data: brickVersionDTO}).afterClosed().subscribe(
      brickVersion => this.onBrickDialogClosed(brickVersionDTO == null ? 'add' : 'update', brickVersion)
    );
  }


  private onBrickDialogClosed(mode: 'add' | 'update', brickVersionDTO?: CaLabManagerBrickVersionDTO,): void {
    if (!brickVersionDTO) return;

    const brick = this.labConfig.brickVersions.find(brickVersion => brickVersion.name === brickVersionDTO.name);
    if (mode === 'add') {
      if (brick) {
        this.snackBarService.openErrorMessage({
          text: 'lab_instance_brick_already_exists',
          translateText: true, translateParam: {param: {brickName: brickVersionDTO.name}}
        });
      }
    }


    // if this is an update
    if (brick) {
      brick.version = brickVersionDTO.version;
    } else {
      this.labConfig.brickVersions.push(brickVersionDTO);
    }

  }

  save(): void {
    if (!this.isLoading) {
      this.updateConfig(this.labConfig);
    }
  }

  private updateConfig(config: CaLabManagerConfig): void {
    this.isLoading = true;
    this.labInstanceService.updateLabManagerConfig(this.labInstanceId, config).subscribe(
      () => this.updateConfigSuccess(),
      () => this.isLoading = false
    );
  }

  private updateConfigSuccess(): void {
    this.isLoading = false;
    this.snackBarService.openSuccessMessage({text: 'lab_instance_config_updated', translateText: true});
  }

  resetToDefault(): void {
    this.labConfig.glabTag = 'latest';
  }
}
