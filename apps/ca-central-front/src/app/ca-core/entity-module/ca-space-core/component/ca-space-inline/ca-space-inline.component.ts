import {Component, Input, OnInit} from '@angular/core';
import {CaSpace} from '../../../../model/entities/space/ca-space.class';

@Component({
  selector: 'ca-space-inline',
  templateUrl: './ca-space-inline.component.html',
  styleUrls: ['./ca-space-inline.component.scss']
})
export class CaSpaceInlineComponent implements OnInit {

  @Input() space: CaSpace;

  constructor() { }

  ngOnInit(): void {
  }

}
