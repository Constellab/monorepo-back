import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectAccessibleLabInstanceOptionsComponent} from './select-accessible-lab-instance-options.component';

describe('SelectAccessibleLabInstanceOptionComponent', () => {
  let component: SelectAccessibleLabInstanceOptionsComponent;
  let fixture: ComponentFixture<SelectAccessibleLabInstanceOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectAccessibleLabInstanceOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAccessibleLabInstanceOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
