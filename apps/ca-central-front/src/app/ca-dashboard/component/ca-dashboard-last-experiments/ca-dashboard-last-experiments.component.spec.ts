import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardLastExperimentsComponent} from './ca-dashboard-last-experiments.component';

describe('CaDashboardLastExperiencesComponent', () => {
  let component: CaDashboardLastExperimentsComponent;
  let fixture: ComponentFixture<CaDashboardLastExperimentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaDashboardLastExperimentsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardLastExperimentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
