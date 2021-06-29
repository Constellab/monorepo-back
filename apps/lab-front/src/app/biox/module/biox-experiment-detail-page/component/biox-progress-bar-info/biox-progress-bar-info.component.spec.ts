import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProgressBarInfoComponent} from './biox-progress-bar-info.component';

describe('BioxWorkflowNodeProgressComponent', () => {
  let component: BioxProgressBarInfoComponent;
  let fixture: ComponentFixture<BioxProgressBarInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProgressBarInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProgressBarInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
