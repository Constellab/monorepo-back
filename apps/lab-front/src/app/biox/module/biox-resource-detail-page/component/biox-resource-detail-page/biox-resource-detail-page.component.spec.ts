import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceDetailPageComponent } from './biox-resource-detail-page.component';

describe('BioxResourceDetailPageComponent', () => {
  let component: BioxResourceDetailPageComponent;
  let fixture: ComponentFixture<BioxResourceDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceDetailPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
