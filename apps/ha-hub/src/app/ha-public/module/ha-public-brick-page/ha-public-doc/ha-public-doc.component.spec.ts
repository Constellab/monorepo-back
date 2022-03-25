import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HaPublicDocComponent} from './ha-public-doc.component';

describe('DaPublicDocPageComponent', () => {
  let component: HaPublicDocComponent;
  let fixture: ComponentFixture<HaPublicDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HaPublicDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
