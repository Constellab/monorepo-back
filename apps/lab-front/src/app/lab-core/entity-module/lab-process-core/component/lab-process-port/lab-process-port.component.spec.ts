import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabProcessPortComponent} from './lab-process-port.component';

describe('BioxProcessPortComponent', () => {
  let component: LabProcessPortComponent;
  let fixture: ComponentFixture<LabProcessPortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabProcessPortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabProcessPortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
