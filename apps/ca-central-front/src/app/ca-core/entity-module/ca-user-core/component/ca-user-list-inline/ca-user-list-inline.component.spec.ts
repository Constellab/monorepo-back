import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserListInlineComponent} from './ca-user-list-inline.component';

describe('CaUserListInlineComponent', () => {
  let component: CaUserListInlineComponent;
  let fixture: ComponentFixture<CaUserListInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserListInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUserListInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
