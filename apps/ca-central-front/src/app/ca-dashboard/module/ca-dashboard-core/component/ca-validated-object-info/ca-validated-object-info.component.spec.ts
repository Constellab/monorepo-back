import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaValidatedObjectInfoComponent} from './ca-validated-object-info.component';

describe('CaValidatedObjectInfoComponent', () => {
  let component: CaValidatedObjectInfoComponent;
  let fixture: ComponentFixture<CaValidatedObjectInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaValidatedObjectInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaValidatedObjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
