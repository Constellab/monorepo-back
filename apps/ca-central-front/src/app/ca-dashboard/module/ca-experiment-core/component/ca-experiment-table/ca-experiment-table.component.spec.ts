import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentTableComponent} from './ca-experiment-table.component';

describe('CaExperimentTableComponent', () => {
  let component: CaExperimentTableComponent;
  let fixture: ComponentFixture<CaExperimentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaExperimentTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CaExperimentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
