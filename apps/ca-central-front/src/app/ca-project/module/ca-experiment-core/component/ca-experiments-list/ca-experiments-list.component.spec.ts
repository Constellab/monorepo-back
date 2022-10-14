import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaExperimentsListComponent} from './ca-experiments-list.component';

describe('ExperiencesListComponent', () => {
  let component: CaExperimentsListComponent;
  let fixture: ComponentFixture<CaExperimentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaExperimentsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaExperimentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
