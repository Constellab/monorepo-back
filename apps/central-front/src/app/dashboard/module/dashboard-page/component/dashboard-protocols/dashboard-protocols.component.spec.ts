import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardProtocolsComponent} from './dashboard-protocols.component';

describe('DashboardProtocolsComponent', () => {
  let component: DashboardProtocolsComponent;
  let fixture: ComponentFixture<DashboardProtocolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardProtocolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardProtocolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
