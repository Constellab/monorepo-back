import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSelectSpaceComponent} from './ca-select-space.component';

describe('CaSelectSpaceComponent', () => {
  let component: CaSelectSpaceComponent;
  let fixture: ComponentFixture<CaSelectSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSelectSpaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaSelectSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
