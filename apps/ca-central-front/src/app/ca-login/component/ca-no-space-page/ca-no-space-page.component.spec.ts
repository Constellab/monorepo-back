import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaNoSpacePageComponent} from './ca-no-space-page.component';

describe('CaNoSpacePageComponent', () => {
  let component: CaNoSpacePageComponent;
  let fixture: ComponentFixture<CaNoSpacePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaNoSpacePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaNoSpacePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
