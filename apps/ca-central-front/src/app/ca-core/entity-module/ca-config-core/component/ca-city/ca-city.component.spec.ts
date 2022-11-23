import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCityComponent} from './ca-city.component';

describe('CaLabInstanceCityComponent', () => {
  let component: CaCityComponent;
  let fixture: ComponentFixture<CaCityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaCityComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
