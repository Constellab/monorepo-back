import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserCompleteInfoPageComponent} from './ca-user-complete-info-page.component';

describe('UserCompleteInfoPageComponent', () => {
  let component: CaUserCompleteInfoPageComponent;
  let fixture: ComponentFixture<CaUserCompleteInfoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserCompleteInfoPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaUserCompleteInfoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
