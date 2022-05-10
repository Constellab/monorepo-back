import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardGroupsComponent} from './ca-dashboard-groups.component';

describe('CaDashboardGroupComponent', () => {
  let component: CaDashboardGroupsComponent;
  let fixture: ComponentFixture<CaDashboardGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
