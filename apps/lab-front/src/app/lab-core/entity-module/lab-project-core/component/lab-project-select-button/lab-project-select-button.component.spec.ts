import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProjectSelectButtonComponent} from './lab-project-select-button.component';

describe('LabProjectSelectButtonComponent', () => {
  let component: LabProjectSelectButtonComponent;
  let fixture: ComponentFixture<LabProjectSelectButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProjectSelectButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabProjectSelectButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
