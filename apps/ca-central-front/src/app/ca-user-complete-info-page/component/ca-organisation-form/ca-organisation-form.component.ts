import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@ngneat/reactive-forms';
import {CaOrganization} from '../../../ca-core/model/entities/ca-organization.class';
import {Validators} from '@angular/forms';

@Component({
  selector: 'ca-organisation-form',
  templateUrl: './ca-organisation-form.component.html',
  styleUrls: ['./ca-organisation-form.component.scss']
})
export class CaOrganisationFormComponent implements OnInit {

  @Input() formGp: FormGroup<Partial<CaOrganization>>

  constructor() { }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(): void{
    this.formGp.addControl('label', new FormControl(null, Validators.required));
  }
}
