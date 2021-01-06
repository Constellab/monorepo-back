import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExperimentDetailPageComponent} from './experiment-detail-page.component';

describe('ExperimentDetailPageComponent', () => {
  let component: ExperimentDetailPageComponent;
  let fixture: ComponentFixture<ExperimentDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperimentDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
