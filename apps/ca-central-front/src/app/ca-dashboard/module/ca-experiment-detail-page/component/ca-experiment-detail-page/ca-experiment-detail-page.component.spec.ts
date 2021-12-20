import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentDetailPageComponent} from './ca-experiment-detail-page.component';

describe('ExperimentDetailPageComponent', () => {
  let component: CaExperimentDetailPageComponent;
  let fixture: ComponentFixture<CaExperimentDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaExperimentDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
