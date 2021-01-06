import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExperimentCardDetailComponent} from './experiment-card-detail.component';

describe('ExperimentCardDetailComponent', () => {
  let component: ExperimentCardDetailComponent;
  let fixture: ComponentFixture<ExperimentCardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentCardDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentCardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
