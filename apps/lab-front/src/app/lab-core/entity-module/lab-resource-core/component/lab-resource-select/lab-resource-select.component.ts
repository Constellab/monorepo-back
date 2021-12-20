import {Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {FlFormFieldDirective} from '@monorepo/front-core-lib';
import {NgControl} from '@angular/forms';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';

export interface LabResourceSelect {
  resource_typing_name: string;
  resource_id: string;
}

/**
 * NgModel component that allow user to select a resource form the database
 */
@Component({
  selector: 'lab-resource-select',
  templateUrl: './lab-resource-select.component.html',
  styleUrls: ['./lab-resource-select.component.scss']
})
export class LabResourceSelectComponent extends FlFormFieldDirective<LabResourceSelect>
  implements OnInit {

  // if true, it disabled the resource type input
  @Input() disableResourceType: boolean = false;

  @Output() resourceChange: EventEmitter<LabResourceSelect> = new EventEmitter();

  formGp: FormGroup<LabResourceSelect>;

  constructor(@Optional() @Self() ngControl: NgControl) {
    super(ngControl);
    // init form in constructor because writeValue can be called before ngOnInit
    this.initForm();
  }

  ngOnInit(): void {
    this.toggleResourceDisable();

    if (this.disableResourceType) {
      this.formGp.get('resource_typing_name').disable();
    }
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      resource_typing_name: [null],
      resource_id: [null]
    });
  }

  callChangeEvent(value: LabResourceSelect): void {
    this.resourceChange.emit(value);
  }

  onDisableChange(disable: boolean): void {
    if (disable) {
      this.formGp.disable();
    } else {
      this.formGp.enable();
    }
  }

  writeValue(obj: LabResourceSelect): void {
    this.value = obj ?? {resource_typing_name: null, resource_id: null};
    this.formGp.patchValue(this.value);
    this.toggleResourceDisable();
  }


  onResourceTypeChange(): void {
    this.toggleResourceDisable();
    this.formGp.get('resource_id').patchValue(null);
  }

  toggleResourceDisable(): void {
    if (this.selectedType == null) {
      this.formGp.get('resource_id').disable();
    } else {
      this.formGp.get('resource_id').enable();
    }
  }

  onResourceChange(): void {
    this.setAndEmitValue(this.formGp.getRawValue());
  }

  get selectedType(): string {
    return this.formGp.getRawValue().resource_typing_name;
  }
}
