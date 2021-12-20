import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabTaskSourceConfigComponent} from './lab-task-source-config.component';

describe('BioxProcessSourceConfigComponent', () => {
  let component: LabTaskSourceConfigComponent;
  let fixture: ComponentFixture<LabTaskSourceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabTaskSourceConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTaskSourceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
