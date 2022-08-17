import {Component, OnInit} from '@angular/core';
import {ControlContainer, UntypedFormGroup} from '@angular/forms';

/**
 * Component to use in the search form to create form for a search interval
 */
@Component({
  selector: 'fl-search-date-interval',
  templateUrl: './fl-search-date-interval.component.html',
  styleUrls: ['./fl-search-date-interval.component.scss']
})
export class FlSearchDateIntervalComponent implements OnInit {

  formGp: UntypedFormGroup;

  constructor(private controlContainer: ControlContainer) {
  }

  ngOnInit(): void {
    this.formGp = this.controlContainer.control as UntypedFormGroup;
  }

}
