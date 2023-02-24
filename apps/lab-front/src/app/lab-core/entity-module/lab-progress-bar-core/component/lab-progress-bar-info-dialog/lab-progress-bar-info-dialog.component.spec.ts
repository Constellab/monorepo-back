import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProgressBarInfoDialogComponent} from './lab-progress-bar-info-dialog.component';

describe('BioxProgressBarInfoDialogComponent', () => {
  let component: LabProgressBarInfoDialogComponent;
  let fixture: ComponentFixture<LabProgressBarInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProgressBarInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProgressBarInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
