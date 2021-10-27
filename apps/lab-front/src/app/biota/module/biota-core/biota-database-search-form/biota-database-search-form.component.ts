import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {BiotaDatabaseSearch} from '../../../model/biota-database.class';
import {Validators} from '@angular/forms';

@Component({
  selector: 'gen-biota-database-search-form',
  templateUrl: './biota-database-search-form.component.html',
  styleUrls: ['./biota-database-search-form.component.scss']
})
export class BiotaDatabaseSearchFormComponent implements OnInit {

  formGp: FormGroup<BiotaDatabaseSearch>;

  @Output() search: EventEmitter<BiotaDatabaseSearch> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.formGp = new FormBuilder().group({
      typingName: [null, Validators.required],
      searchText: [null, Validators.required]
    });
  }

  submit(): void {
    if (this.formGp.valid) {
      this.search.emit(this.formGp.getRawValue());
    }
  }

}
