import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProjectSelectComponent} from './lab-project-select.component';

describe('LabProjectSelectComponent', () => {
  let component: LabProjectSelectComponent;
  let fixture: ComponentFixture<LabProjectSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProjectSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabProjectSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
