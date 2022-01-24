import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbDocPageComponent} from './ca-smart-db-doc-page.component';

describe('CaSmartDbDocPageComponent', () => {
  let component: CaSmartDbDocPageComponent;
  let fixture: ComponentFixture<CaSmartDbDocPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbDocPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbDocPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
