import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceSearchFormComponent} from './ca-space-search-form.component';

describe('CaSpaceSearchFormComponent', () => {
  let component: CaSpaceSearchFormComponent;
  let fixture: ComponentFixture<CaSpaceSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
