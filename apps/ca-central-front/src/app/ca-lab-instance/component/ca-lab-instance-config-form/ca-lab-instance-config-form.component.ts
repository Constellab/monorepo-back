import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
import {CaBrickGWS} from '../../../ca-core/model/entities/ca-brick.class';
import {CaLabInstanceType} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';

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

  @Input() labType: CaLabInstanceType;

  @Input() labConfig: CaLabManagerConfig;

  @Input() showAdvanced: boolean = true;

  @Output() labConfigured: EventEmitter<void> = new EventEmitter<void>();

  isLoading: boolean = false;

  configChanged: boolean = false;

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
    if (mode === 'add' && brick) {
      this.snackBarService.openErrorMessage({
        text: 'lab_instance_brick_already_exists',
        translateText: true, translateParam: {param: {brickName: brickVersionDTO.name}}
      });
      return;
    }


    // if this is an update
    if (brick) {
      brick.version = brickVersionDTO.version;
    } else {
      this.labConfig.brickVersions.push(brickVersionDTO);
    }
    this.configChanged = true;

  }

  save(): void {
    if (!this.isLoading) {
      this.updateConfig(this.labConfig);
    }
  }

  private updateConfig(config: CaLabManagerConfig): void {
    this.isLoading = true;
    this.labInstanceService.updateConfig(this.labInstanceId, config).subscribe(
      () => this.updateConfigSuccess(),
      () => this.isLoading = false
    );
  }

  private updateConfigSuccess(): void {
    this.isLoading = false;
    if (this.labType === 'CLOUD') {
      this.snackBarService.openSuccessMessage({text: 'lab_instance_cloud_config_updated', translateText: true}, 10000);
    } else {
      this.snackBarService.openSuccessMessage({text: 'lab_instance_on_premise_config_updated', translateText: true}, 10000);
    }
    this.configChanged = false;
    this.labConfigured.emit();
  }

  resetToDefault(): void {
    this.labConfig.glabTag = 'latest';
  }

  isConfigured(): boolean {
    return this.labConfig?.brickVersions?.length > 0 &&
      this.labConfig.brickVersions.find(brick => brick.name === CaBrickGWS.GWS_CORE) != null;
  }
}
