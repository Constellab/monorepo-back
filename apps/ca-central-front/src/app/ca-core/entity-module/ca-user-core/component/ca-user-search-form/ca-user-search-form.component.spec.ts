import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUserSearchFormComponent} from './ca-user-search-form.component';

describe('CaUserSearchFormComponent', () => {
  let component: CaUserSearchFormComponent;
  let fixture: ComponentFixture<CaUserSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUserSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUserSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
