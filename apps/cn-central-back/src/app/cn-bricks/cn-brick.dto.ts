export class CnBrickVersionLabDto {
  name: string;
  version: string;
  repo_type: 'git' | 'pip';
  repo_commit: string;
}

