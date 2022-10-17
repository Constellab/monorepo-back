import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectReportPreviewComponent} from './ca-project-report-preview.component';

describe('CaProjectReportPreviewComponent', () => {
  let component: CaProjectReportPreviewComponent;
  let fixture: ComponentFixture<CaProjectReportPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectReportPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectReportPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
