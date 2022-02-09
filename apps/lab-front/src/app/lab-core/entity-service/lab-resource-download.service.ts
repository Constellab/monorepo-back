import {Injectable} from '@angular/core';
import {LabResource} from '../model/entities/resource/lab-resource.entity';
import {FlDialogService, FlPortalActionsService} from '@monorepo/front-core-lib';
import {LabFileResourceService} from './lab-file-resource.service';
import {LabResourceService} from './lab-resource.service';
import {LabProcessType} from '../model/entities/lab-type/lab-process-type.entity';
import {
  LabConfigureSpecsFormDialogComponent,
  LabConfigureSpecsFormDialogInput
} from '../entity-module/lab-config-core/component/lab-configure-specs-form-dialog/lab-configure-specs-form-dialog.component';
import {LabConfigData, LabConfigValues} from '../model/entities/lab-config.entity';
import {Observable, of} from 'rxjs';
import {mergeMap, tap} from 'rxjs/operators';

/**
 * Service to download any downloadable resource
 */
@Injectable({providedIn: 'root'})
export class LabResourceDownloadService {

  private readonly downloadAction = 'download-resource';

  constructor(private resourceService: LabResourceService,
              private dialogService: FlDialogService,
              private fileService: LabFileResourceService,
              private actionService: FlPortalActionsService) {
  }

  /**
   * Download any downloadable resource
   * @param resource
   */
  public downloadResource(resource: LabResource): void {

    // if it's a fsNode, directly download it, otherwise, call exporter
    if (resource.isFsNode()) {
      this.fileService.downloadFile(resource.id);
      return;
    }

    this.actionService.addAction({
      type: this.downloadAction,
      text: {text: 'biox.preparing_resource_download', translateText: true},
      action: this.downloadBasicResource(resource)
    }, true);
  }

  private downloadBasicResource(resource: LabResource): Observable<any> {
    return this.resourceService.getResourceExporterConfig(resource.resourceTypingName).pipe(
      mergeMap(type => this.openExporterConfig(resource, type))
    );
  }

  /**
   * Once we got the configuration of the task, open the Dialog to configure it
   * @param resource
   * @param exporterType
   * @private
   */
  private openExporterConfig(resource: LabResource, exporterType: LabProcessType): Observable<void> {

    // if there is no config, call it directly without config
    if (!exporterType.hasConfigSpecs()) {
      this.callDownloadResource(resource.id, exporterType.typingName, {});
      return of(null);
    }

    const input: LabConfigureSpecsFormDialogInput = {
      configData: LabConfigData.fromSpecs(exporterType.getConfigSpecs()),
      title: 'biox.download_resource_title',
      submitButtonText: 'biox.download_resource',
    };

    // open the configuration dialog
    return this.dialogService.openMediumDialog(LabConfigureSpecsFormDialogComponent, {data: input})
      .afterClosed().pipe(
        tap(config => this.callDownloadResource(resource.id, exporterType.typingName, config))
      );
  }

  // on dialog closed, download the resource with the configuration (if it exists)
  private callDownloadResource(resourceId: string, exporterTypingName: string, config?: LabConfigValues): void {
    // cancel the process
    if (config == null) {
      throw Error('Canceled');
    }

    this.resourceService.downloadResource(resourceId, exporterTypingName, config);
  }
}
