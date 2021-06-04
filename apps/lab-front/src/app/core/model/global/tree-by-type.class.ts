import {Expose, Type} from 'class-transformer';
import {LabBaseEntity} from './lab-entity.entity';
import {ClClassReference, ClConstructorFunction, ClCoreJsonConvert} from '@monorepo/core-lib';

/**
 * Class for a tree of object by python type
 */
export class TypedTree<T> {
  @Expose({name: 'type_part'})
  typePart: string;

  @Expose({name: 'sub_trees'})
  @Type(() => TypedTree)
  subTrees?: TypedTree<T>[];

  /**
   * object if the tree is a leaf
   * instantiate with createTypedTree method
   */
  object?: T;

  hasChildren(): boolean {
    return this.subTrees?.length > 0;
  }

  isLeaf(): boolean {
    return this.object != null;
  }
}

/**
 * Function to instantiate the view model and instantiate the model under it
 * @param modelClassReference class reference of the model under the view model
 */
export function createTypedTree<T extends LabBaseEntity>(modelClassReference: ClClassReference<T>)
  : ClConstructorFunction<TypedTree<T> | TypedTree<T>[]> {
  return (json: any): TypedTree<T> | TypedTree<T>[] => {
    // instantiate the view model or view models
    const typedTree: TypedTree<T> | TypedTree<T>[] = ClCoreJsonConvert.deserialize(json, TypedTree) as any;

    // if this is an array
    if (typedTree instanceof Array) {
      instantiateTypedTreeObjectRecur(typedTree, modelClassReference);
    } else {
      instantiateTypedTreeObjectRecur([typedTree], modelClassReference);
    }
    return typedTree;
  };
}

/**
 * Instantiate object of the input tree if they exists and do the same for sub trees
 * @param typedTrees
 * @param modelClassReference
 */
function instantiateTypedTreeObjectRecur<T extends LabBaseEntity>(typedTrees: TypedTree<T>[],
                                                                  modelClassReference: ClClassReference<T>): void {
  for (const tree of typedTrees) {
    if (tree.isLeaf()) {
      // instantiate tree object
      tree.object = ClCoreJsonConvert.deserializeObject(tree.object, modelClassReference);
    }

    if (tree.hasChildren()) {
      instantiateTypedTreeObjectRecur(tree.subTrees, modelClassReference);
    }
  }
}

