import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFieldComponent} from './fl-dynamic-field.component';

describe('FlDynamicInputComponent', () => {
  let component: FlDynamicFieldComponent;
  let fixture: ComponentFixture<FlDynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDynamicFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
