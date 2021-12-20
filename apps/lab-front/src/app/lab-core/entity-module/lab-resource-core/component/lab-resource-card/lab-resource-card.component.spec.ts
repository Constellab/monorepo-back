import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceCardComponent} from './lab-resource-card.component';

describe('BioxResourceCardComponent', () => {
  let component: LabResourceCardComponent;
  let fixture: ComponentFixture<LabResourceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
