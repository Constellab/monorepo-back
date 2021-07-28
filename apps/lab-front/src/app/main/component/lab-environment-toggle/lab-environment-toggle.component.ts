import {Component, OnInit} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {LabEnvironmentService} from '../../../core/service/lab-environment.service';

@Component({
  selector: 'gen-lab-environment-toggle',
  templateUrl: './lab-environment-toggle.component.html',
  styleUrls: ['./lab-environment-toggle.component.scss']
})
export class LabEnvironmentToggleComponent implements OnInit {

  checked: boolean;

  devApiRunning: boolean = false;

  ready: boolean = false;

  constructor(private labEnvService: LabEnvironmentService) {
  }

  ngOnInit(): void {
    this.checked = this.labEnvService.getLabEnvironment() === 'dev';

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
    console.log(change);
    this.labEnvService.setLabEnvironment(change.checked ? 'dev' : 'prod');
  }

  get disabled(): boolean {
    // only disable the toggle if it is not check and the dev api is not running
    return !this.checked && !this.devApiRunning
  }

  get showHelpMessage(): boolean {
    // show the help message if we checked the api and it is not running
    return !this.checked && !this.devApiRunning;
  }

  // we stop the event propagation on the toggle click to prevent the menu to close
  stopEventPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
