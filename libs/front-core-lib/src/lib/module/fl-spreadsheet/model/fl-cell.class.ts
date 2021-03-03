export abstract class FlCell {

  public abstract editable: boolean;
  public value: any;
}

export class FlBasicCell extends FlCell {
  public editable = true;

  constructor() {
    super();
    this.value = 'Super';
  }

}

export class FlColumnHeaderCell extends FlCell {
  public editable = false;

  constructor(index: number) {
    super();

    if (index === 0) {
      this.value = null;
    } else {
      this.value = index;
    }
  }
}

export class FlRowHeaderCell extends FlCell {
  public editable = false;

  constructor(index: number) {
    super();
    this.value = index;
  }
}
