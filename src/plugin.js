import PackageStorage from './PackageStorage';

class VerdaccioStoragePlugin {
  constructor(config, options) {
    this.config = config;
    this.logger = options.logger;
  }

  async getSecret() {
     /**
     * return await resolveSecret();
     */
  }

  async setSecret(secret) {
     /**
     * return await getYourSecret();
     */
  }

  /**
   * Add a new element.
   * @param {*} name
   * @return {Error|*}
   */
  add(name, cb) {}

  search(onPackage, onEnd, validateName) {
     /**
     * Example of implementation:
     * try {
     *  someApi.getPackages((items) => {
     *   items.map(() => {
     *     if (validateName(item.name)) {
     *       onPackage(item);
     *     }
     *   });
     *  onEnd();
     * } catch(err) {
     *   onEnd(err);
     * }
     * });
     */
  }

  /**
   * Remove an element from the database.
   * @param {*} name
   * @return {Error|*}
   */
  remove(name, callback) {
     /**
     * Example of implementation
      database.getPackage(name, (item, err) => {
        if (err) {
          callback(getInternalError('your own message here'));
        }

        // if all goes well we return nothing
        callback(null);
      }
    */
  }

  /**
   * Return all database elements.
   * @return {Array}
   */
  get(callback) {
      /*
      Example of implementation
      database.getAll((allItems, err) => {
        callback(err, allItems);
      })
    */
  }

  /**
   * Create an instance of the `PackageStorage`
   * @param packageInfo
   */
  getPackageStorage(packageInfo) {
    return new PackageStorage(this.config, packageInfo, this.logger);
  }

  /**
   * All methods for npm token support
   * more info here https://github.com/verdaccio/verdaccio/pull/1427
   */

  saveToken(token) {
    throw new Error('Method not implemented.');
  }

  deleteToken(user, tokenKey) {
    throw new Error('Method not implemented.');
  }

  readTokens(filter) {
    throw new Error('Method not implemented.');
  }
}

export default (config, options) => {
  return new VerdaccioStoragePlugin(config, options);
};
