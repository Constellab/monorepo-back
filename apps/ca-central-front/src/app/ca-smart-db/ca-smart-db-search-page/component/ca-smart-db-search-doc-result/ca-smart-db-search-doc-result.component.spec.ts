import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbSearchDocResultComponent} from './ca-smart-db-search-doc-result.component';

describe('CaSmartDbDocResultComponent', () => {
  let component: CaSmartDbSearchDocResultComponent;
  let fixture: ComponentFixture<CaSmartDbSearchDocResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbSearchDocResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbSearchDocResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
