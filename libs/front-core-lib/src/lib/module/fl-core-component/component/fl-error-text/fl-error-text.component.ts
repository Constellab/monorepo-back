import {Component, Input, OnInit} from '@angular/core';

/**
 * Simple component to show an error message
 */
@Component({
  selector: 'fl-error-text',
  templateUrl: './fl-error-text.component.html',
  styleUrls: ['./fl-error-text.component.scss']
})
export class FlErrorTextComponent implements OnInit {

  @Input() errorMessage: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
