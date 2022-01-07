import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceManagerStatusComponent} from './ca-lab-instance-manager-status.component';

describe('CaLabManagerStatusComponent', () => {
  let component: CaLabInstanceManagerStatusComponent;
  let fixture: ComponentFixture<CaLabInstanceManagerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceManagerStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceManagerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
