import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileResourceTableComponent } from './file-resource-table.component';

describe('FileResourceTableComponent', () => {
  let component: FileResourceTableComponent;
  let fixture: ComponentFixture<FileResourceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileResourceTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileResourceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
