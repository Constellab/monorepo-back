import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'fl-chip',
  templateUrl: './fl-chip.component.html',
  styleUrls: ['./fl-chip.component.scss']
})
export class FlChipComponent implements OnInit {

  @HostBinding('class')
  @Input() size: 'normal' | 'small' = 'normal';

  constructor() { }

  ngOnInit(): void {
  }

}
