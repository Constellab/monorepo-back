import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessTypeCardComponent} from './lab-process-type-card.component';

describe('BioxProcessTypeCardComponent', () => {
  let component: LabProcessTypeCardComponent;
  let fixture: ComponentFixture<LabProcessTypeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessTypeCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessTypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
