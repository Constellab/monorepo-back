import {Component, Input, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

/**
 * Component to show a big radio button with text inside
 */
@Component({
  selector: 'fl-radio-button-big',
  templateUrl: './fl-radio-button-big.component.html',
  styleUrls: ['./fl-radio-button-big.component.scss']
})
export class FlRadioButtonBigComponent implements OnInit {

  @Input() value: any;

  @Input() color: ThemePalette = 'primary';

  constructor() {
  }

  ngOnInit(): void {
  }

}
