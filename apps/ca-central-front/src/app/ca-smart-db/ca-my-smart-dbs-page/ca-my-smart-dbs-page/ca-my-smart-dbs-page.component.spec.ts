import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMySmartDbsPageComponent} from './ca-my-smart-dbs-page.component';

describe('CaMySmartDbsPageComponent', () => {
  let component: CaMySmartDbsPageComponent;
  let fixture: ComponentFixture<CaMySmartDbsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMySmartDbsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaMySmartDbsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
