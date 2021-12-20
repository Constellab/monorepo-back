import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectUserOptionsComponent} from './ca-select-user-options.component';

describe('SelectUserOptionsComponent', () => {
  let component: CaSelectUserOptionsComponent;
  let fixture: ComponentFixture<CaSelectUserOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectUserOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectUserOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
