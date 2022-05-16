import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabConfigureTaskComponent} from './lab-configure-task.component';

describe('LabConfigureTaskComponent', () => {
  let component: LabConfigureTaskComponent;
  let fixture: ComponentFixture<LabConfigureTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabConfigureTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabConfigureTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
