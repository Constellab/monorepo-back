import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardMyActivityComponent} from './ca-dashboard-my-activity.component';

describe('CaDashboardMyActivityComponent', () => {
  let component: CaDashboardMyActivityComponent;
  let fixture: ComponentFixture<CaDashboardMyActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaDashboardMyActivityComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardMyActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
