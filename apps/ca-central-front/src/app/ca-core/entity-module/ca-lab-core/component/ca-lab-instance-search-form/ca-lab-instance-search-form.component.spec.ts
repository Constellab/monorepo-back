import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceSearchFormComponent} from './ca-lab-instance-search-form.component';

describe('CaLabInstanceSearchFormComponent', () => {
  let component: CaLabInstanceSearchFormComponent;
  let fixture: ComponentFixture<CaLabInstanceSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
