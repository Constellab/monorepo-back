import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TdTypeUnavailableComponent} from './td-type-unavailable.component';

describe('TdTypeUnavailableComponent', () => {
  let component: TdTypeUnavailableComponent;
  let fixture: ComponentFixture<TdTypeUnavailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TdTypeUnavailableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TdTypeUnavailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
