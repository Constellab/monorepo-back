import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FlDynamicFormGroupComponent} from './fl-dynamic-form-group.component';

describe('FlDynamicFormComponent', () => {
  let component: FlDynamicFormGroupComponent;
  let fixture: ComponentFixture<FlDynamicFormGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFormGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDynamicFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
