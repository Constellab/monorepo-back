import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceChart2dComponent} from './lab-resource-chart2d.component';

describe('BioxResourceChartDComponent', () => {
  let component: LabResourceChart2dComponent;
  let fixture: ComponentFixture<LabResourceChart2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceChart2dComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceChart2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
