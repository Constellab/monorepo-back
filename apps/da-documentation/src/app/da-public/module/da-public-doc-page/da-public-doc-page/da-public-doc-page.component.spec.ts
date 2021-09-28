import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaPublicDocPageComponent } from './da-public-doc-page.component';

describe('DaPublicDocPageComponent', () => {
  let component: DaPublicDocPageComponent;
  let fixture: ComponentFixture<DaPublicDocPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaPublicDocPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaPublicDocPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
