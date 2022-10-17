import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaReportContentComponent} from './ca-report-content.component';

describe('CaReportContentComponent', () => {
  let component: CaReportContentComponent;
  let fixture: ComponentFixture<CaReportContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaReportContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaReportContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
