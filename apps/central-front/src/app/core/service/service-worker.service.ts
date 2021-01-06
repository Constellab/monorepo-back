import {Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {SnackBarService} from './snack-bar.service';
import {NewWebsiteVersionComponent} from '../module/core-component/component/new-website-version/new-website-version.component';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {

  constructor(private swUpdate: SwUpdate,
              private snackBarService: SnackBarService) {
  }

  // check the version of the service worker
  public checkForNewVersion(): void {
    this.swUpdate.available.subscribe(event => {
      console.log('Service Worker : current version is', event.current);
      console.log('Service Worker : available version is', event.available);

      this.snackBarService.openSnackBar(NewWebsiteVersionComponent);
    });
  }
}
