import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BiotaDataCardComponent} from './biota-data-card.component';

describe('BiotaDataCardComponent', () => {
  let component: BiotaDataCardComponent;
  let fixture: ComponentFixture<BiotaDataCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiotaDataCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiotaDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
