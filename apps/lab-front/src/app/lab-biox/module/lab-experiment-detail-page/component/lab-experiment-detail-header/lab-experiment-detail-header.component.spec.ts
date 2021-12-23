import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentDetailHeaderComponent} from './lab-experiment-detail-header.component';

describe('BioxExperimentDetailCardComponent', () => {
  let component: LabExperimentDetailHeaderComponent;
  let fixture: ComponentFixture<LabExperimentDetailHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentDetailHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentDetailHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
