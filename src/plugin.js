import LocalDatabase from '@verdaccio/local-storage';

export default class OfflineStorage extends LocalDatabase {
  constructor(config, options) {
    super(config, options.logger);
  }

  /**
   * Return all packages in the local cache.
   *
   * @param callback: The callback to invoke with the found packages name.
   */
  get(callback) {
    const packages = [];
    this.search(
      (item, cb) => {
        packages.push(item.name);
        cb();
      },
      () => {
        this.data.list = packages;
        callback(null, packages);
      },
      name => !name.startsWith('.')
    );
  }
}
