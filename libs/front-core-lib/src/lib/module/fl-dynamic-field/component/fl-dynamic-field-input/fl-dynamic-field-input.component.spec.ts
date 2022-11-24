import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFieldInputComponent} from './fl-dynamic-field-input.component';

describe('FlDynamicFieldInputComponent', () => {
  let component: FlDynamicFieldInputComponent;
  let fixture: ComponentFixture<FlDynamicFieldInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFieldInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlDynamicFieldInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
