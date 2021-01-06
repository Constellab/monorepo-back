import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardLabInstancesComponent} from './dashboard-lab-instances.component';

describe('DashboardLabInstancesComponent', () => {
  let component: DashboardLabInstancesComponent;
  let fixture: ComponentFixture<DashboardLabInstancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardLabInstancesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardLabInstancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
