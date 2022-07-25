import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabObjectValidationInfoComponent} from './lab-object-validation-info.component';

describe('LabObjectValidationInfoComponent', () => {
  let component: LabObjectValidationInfoComponent;
  let fixture: ComponentFixture<LabObjectValidationInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabObjectValidationInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabObjectValidationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
