import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlChartVennDataPortalComponent } from './fl-chart-venn-data-portal.component';

describe('FlChartVennDataPortalComponent', () => {
  let component: FlChartVennDataPortalComponent;
  let fixture: ComponentFixture<FlChartVennDataPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlChartVennDataPortalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlChartVennDataPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
