export class FlMenuDynamic {
  name: string;
  translateName?: boolean; // default to true
  icon?: string;
  children?: FlMenuDynamic[];
  onClick?: (event: MouseEvent) => void;
}
