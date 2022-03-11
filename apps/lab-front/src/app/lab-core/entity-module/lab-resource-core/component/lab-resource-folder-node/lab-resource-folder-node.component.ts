import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LabResourceViewFolderContentFlat} from '../../../../model/entities/resource/lab-resource-view-folder.class';

/**
 * Inside the {@link LabResourceFolderComponent} to show one node (file or folder)
 */
@Component({
  selector: 'lab-resource-folder-node',
  templateUrl: './lab-resource-folder-node.component.html',
  styleUrls: ['./lab-resource-folder-node.component.scss']
})
export class LabResourceFolderNodeComponent implements OnInit {

  @Input() node: LabResourceViewFolderContentFlat;

  @Input() nodeType: 'file' | 'folder';

  @Output() extractNode: EventEmitter<LabResourceViewFolderContentFlat> = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  get extractText(): string {
    return this.nodeType === 'folder' ? 'biox.folder_extract_folder' : 'biox.folder_extract_file';
  }

  extractNodeClick(): void {
    this.extractNode.next(this.node);
  }

}
