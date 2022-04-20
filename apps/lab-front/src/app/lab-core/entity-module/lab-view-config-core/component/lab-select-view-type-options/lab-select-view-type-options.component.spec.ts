import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabSelectViewTypeOptionsComponent} from './lab-select-view-type-options.component';

describe('LabSelectViewTypeOptionsComponent', () => {
  let component: LabSelectViewTypeOptionsComponent;
  let fixture: ComponentFixture<LabSelectViewTypeOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabSelectViewTypeOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabSelectViewTypeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
