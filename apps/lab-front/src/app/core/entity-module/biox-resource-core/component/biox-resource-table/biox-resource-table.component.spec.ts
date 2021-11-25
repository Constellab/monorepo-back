import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceTableComponent } from './biox-resource-table.component';

describe('FileResourceTableComponent', () => {
  let component: BioxResourceTableComponent;
  let fixture: ComponentFixture<BioxResourceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
