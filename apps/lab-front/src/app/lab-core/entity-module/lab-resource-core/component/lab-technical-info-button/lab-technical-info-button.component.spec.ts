import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTechnicalInfoButtonComponent} from './lab-technical-info-button.component';

describe('LabTechnicalInfoButtonComponent', () => {
  let component: LabTechnicalInfoButtonComponent;
  let fixture: ComponentFixture<LabTechnicalInfoButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTechnicalInfoButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTechnicalInfoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
