import { Component, Vue } from 'vue-property-decorator'
import { omit, isEqual } from 'lodash'

/**
 * Mixin that provides some useful common utilities.
 */
@Component({})
export default class CommonMixin extends Vue {
  /** True if Jest is running the code. */
  get isJestRunning (): boolean {
    return (process.env.JEST_WORKER_ID !== undefined)
  }

  /**
   * Removes the specified properties from nested objects.
   * @param baseObj the base object
   * @param keys    the nested object keys which to omit properties from
   * @param prop    the properties to be removed
   */
  omitProps (baseObj: any, keys: Array<string>, prop: Array<string>): any {
    const parsedObj: any = {}
    Object.keys(baseObj).forEach(key => {
      parsedObj[key] = omit(baseObj[key], prop)
    })
    return parsedObj
  }

  /**
   * Compares two objects while omitting specified properties from the comparison.
   * @param objA the first object to compare
   * @param objB the second object to compare
   * @param props an optional array of properties to omit during the comparison
   * @returns a boolean indicating a match of objects
   */
  isSame (objA: {}, objB: {}, props: string[] = []): boolean {
    return isEqual({ ...omit(objA, props) }, { ...omit(objB, props) })
  }
}
