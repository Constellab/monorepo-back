import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabServerInfoCardComponent} from './ca-lab-server-info-card.component';

describe('ServerInfoCardComponent', () => {
  let component: CaLabServerInfoCardComponent;
  let fixture: ComponentFixture<CaLabServerInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabServerInfoCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabServerInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
