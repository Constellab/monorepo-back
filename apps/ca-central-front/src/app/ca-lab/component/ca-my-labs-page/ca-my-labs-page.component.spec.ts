import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMyLabsPageComponent} from './ca-my-labs-page.component';

describe('MyLabsPageComponent', () => {
  let component: CaMyLabsPageComponent;
  let fixture: ComponentFixture<CaMyLabsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMyLabsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaMyLabsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
