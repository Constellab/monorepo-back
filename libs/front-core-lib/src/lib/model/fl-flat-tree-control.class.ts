import {FlatTreeControl} from '@angular/cdk/tree';

/**
 * Class to improve functionalities of the FlatTreeControl
 */
export class FlFlatTreeControl<T, K = T> extends FlatTreeControl<T, K> {

  /**
   * Retrieve the direct ancestor of a node if it exists
   * @param dataNode
   */
  public getAncestor(dataNode: T): T | null {
    const startIndex = this.dataNodes.indexOf(dataNode);

    for (let i = startIndex - 1; i >= 0; i--) {
      if (this.getLevel(dataNode) > this.getLevel(this.dataNodes[i])) {
        return this.dataNodes[i];
      }
    }

    return null;
  }

  /**
   * return the previous node that is visible (where its parent is expanded)
   * @param dataNode
   */
  public getPreviousVisibleNode(dataNode: T): T | null {
    let node = this.getPreviousNode(dataNode);

    while (node && !this.isVisible(node)) {
      node = this.getAncestor(node);
    }

    return node;
  }

  /**
   * return the previous node that is visible (where its parent is expanded)
   * @param dataNode
   */
  public getNextVisibleNode(dataNode: T): T | null {
    let index = this.dataNodes.indexOf(dataNode) + 1;

    while (index < this.dataNodes.length) {
      const node: T = this.dataNodes[index];

      if (this.isVisible(node)) {
        return node;
      }

      // if the node is not visible, its siblings are not visible too
      // so, count the number of sibling and sub sibling by using the parent
      // and add it so we don't check siblings and sub siblings
      const parent: T = this.getAncestor(node);
      if (parent == null) {
        return null;
      }
      index += this.getDescendants(parent).length;
    }

    return null;
  }

  /**
   * return the previous node in the list
   */
  public getPreviousNode(dataNode: T): T | null {
    const index = this.dataNodes.indexOf(dataNode);

    if (index > 0) {
      return this.dataNodes[index - 1];
    }

    return null;
  }

  /**
   * return the previous node in the list
   */
  public getNextNode(dataNode: T): T | null {
    const index = this.dataNodes.indexOf(dataNode);

    if (index < this.dataNodes.length - 1) {
      return this.dataNodes[index + 1];
    }

    return null;
  }

  /**
   * return true the node is visible (meaning that all its ancestor are expanded)
   */
  public isVisible(dataNode: T): boolean {
    let parent: T | null = this.getAncestor(dataNode);

    // to be visible, all its parent must be expanded
    while (parent != null) {
      if (!this.isExpanded(parent)) {
        return false;
      }
      parent = this.getAncestor(parent);
    }

    return true;
  }

  /**
   * Expand all the ancestors of a node until the root
   * @param dataNode
   */
  public expandAncestors(dataNode: T): void {
    let parent: T | null = this.getAncestor(dataNode);

    while (parent != null) {
      this.expand(parent);
      parent = this.getAncestor(parent);
    }
  }
}
