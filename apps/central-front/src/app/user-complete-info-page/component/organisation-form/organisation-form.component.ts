import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@ngneat/reactive-forms';
import {Organization} from '../../../core/model/entities/organization.class';
import {Validators} from '@angular/forms';

@Component({
  selector: 'gen-organisation-form',
  templateUrl: './organisation-form.component.html',
  styleUrls: ['./organisation-form.component.scss']
})
export class OrganisationFormComponent implements OnInit {

  @Input() formGp: FormGroup<Partial<Organization>>

  constructor() { }

  ngOnInit(): void {
    this.initGroup();
  }

  private initGroup(): void{
    this.formGp.addControl('label', new FormControl(null, Validators.required));
  }
}
