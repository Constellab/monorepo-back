import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserSearchComponent} from './ca-user-search.component';

describe('CaUserSearchComponent', () => {
  let component: CaUserSearchComponent;
  let fixture: ComponentFixture<CaUserSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUserSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
