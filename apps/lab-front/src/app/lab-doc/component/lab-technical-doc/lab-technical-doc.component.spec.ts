import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTechnicalDocComponent} from './lab-technical-doc.component';

describe('LabTechnicalDocComponent', () => {
  let component: LabTechnicalDocComponent;
  let fixture: ComponentFixture<LabTechnicalDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTechnicalDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTechnicalDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
