import {Component, OnInit} from '@angular/core';
import {LabSystemService} from '../../../../core/service/lab-system.service';

@Component({
  selector: 'gen-lab-health-check',
  templateUrl: './lab-health-check.component.html',
  styleUrls: ['./lab-health-check.component.scss']
})
export class LabHealthCheckComponent implements OnInit {

  isRunning: boolean;
  isLoading: boolean = true;

  constructor(private systemService: LabSystemService) {
  }

  ngOnInit(): void {
    this.systemService.healthCheck().subscribe(
      () => this.onSuccess(),
      () => this.onError(),
    );
  }

  private onSuccess(): void {
    this.isRunning = true;
    this.isLoading = false;
  }

  private onError(): void {
    this.isRunning = false;
    this.isLoading = false;
  }

}
