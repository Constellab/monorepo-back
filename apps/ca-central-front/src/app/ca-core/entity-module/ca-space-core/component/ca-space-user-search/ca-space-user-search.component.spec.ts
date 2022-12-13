import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSpaceUserSearchComponent} from './ca-space-user-search.component';

describe('CaSpaceUserSearchComponent', () => {
  let component: CaSpaceUserSearchComponent;
  let fixture: ComponentFixture<CaSpaceUserSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSpaceUserSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSpaceUserSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
