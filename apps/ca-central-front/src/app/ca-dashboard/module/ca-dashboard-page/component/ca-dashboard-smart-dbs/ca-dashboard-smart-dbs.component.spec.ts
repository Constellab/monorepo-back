import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardSmartDbsComponent} from './ca-dashboard-smart-dbs.component';

describe('CaDashboardSmartDbsComponent', () => {
  let component: CaDashboardSmartDbsComponent;
  let fixture: ComponentFixture<CaDashboardSmartDbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDashboardSmartDbsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardSmartDbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
