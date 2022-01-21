import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbResultContentComponent} from './ca-smart-db-result-content.component';

describe('CaSmartDbResultContentComponent', () => {
  let component: CaSmartDbResultContentComponent;
  let fixture: ComponentFixture<CaSmartDbResultContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbResultContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbResultContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
