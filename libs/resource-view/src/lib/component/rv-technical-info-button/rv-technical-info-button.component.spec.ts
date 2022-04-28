import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvTechnicalInfoButtonComponent} from './rv-technical-info-button.component';

describe('LabTechnicalInfoButtonComponent', () => {
  let component: RvTechnicalInfoButtonComponent;
  let fixture: ComponentFixture<RvTechnicalInfoButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvTechnicalInfoButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvTechnicalInfoButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
