import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTagDynamicFieldComponent} from './lab-tag-dynamic-field.component';

describe('LabTagDynamicFieldComponent', () => {
  let component: LabTagDynamicFieldComponent;
  let fixture: ComponentFixture<LabTagDynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTagDynamicFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabTagDynamicFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
