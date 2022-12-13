import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceSearchComponent} from './ca-lab-instance-search.component';

describe('CaLabInstanceSearchComponent', () => {
  let component: CaLabInstanceSearchComponent;
  let fixture: ComponentFixture<CaLabInstanceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
