import { join } from 'path';
import { readdir } from 'fs';
import LocalDatabase from '@verdaccio/local-storage';
import OfflinePackageStorage from './OfflinePackageStorage';

/**
 * Verdaccio storage plugin (`IPluginStorage`) that provides only the locally available versions of
 * packages cached in a local-storage storage.
 *
 * Basically, this is just like local-storage but modifying on the fly the available packages list
 * and the packages definitions without altering the original files in the local-storage storage.
 *
 * @see https://verdaccio.org/docs/en/plugin-storage
 * @see https://github.com/verdaccio/monorepo/tree/master/plugins/local-storage
 */
export default class OfflineStoragePlugin extends LocalDatabase {
  constructor(config, options) {
    super(config, options.logger);
    // eslint-disable-next-line no-console
    if (config.offline) {
      options.logger.warn({}, 'Offline mode set explicitly in config. All packages will be resolved in offline mode.');
    } else {
      options.logger.warn(
        {},
        'Offline mode NOT set explicitly in config. Only packages with no `proxy` will be resolved in offline mode.'
      );
    }
  }

  /**
   * Retrieves all the locally available packages names. Packages with no cached versions (only
   * `package.json` file in the directory) are ignored.
   *
   * @param callback: The callback to invoke with the found packages names.
   * @see https://verdaccio.org/docs/en/plugin-storage#api
   */
  get(callback) {
    const packages = [];
    this.search(
      (item, cb) => {
        this.logger.debug(
          {
            packageName: item.name,
          },
          '[verdaccio-offline-storage/get/search] discovering local versions for package: @{packageName}'
        );
        readdir(item.path, (err, items) => {
          if (err) {
            this.logger.trace(
              {
                err,
                packageName: item.name,
              },
              '[verdaccio-offline-storage/get/search/readdir] error discovering package "@{packageName}" files: @{err}'
            );
            cb(err);
          } else {
            if (items.find(item => item.endsWith('.tgz'))) {
              packages.push(item.name);
              this.logger.trace(
                {
                  packageName: item.name,
                },
                '[verdaccio-offline-storage/get/search/readdir] found locally available package: "@{packageName}"'
              );
            } else {
              this.logger.trace(
                {
                  packageName: item.name,
                },
                '[verdaccio-offline-storage/get/search/readdir] no locally available version found for package: "@{packageName}"'
              );
            }
            cb();
          }
        });
      },
      () => {
        this.data.list = packages;
        callback(null, packages);
        this.logger.trace(
          {
            totalItems: packages.length,
          },
          'verdaccio-offline-storage: [get] full list of packages (@{totalItems}) has been fetched'
        );
      },
      name => !name.startsWith('.') // so `.{sinopia|verdaccio}-db.json` gets ignored
    );
  }

  /**
   * Returns the `IPackageStorage` used internally for packages I/O operations.
   *
   * @param {string} packageName Package name.
   * @return {OfflinePackageStorage}
   * @see https://verdaccio.org/docs/en/plugin-storage#api
   */
  getPackageStorage(packageName) {
    return new OfflinePackageStorage(join(this.config.storage, packageName), this.logger, this.config);
  }
}
