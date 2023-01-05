import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabServerCompleteInfoComponent} from './ca-lab-server-complete-info.component';

describe('CaLabServerCompleteInfoComponent', () => {
  let component: CaLabServerCompleteInfoComponent;
  let fixture: ComponentFixture<CaLabServerCompleteInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabServerCompleteInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabServerCompleteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
