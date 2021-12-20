import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectLabOptionsComponent} from './ca-select-lab-options.component';

describe('SelectLabOptionsComponent', () => {
  let component: CaSelectLabOptionsComponent;
  let fixture: ComponentFixture<CaSelectLabOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectLabOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectLabOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
