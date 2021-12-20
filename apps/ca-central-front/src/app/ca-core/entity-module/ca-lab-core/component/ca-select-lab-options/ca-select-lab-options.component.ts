import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {CaLabService} from '../../../../service-api/ca-lab.service';
import {CaLab} from '../../../../model/entities/ca-lab.class';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-select-lab-options',
  templateUrl: './ca-select-lab-options.component.html',
  styleUrls: ['./ca-select-lab-options.component.scss']
})
export class CaSelectLabOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  labs: CaLab[];

  isLoading: boolean = false;

  constructor(private labService: CaLabService,
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

  private getSuccess(labs: CaLab[]): void {
    this.isLoading = false;
    this.labs = labs;
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }


}
