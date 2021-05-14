import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileExplorerPageComponent } from './file-explorer-page.component';

describe('FileExplorerPageComponent', () => {
  let component: FileExplorerPageComponent;
  let fixture: ComponentFixture<FileExplorerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileExplorerPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
