import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbListComponent} from './ca-smart-db-list.component';

describe('CaSmartDbListComponent', () => {
  let component: CaSmartDbListComponent;
  let fixture: ComponentFixture<CaSmartDbListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
