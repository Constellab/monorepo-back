import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaLabInstanceManagerAdvancedComponent } from './ca-lab-instance-manager-advanced.component';

describe('CaLabInstanceManagerAdvancedComponent', () => {
  let component: CaLabInstanceManagerAdvancedComponent;
  let fixture: ComponentFixture<CaLabInstanceManagerAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceManagerAdvancedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceManagerAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
