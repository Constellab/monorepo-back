import {Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {FlSnackBarService} from '../module/fl-snack-bar/fl-snack-bar.service';
import {
  FlNewWebsiteVersionComponent
} from '../module/fl-core-component/component/fl-new-website-version/fl-new-website-version.component';
import {filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FlServiceWorkerService {

  constructor(private swUpdate: SwUpdate,
              private snackBarService: FlSnackBarService) {
  }

  // check the version of the service worker
  public checkForNewVersion(): void {
    this.swUpdate.versionUpdates.pipe(
      filter(versionEvent => versionEvent.type === 'VERSION_READY')
    ).subscribe(() => {
      this.snackBarService.openSnackBar(FlNewWebsiteVersionComponent);
    });
  }
}
