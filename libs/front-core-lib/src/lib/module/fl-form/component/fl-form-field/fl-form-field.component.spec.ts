import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {FlFormFieldComponent} from './fl-form-field.component';

describe('LibFormFieldComponent', () => {
  let component: FlFormFieldComponent;
  let fixture: ComponentFixture<FlFormFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FlFormFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
