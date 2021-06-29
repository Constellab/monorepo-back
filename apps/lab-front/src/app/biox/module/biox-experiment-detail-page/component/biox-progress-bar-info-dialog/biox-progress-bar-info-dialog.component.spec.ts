import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProgressBarInfoDialogComponent} from './biox-progress-bar-info-dialog.component';

describe('BioxProgressBarInfoDialogComponent', () => {
  let component: BioxProgressBarInfoDialogComponent;
  let fixture: ComponentFixture<BioxProgressBarInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProgressBarInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProgressBarInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
