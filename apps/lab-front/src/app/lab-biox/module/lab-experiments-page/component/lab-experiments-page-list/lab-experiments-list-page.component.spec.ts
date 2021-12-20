import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabExperimentsListPageComponent} from './lab-experiments-list-page.component';

describe('BioxExperimentsPageComponent', () => {
  let component: LabExperimentsListPageComponent;
  let fixture: ComponentFixture<LabExperimentsListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabExperimentsListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabExperimentsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
