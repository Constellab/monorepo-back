import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabUserSelectOptionsComponent} from './lab-user-select-options.component';

describe('LabUserSelectOptionsComponent', () => {
  let component: LabUserSelectOptionsComponent;
  let fixture: ComponentFixture<LabUserSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabUserSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabUserSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
