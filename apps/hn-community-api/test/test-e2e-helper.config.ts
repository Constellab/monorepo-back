export interface TestIdOptions {
  /**
   * Id to get for a findOne
   *
   * Default: null
   */
  id?: number;
}

export interface TestGetOptions extends TestIdOptions {
  /**
   * If route paginated, the page id to retrieve
   *
   * Default: null
   */
  page?: number;

  /**
   * If route paginated, the page size
   *
   * Default: null
   */
  pageSize?: number;
}
