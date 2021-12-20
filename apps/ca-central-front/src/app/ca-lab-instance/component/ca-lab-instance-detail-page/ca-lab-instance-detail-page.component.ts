import {Component, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ca-lab-instance-detail-page',
  templateUrl: './ca-lab-instance-detail-page.component.html',
  styleUrls: ['./ca-lab-instance-detail-page.component.scss']
})
export class CaLabInstanceDetailPageComponent implements OnInit {

  labInstance: CaLabInstance;

  isLoading: boolean = false;

  constructor(private labInstanceService: CaLabInstanceService,
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

  private getLabInstanceSuccess(labInstance: CaLabInstance): void {
    this.labInstance = labInstance;
    this.isLoading = false;
  }

  onLabUpdate(lanInstance: CaLabInstance): void {
    this.labInstance = lanInstance;
  }

}
