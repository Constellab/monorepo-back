import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardLabInstancesComponent} from './ca-dashboard-lab-instances.component';

describe('DashboardLabInstancesComponent', () => {
  let component: CaDashboardLabInstancesComponent;
  let fixture: ComponentFixture<CaDashboardLabInstancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardLabInstancesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardLabInstancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
