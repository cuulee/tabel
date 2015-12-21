/**
 * Promise based transformation of data from one form to another
 *
 * Usage:
 *
 * orm.util.defineTransformer(
 *   'posts.list',
 *   {
 *     ['filters'](filters, input) {
 *       return this.transformer('posts.filters').run(filters);
 *     },
 *     ['sortings'](sortings, input) {
 *       return this.transformer('posts.sortings').run(sortings);
 *     },
 *     ['eagerLoads'](eagerLoads, input) {
 *       return this.transformer(posts.eagerLoads').run(eagerLoads);
 *     }
 *   }
 * );
 *
 * orm.util.defineTransformer(
 *   'posts.filters',
 *   {
 *     ['tag.ids'](ids, input) {
 *       if (! isArray(ids)) {
 *         return Promise.resolve([]);
 *       } else {
 *         return orm.tbl('tags').whereIn('id', ids).all()
 *           .then((tags) => tags.id);
 *       }
 *     }
 *   }
 * );
 */

import {assign, toPlainObject} from 'lodash';

import isUsableObject from '../isUsableObject';

export default class Transformer {
  constructor(transformations=[]) {
    this.transformations = new Map();

    this.addTransformations(transformations);
  }

  addTransformations(transformations=[]) {
    if (isUsableObject(transformations)) {
      transformations = toPlainObject(transformations);
      transformations = Object.keys(transformations).map((k) => ({key: k, transformation: transformations[k]}));
    }

    transformations.forEach(({key, transformation}) => {
      this.transformations.set(key, transformation);
    });

    return this;
  }

  addTransformation({key, transformation}) {
    this.transformations.set(key, transformation);
    return this;
  }

  merge(transformer) {
    Array.from(transformer.transformations.keys()).forEach((k) => {
      this.transformations.set(k, transformer.transformations.get(k));
    });

    return this;
  }

  run(input={}) {
    const keys = Object.keys(input).filter((key) => this.transformations.has(key));

    return Promise.all(
      keys.map((key) => {
        const transformed = this.transformations.get(key).bind(this)(input[key], input, key);
        if (transformed instanceof Promise) {
          return transformed.then((val) => val);
        } else if (transformed instanceof Transformer) {
          return transformed.run(input[key]);
        } else {
          return transformed;
        }
      })
    )
    .then((outValues) => outValues.reduce((output, value, index) => {
      return assign(output, {[keys[index]]: value});
    }, {}));
  }
}
