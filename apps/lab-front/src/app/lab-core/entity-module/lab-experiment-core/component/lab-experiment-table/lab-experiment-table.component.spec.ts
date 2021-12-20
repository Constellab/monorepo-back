import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentTableComponent} from './lab-experiment-table.component';

describe('LabExperimentTableComponent', () => {
  let component: LabExperimentTableComponent;
  let fixture: ComponentFixture<LabExperimentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
