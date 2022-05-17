import {Component, OnInit} from '@angular/core';
import {LabSystemService} from '../../../../lab-core/service/lab-system.service';
import {LabSystemInfo} from '../../../../lab-core/model/global/lab-system.class';

@Component({
  selector: 'lab-info',
  templateUrl: './lab-info.component.html',
  styleUrls: ['./lab-info.component.scss']
})
export class LabInfoComponent implements OnInit {

  labInfo: LabSystemInfo;
  isLoading: boolean = true;

  constructor(private systemService: LabSystemService) {
  }

  ngOnInit(): void {
    this.systemService.getSystemInfo().subscribe(
      {
        next: labInfo => this.onSuccess(labInfo),
        error: () => this.onError()
      }
    );
  }

  private onSuccess(labInfo: LabSystemInfo): void {
    this.labInfo = labInfo;
    this.isLoading = false;
  }

  private onError(): void {
    this.labInfo = null;
    this.isLoading = false;
  }

}
