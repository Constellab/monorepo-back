import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxExperimentSearchComponent} from './biox-experiment-search.component';

describe('BioxExperimentSearchComponent', () => {
  let component: BioxExperimentSearchComponent;
  let fixture: ComponentFixture<BioxExperimentSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
