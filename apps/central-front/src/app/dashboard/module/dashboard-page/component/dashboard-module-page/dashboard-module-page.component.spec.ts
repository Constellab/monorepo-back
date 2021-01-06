import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardModulePageComponent} from './dashboard-module-page.component';

describe('DashboardModulePageComponent', () => {
  let component: DashboardModulePageComponent;
  let fixture: ComponentFixture<DashboardModulePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardModulePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardModulePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
