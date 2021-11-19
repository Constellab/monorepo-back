import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlFormInputsManagerComponent } from './fl-form-inputs-manager.component';

describe('FlFormInputsManagerComponent', () => {
  let component: FlFormInputsManagerComponent;
  let fixture: ComponentFixture<FlFormInputsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlFormInputsManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlFormInputsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
