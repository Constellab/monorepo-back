import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceImageComponent } from './biox-resource-image.component';

describe('BioxResourceImageComponent', () => {
  let component: BioxResourceImageComponent;
  let fixture: ComponentFixture<BioxResourceImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
