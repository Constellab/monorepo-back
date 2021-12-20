import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentDetailCardComponent} from './lab-experiment-detail-card.component';

describe('BioxExperimentDetailCardComponent', () => {
  let component: LabExperimentDetailCardComponent;
  let fixture: ComponentFixture<LabExperimentDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentDetailCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentDetailCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
