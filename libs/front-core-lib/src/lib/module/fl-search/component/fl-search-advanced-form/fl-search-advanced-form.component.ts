import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlFormInputsManagerConfig} from '../../../fl-form-inputs-manager/fl-form-inputs-manager.class';
import {FlSearchState} from '../../model/fl-search.state';

/**
 * Component to place under the {@link FlSearchComponent} and this contains the advanced search form
 */
@Component({
  selector: 'fl-search-advanced-form',
  templateUrl: './fl-search-advanced-form.component.html',
  styleUrls: ['./fl-search-advanced-form.component.scss']
})
export class FlSearchAdvancedFormComponent implements OnInit {

  formGp: FormGroup;

  formInputConfig: FlFormInputsManagerConfig;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.formInputConfig = this.searchState.getConfig().advancedSearchFormManagerConfig;
    this.formGp = this.searchState.advancedSearchFormGroup;
  }

  submit(): void {
    if (this.formGp.valid) {
      this.searchState.callAdvancedSearchFromForm();
    }
  }
}
