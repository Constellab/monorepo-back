import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceSearchComponent} from './ca-space-search.component';

describe('CaSpaceSearchComponent', () => {
  let component: CaSpaceSearchComponent;
  let fixture: ComponentFixture<CaSpaceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
