import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbSelectedDocComponent} from './ca-smart-db-selected-doc.component';

describe('CaSmartDbSelectedDocComponent', () => {
  let component: CaSmartDbSelectedDocComponent;
  let fixture: ComponentFixture<CaSmartDbSelectedDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbSelectedDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbSelectedDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
