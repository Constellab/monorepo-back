import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabReportSearchPageComponent} from './lab-report-search-page.component';

describe('LabReportSearchPageComponent', () => {
  let component: LabReportSearchPageComponent;
  let fixture: ComponentFixture<LabReportSearchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabReportSearchPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabReportSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
