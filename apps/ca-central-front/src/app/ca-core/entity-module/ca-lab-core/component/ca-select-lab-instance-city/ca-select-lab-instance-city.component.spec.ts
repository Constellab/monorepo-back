import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectLabInstanceCityComponent} from './ca-select-lab-instance-city.component';

describe('CaSelectLabInstanceCityComponent', () => {
  let component: CaSelectLabInstanceCityComponent;
  let fixture: ComponentFixture<CaSelectLabInstanceCityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaSelectLabInstanceCityComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSelectLabInstanceCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
