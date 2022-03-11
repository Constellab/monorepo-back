import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaGroupSelectOptionsComponent} from './ca-group-select-options.component';

describe('CaGroupSelectOptionsComponent', () => {
  let component: CaGroupSelectOptionsComponent;
  let fixture: ComponentFixture<CaGroupSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaGroupSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaGroupSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
