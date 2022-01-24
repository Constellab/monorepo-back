import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbSearchPageComponent} from './ca-smart-db-search-page.component';

describe('CaSmartDbPageComponent', () => {
  let component: CaSmartDbSearchPageComponent;
  let fixture: ComponentFixture<CaSmartDbSearchPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbSearchPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
