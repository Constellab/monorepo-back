import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExperimentInfoComponent} from './experiment-info.component';

describe('ExperimentInfoComponent', () => {
  let component: ExperimentInfoComponent;
  let fixture: ComponentFixture<ExperimentInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
