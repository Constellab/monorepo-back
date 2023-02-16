import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabOnPremiseConfigComponent} from './ca-lab-on-premise-config.component';

describe('CaLabOnPremiseConfigComponent', () => {
  let component: CaLabOnPremiseConfigComponent;
  let fixture: ComponentFixture<CaLabOnPremiseConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabOnPremiseConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabOnPremiseConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
