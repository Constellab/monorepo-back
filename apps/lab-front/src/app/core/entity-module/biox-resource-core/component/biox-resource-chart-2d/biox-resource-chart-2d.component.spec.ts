import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxResourceChart2dComponent} from './biox-resource-chart-2d.component';

describe('BioxResourceChartDComponent', () => {
  let component: BioxResourceChart2dComponent;
  let fixture: ComponentFixture<BioxResourceChart2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceChart2dComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceChart2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
