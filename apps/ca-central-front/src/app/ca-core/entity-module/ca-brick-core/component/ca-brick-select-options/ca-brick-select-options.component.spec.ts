import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBrickSelectOptionsComponent} from './ca-brick-select-options.component';

describe('CaBrickSelectOptionsComponent', () => {
  let component: CaBrickSelectOptionsComponent;
  let fixture: ComponentFixture<CaBrickSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBrickSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaBrickSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
