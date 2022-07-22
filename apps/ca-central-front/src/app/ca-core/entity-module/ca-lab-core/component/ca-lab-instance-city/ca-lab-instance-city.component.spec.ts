import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceCityComponent} from './ca-lab-instance-city.component';

describe('CaLabInstanceCityComponent', () => {
  let component: CaLabInstanceCityComponent;
  let fixture: ComponentFixture<CaLabInstanceCityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaLabInstanceCityComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
