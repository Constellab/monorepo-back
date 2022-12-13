import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceUserSearchFormComponent} from './ca-space-user-search-form.component';

describe('CaSpaceUserSearchFormComponent', () => {
  let component: CaSpaceUserSearchFormComponent;
  let fixture: ComponentFixture<CaSpaceUserSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceUserSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceUserSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
