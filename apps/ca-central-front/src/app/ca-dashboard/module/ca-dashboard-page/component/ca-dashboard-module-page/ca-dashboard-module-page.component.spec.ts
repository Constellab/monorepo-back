import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardModulePageComponent} from './ca-dashboard-module-page.component';

describe('DashboardModulePageComponent', () => {
  let component: CaDashboardModulePageComponent;
  let fixture: ComponentFixture<CaDashboardModulePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardModulePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardModulePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
