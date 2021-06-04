import {Component, EventEmitter, OnInit, Optional, Output, Self} from '@angular/core';
import {FlFormFieldDirective} from '@monorepo/front-core-lib';
import {LabBaseEntity} from '../../../../model/global/lab-entity.entity';
import {NgControl} from '@angular/forms';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';

interface BioxResourceSelectInner {
  resourceType: string;
  resource: LabBaseEntity;
}

@Component({
  selector: 'gen-biox-resource-select',
  templateUrl: './biox-resource-select.component.html',
  styleUrls: ['./biox-resource-select.component.scss']
})
export class BioxResourceSelectComponent extends FlFormFieldDirective<BioxResourceSelectInner, LabBaseEntity>
  implements OnInit {

  @Output() resourceChange: EventEmitter<LabBaseEntity> = new EventEmitter();

  formGp: FormGroup<BioxResourceSelectInner>;

  constructor(@Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }

  ngOnInit(): void {
    this.initForm();
    this.toggleResourceDisable();
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      resourceType: [null],
      resource: [null]
    });
  }

  callChangeEvent(value: LabBaseEntity): void {
    this.resourceChange.emit(value);
  }

  onDisableChange(disable: boolean): void {
    if(disable){
      this.formGp.disable();
    }
    else{
      this.formGp.enable();
    }
  }

  writeValue(obj: LabBaseEntity): void {
    this.value = this.convertOuterToInner(obj);
    this.formGp.patchValue(this.value);
  }


  protected convertOuterToInner(outerValue: LabBaseEntity): BioxResourceSelectInner {
    return outerValue == null ? {resourceType: null, resource: null}
      : {resourceType: outerValue.type, resource: outerValue};
  }

  protected convertInnerToOuter(innerValue: BioxResourceSelectInner): LabBaseEntity {
    return innerValue == null || innerValue.resource == null ? null :
      innerValue.resource;
  }

  onResourceTypeChange(): void{
    this.toggleResourceDisable();
    this.formGp.get('resource').patchValue(null);
  }

  toggleResourceDisable(): void {
    if (this.selectedType == null) {
      this.formGp.get('resource').disable();
    } else {
      this.formGp.get('resource').enable();
    }
  }

  onResourceChange(): void {
    this.setAndEmitValue(this.formGp.getRawValue());
  }

  get selectedType(): string {
    return this.formGp.getRawValue().resourceType;
  }
}
