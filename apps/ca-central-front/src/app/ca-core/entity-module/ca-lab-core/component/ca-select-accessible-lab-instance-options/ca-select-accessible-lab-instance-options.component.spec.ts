import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectAccessibleLabInstanceOptionsComponent} from './ca-select-accessible-lab-instance-options.component';

describe('SelectAccessibleLabInstanceOptionComponent', () => {
  let component: CaSelectAccessibleLabInstanceOptionsComponent;
  let fixture: ComponentFixture<CaSelectAccessibleLabInstanceOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectAccessibleLabInstanceOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectAccessibleLabInstanceOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
