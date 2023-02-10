import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {LabDevEnvironmentService} from '../../../lab-core/service/lab-dev-environment.service';
import {Subscription} from 'rxjs';
import {LabEnvStore} from '../../../lab-core/service/lab-env.store';
import {LabRouterService} from '../../../lab-core/service/lab-router.service';
import {Router} from '@angular/router';

@Component({
  selector: 'lab-environment-toggle',
  templateUrl: './lab-environment-toggle.component.html',
  styleUrls: ['./lab-environment-toggle.component.scss']
})
export class LabEnvironmentToggleComponent implements OnInit, OnDestroy {

  checked: boolean;

  devApiRunning: boolean = false;

  ready: boolean = false;

  private subscription: Subscription;

  constructor(private labEnvStore: LabEnvStore,
              private labEnvService: LabDevEnvironmentService,
              private routerService: LabRouterService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.labEnvStore.getLabEnvironment$().subscribe(
      (env) => this.checked = env === 'dev'
    );
    this.checkDevApi();
  }

  // disable the toggle if the dev api is not running
  private checkDevApi(): void {
    this.labEnvService.devApiIsRunning().subscribe(
      isRunning => {
        this.devApiRunning = isRunning;
        this.ready = true;
      }
    );
  }

  toggleChange(change: MatSlideToggleChange): void {
    if (change.checked) {
      this.labEnvService.activateDevEnvironment().subscribe({
        next: result => this.onActivateDevEnvironment(result),
        error: () => this.checked = false
      });
    } else {
      this.labEnvStore.setLabEnvironment('prod');
      this.redirectToExpeirmentList();
    }
  }

  // if there was a problem with the activation, uncheck the checkbox
  private onActivateDevEnvironment(activate: boolean): void {
    if (!activate) {
      this.checked = false;
    } else {
      this.redirectToExpeirmentList();
    }
  }

  private redirectToExpeirmentList(): void {
    if (this.router.isActive(LabRouterService.getExperimentListRoute(),
      {fragment: 'ignored', paths: 'exact', matrixParams: 'ignored', queryParams: 'ignored'})) {
      location.reload();
    } else {
      this.routerService.navigateToExperimentListRoute();
    }
  }


  get disabled(): boolean {
    // only disable the toggle if it is not check and the dev api is not running
    return !this.checked && !this.devApiRunning;
  }

  get showHelpMessage(): boolean {
    // show the help message if we checked the api and it is not running
    return !this.checked && !this.devApiRunning;
  }

  // we stop the event propagation on the toggle click to prevent the menu to close
  stopEventPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
