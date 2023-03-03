import {Component, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {Observable, of} from 'rxjs';
import {CaLabManagerConfig} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {CaLabConfig} from '../../../ca-core/model/entities/lab/ca-lab-config.class';
import {catchError, map} from 'rxjs/operators';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {FlServerError, FlSnackBarService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-lab-on-premise-config',
  templateUrl: './ca-lab-on-premise-config.component.html',
  styleUrls: ['./ca-lab-on-premise-config.component.scss']
})
export class CaLabOnPremiseConfigComponent implements OnInit {

  labInstanceId: string = this.state.getLabInstanceId();

  labConfig$: Observable<CaLabManagerConfig>;

  constructor(private state: CaLabInstanceDetailPageState,
              private labInstanceService: CaLabInstanceService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.getConfig();
  }

  private getConfig(): void {
    this.labConfig$ = this.labInstanceService.getConfig(this.labInstanceId, true).pipe(
      map(config => this.convertToLabManagerConfig(config)),
      catchError((error: FlServerError) => {
        // if the configuration is not found, we return an empty config
        if (error.nestedError?.code === 'error.lab_config_not_found') {
          return of({
            glabTag: null,
            brickVersions: [],
          });
        } else {
          this.snackBarService.openErrorMessage(error.message);
          throw error;
        }
      })
    );
  }

  private convertToLabManagerConfig(config: CaLabConfig): CaLabManagerConfig {
    return {
      brickVersions: config.brickVersions.map(brickVersion => ({
        version: brickVersion.version,
        name: brickVersion.brick.name,
      })),
      glabTag: null,
    };
  }

}
