import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlDynamicFormComponent } from './fl-dynamic-form.component';

describe('FlDynamicFormComponent', () => {
  let component: FlDynamicFormComponent;
  let fixture: ComponentFixture<FlDynamicFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlDynamicFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
