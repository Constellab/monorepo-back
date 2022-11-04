import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserWithDateComponent} from './ca-user-with-date.component';

describe('CaUserWithDateComponent', () => {
  let component: CaUserWithDateComponent;
  let fixture: ComponentFixture<CaUserWithDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserWithDateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUserWithDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
