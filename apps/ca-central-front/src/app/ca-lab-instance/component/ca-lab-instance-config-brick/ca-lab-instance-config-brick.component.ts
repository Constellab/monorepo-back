import {Component, OnInit} from '@angular/core';
import {CaBrick, CaRepoType} from '../../../ca-core/model/entities/ca-brick.class';

export interface CaLabInstanceConfigBrickForm{
  brick: CaBrick;
  repoType: CaRepoType;

}

@Component({
  selector: 'ca-lab-instance-config-brick',
  templateUrl: './ca-lab-instance-config-brick.component.html',
  styleUrls: ['./ca-lab-instance-config-brick.component.scss']
})
export class CaLabInstanceConfigBrickComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
