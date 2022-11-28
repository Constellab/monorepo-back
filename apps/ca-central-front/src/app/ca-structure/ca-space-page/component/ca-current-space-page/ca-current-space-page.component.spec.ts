import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpacePageComponent} from './ca-current-space-page.component';

describe('CaSpacePageComponent', () => {
  let component: CaCurrentSpacePageComponent;
  let fixture: ComponentFixture<CaCurrentSpacePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpacePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaCurrentSpacePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
