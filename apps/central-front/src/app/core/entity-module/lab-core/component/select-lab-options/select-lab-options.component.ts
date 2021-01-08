import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {LabService} from '../../../../../dashboard/service/lab.service';
import {Lab} from '../../../../model/entities/lab.class';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-select-lab-options',
  templateUrl: './select-lab-options.component.html',
  styleUrls: ['./select-lab-options.component.scss']
})
export class SelectLabOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  labs: Lab[];

  isLoading: boolean = false;

  constructor(private labService: LabService,
              @Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.getLabs();
  }

  private getLabs(): void {
    this.isLoading = true;
    this.labService.findAll().subscribe(
      labs => this.getSuccess(labs),
      () => this.isLoading = false
    );
  }

  private getSuccess(labs: Lab[]): void {
    this.isLoading = false;
    this.labs = labs;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
