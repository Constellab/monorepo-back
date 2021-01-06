import {Component, OnInit} from '@angular/core';
import {LabInstance} from '../../../core/model/entities/lab-instance.class';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'gen-lab-instance-detail-page',
  templateUrl: './lab-instance-detail-page.component.html',
  styleUrls: ['./lab-instance-detail-page.component.scss']
})
export class LabInstanceDetailPageComponent implements OnInit {

  labInstance: LabInstance;

  isLoading: boolean = false;

  constructor(private labInstanceService: LabInstanceService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getLabInstance(params.id)
    );
  }

  private getLabInstance(id: string): void {
    this.isLoading = true;
    this.labInstanceService.findById(id).subscribe(
      labInstance => this.getLabInstanceSuccess(labInstance),
      () => this.isLoading = false
    );
  }

  private getLabInstanceSuccess(labInstance: LabInstance): void {
    this.labInstance = labInstance;
    this.isLoading = false;
  }

  onLabUpdate(lanInstance: LabInstance): void {
    this.labInstance = lanInstance;
  }

}
