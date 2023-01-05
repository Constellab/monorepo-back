import {Component, Inject, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaLabConfig} from '../../../../../ca-core/model/entities/lab/ca-lab-config.class';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CaBrick, CaBrickVersion} from '../../../../../ca-core/model/entities/ca-brick.class';
import {CaBrickService} from '../../../../../ca-core/service-api/ca-brick.service';
import {environment} from '../../../../../../environments/ca-environment';

export interface CaBrickAndVersion {
  brick: CaBrick;

  brickVersion: CaBrickVersion;
}

@Component({
  selector: 'ca-experiment-lab-config-dialog',
  templateUrl: './ca-experiment-lab-config-dialog.component.html',
  styleUrls: ['./ca-experiment-lab-config-dialog.component.scss']
})
export class CaExperimentLabConfigDialogComponent implements OnInit {

  experiment: CaExperiment;

  labConfig: CaLabConfig;

  bricksAndVersions: CaBrickAndVersion[] = [];

  isLoading: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private input: CaExperiment,
    private experimentService: CaExperimentService,
    private brickService: CaBrickService) {
    this.experiment = input;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.experimentService.getExperimentLabConfig(this.experiment.id).subscribe((res: CaLabConfig) => {
      this.labConfig = res;
      this.getBrickAndVersion();
    });
  }

  public getBrickAndVersion(): void {
    for (const bV of this.labConfig.brickVersions) {
      this.isLoading = true;
      this.brickService.getBrickByBrickVersionId(bV.id).subscribe((brick: CaBrick) => {
        this.bricksAndVersions.push({brick: brick, brickVersion: bV});
        this.isLoading = false;
      });
    }
  }

  public getBrickLink(brickAndVersion: CaBrickAndVersion): string {
    const brickName: string = brickAndVersion.brick.name;
    const majorString: string = 'v' + brickAndVersion.brickVersion.version.split('.')[0];
    return `${environment.hubUrl}bricks/${brickName}/${majorString}`;
  }

}
