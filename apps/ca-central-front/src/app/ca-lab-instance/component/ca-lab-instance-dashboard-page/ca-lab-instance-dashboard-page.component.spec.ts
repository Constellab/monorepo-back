import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceDashboardPageComponent} from './ca-lab-instance-dashboard-page.component';

describe('CaLabInstanceDashboardPageComponent', () => {
  let component: CaLabInstanceDashboardPageComponent;
  let fixture: ComponentFixture<CaLabInstanceDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceDashboardPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
