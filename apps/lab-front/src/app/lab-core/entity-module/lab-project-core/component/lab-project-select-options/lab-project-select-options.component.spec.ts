import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProjectSelectOptionsComponent} from './lab-project-select-options.component';

describe('BioxProjectSelectOptionsComponent', () => {
  let component: LabProjectSelectOptionsComponent;
  let fixture: ComponentFixture<LabProjectSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProjectSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProjectSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
