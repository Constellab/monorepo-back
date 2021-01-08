import {Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {FlSnackBarService} from '../module/fl-snack-bar/fl-snack-bar.service';
import {FlNewWebsiteVersionComponent} from '../module/fl-core-component/component/fl-new-website-version/fl-new-website-version.component';

@Injectable({
  providedIn: 'root'
})
export class FlServiceWorkerService {

  constructor(private swUpdate: SwUpdate,
              private snackBarService: FlSnackBarService) {
  }

  // check the version of the service worker
  public checkForNewVersion(): void {
    this.swUpdate.available.subscribe(event => {
      console.log('Service Worker : current version is', event.current);
      console.log('Service Worker : available version is', event.available);

      this.snackBarService.openSnackBar(FlNewWebsiteVersionComponent);
    });
  }
}
