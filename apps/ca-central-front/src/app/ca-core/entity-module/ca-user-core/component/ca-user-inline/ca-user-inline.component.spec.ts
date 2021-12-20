import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserInlineComponent} from './ca-user-inline.component';

describe('UserInlineCardComponent', () => {
  let component: CaUserInlineComponent;
  let fixture: ComponentFixture<CaUserInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserInlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaUserInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
