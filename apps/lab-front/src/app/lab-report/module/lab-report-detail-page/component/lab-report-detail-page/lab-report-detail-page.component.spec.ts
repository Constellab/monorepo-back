import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportDetailPageComponent} from './lab-report-detail-page.component';

describe('LabReportDetailPageComponent', () => {
  let component: LabReportDetailPageComponent;
  let fixture: ComponentFixture<LabReportDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
