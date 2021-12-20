import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentCardComponent} from './ca-experiment-card.component';

describe('ExperimentCardComponent', () => {
  let component: CaExperimentCardComponent;
  let fixture: ComponentFixture<CaExperimentCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaExperimentCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
