import { join } from 'path';
import { readdir } from 'fs';
import LocalDatabase from '@verdaccio/local-storage';
import OfflineStorage from './OfflineStorage';

export default class OfflineDatabase extends LocalDatabase {
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
        readdir(item.path, (err, items) => {
          if (err) {
            cb(err);
          } else {
            if (items.find(item => item.endsWith('.tgz'))) {
              packages.push(item.name);
            }
            cb();
          }
        });
      },
      () => {
        this.data.list = packages;
        callback(null, packages);
      },
      name => !name.startsWith('.')
    );
  }
  getPackageStorage(packageName) {
    return new OfflineStorage(join(this.config.storage, packageName), this.logger);
  }
}
