import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectOptionsCityComponent} from './ca-select-options-city.component';

describe('CaSelectLabInstanceCityComponent', () => {
  let component: CaSelectOptionsCityComponent;
  let fixture: ComponentFixture<CaSelectOptionsCityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaSelectOptionsCityComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectOptionsCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
