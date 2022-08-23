import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabFlagButtonComponent} from './lab-flag-button.component';

describe('LabHighlightButtonComponent', () => {
  let component: LabFlagButtonComponent;
  let fixture: ComponentFixture<LabFlagButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabFlagButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabFlagButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
