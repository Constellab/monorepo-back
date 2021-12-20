import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentDetailPageComponent} from './lab-experiment-detail-page.component';

describe('BioxExperimentDetailPageComponent', () => {
  let component: LabExperimentDetailPageComponent;
  let fixture: ComponentFixture<LabExperimentDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
