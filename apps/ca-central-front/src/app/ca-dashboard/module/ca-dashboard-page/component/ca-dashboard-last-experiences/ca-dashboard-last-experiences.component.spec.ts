import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDashboardLastExperiencesComponent} from './ca-dashboard-last-experiences.component';

describe('CaDashboardLastExperiencesComponent', () => {
  let component: CaDashboardLastExperiencesComponent;
  let fixture: ComponentFixture<CaDashboardLastExperiencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaDashboardLastExperiencesComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaDashboardLastExperiencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
