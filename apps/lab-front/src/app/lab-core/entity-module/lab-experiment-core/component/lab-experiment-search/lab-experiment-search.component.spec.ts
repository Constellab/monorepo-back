import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentSearchComponent} from './lab-experiment-search.component';

describe('BioxExperimentSearchComponent', () => {
  let component: LabExperimentSearchComponent;
  let fixture: ComponentFixture<LabExperimentSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
