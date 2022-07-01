import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HaPublicFindDocComponent} from './ha-public-find-doc.component';

describe('HaPublicFindDocDialogComponent', () => {
  let component: HaPublicFindDocComponent;
  let fixture: ComponentFixture<HaPublicFindDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HaPublicFindDocComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicFindDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
