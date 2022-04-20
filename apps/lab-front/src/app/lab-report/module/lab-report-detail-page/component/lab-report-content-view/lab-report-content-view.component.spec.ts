import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportContentViewComponent} from './lab-report-content-view.component';

describe('LabReportContentViewComponent', () => {
  let component: LabReportContentViewComponent;
  let fixture: ComponentFixture<LabReportContentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportContentViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportContentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
