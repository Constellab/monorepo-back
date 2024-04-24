
export interface BlObjectStorageSyncResult{
  copiedObjectsFromSource: string[];
  modifiedObjectsFromSource: string[];
  deletedObjectsFromDestination: string[];
}

export interface BlObjectStorageObjectsInfo{
  totalSize: number;
  nbObjects: number;
}
