import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentCardDetailComponent} from './ca-experiment-card-detail.component';

describe('ExperimentCardDetailComponent', () => {
  let component: CaExperimentCardDetailComponent;
  let fixture: ComponentFixture<CaExperimentCardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaExperimentCardDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentCardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
