import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardListLayoutComponent} from './ca-dashboard-list-layout.component';

describe('CaDashboardListComponent', () => {
  let component: CaDashboardListLayoutComponent;
  let fixture: ComponentFixture<CaDashboardListLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardListLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDashboardListLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
