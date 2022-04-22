import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RvViewChart2dComponent} from './rv-view-chart2d.component';

describe('BioxResourceChartDComponent', () => {
  let component: RvViewChart2dComponent;
  let fixture: ComponentFixture<RvViewChart2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RvViewChart2dComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RvViewChart2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
