import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFormArrayComponent} from './fl-dynamic-form-array.component';

describe('FlDynamicFormArrayComponent', () => {
  let component: FlDynamicFormArrayComponent;
  let fixture: ComponentFixture<FlDynamicFormArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFormArrayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDynamicFormArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
