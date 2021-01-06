export interface SvgIcon {
  name: string;
  filename: string;
}

// define the list of svg icon
export const svgIcons: SvgIcon[] = [
  {name: 'experiment', filename: 'flask-solid.svg'},
  {name: 'study', filename: 'chalkboard-teacher-solid.svg'},
  {name: 'protocol', filename: 'cogs-solid.svg'},
  {name: 'lab', filename: 'microscope-solid.svg'},
  {name: 'project', filename: 'briefcase-solid.svg'},
  {name: 'archive', filename: 'archive-solid.svg'},
  {name: 'share_arrow', filename: 'share-solid.svg'},
];
