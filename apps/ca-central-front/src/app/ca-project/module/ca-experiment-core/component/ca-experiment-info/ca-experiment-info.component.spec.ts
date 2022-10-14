import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentInfoComponent} from './ca-experiment-info.component';

describe('ExperimentInfoComponent', () => {
  let component: CaExperimentInfoComponent;
  let fixture: ComponentFixture<CaExperimentInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaExperimentInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
