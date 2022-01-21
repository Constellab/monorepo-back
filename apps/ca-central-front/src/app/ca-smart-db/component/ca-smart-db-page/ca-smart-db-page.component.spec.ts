import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbPageComponent} from './ca-smart-db-page.component';

describe('CaSmartDbPageComponent', () => {
  let component: CaSmartDbPageComponent;
  let fixture: ComponentFixture<CaSmartDbPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
