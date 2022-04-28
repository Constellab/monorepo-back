import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvReportResourceViewComponent} from './rv-report-resource-view.component';

describe('RvReportResourceViewComponent', () => {
  let component: RvReportResourceViewComponent;
  let fixture: ComponentFixture<RvReportResourceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvReportResourceViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvReportResourceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
