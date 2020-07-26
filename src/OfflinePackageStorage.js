import { readdir } from 'fs';
import { basename } from 'path';
import cmp from 'semver-compare';
import LocalFS from '@verdaccio/local-storage/lib/local-fs';

/**
 * `IPackageStorage` used internally for packages I/O operations.
 *
 * This works just like the `IPackageStorage` used by the local-storage plugin but modifying
 * the packages definition files (the local-storage `package.json` files) so only the locally
 * available versions appears in the definition. This does **NOT** modifies the original
 * `package.json` file stored in the local-storage cache, meaning that all the modifications are
 * done on the fly, on demand and in memory.
 *
 * @see https://verdaccio.org/docs/en/plugin-storage#api
 * @see https://github.com/verdaccio/monorepo/tree/master/plugins/local-storage
 */
export default class OfflinePackageStorage extends LocalFS {
  /**
   * Computes a package's definition that only lists the locally available versions.
   *
   * @param {string} name Package name.
   * @param cb Callback to invoke with the computed definition.
   */
  readPackage(name, cb) {
    super.readPackage(name, (err, data) => {
      if (err) {
        cb(err);
      } else {
        readdir(this.path, (err, items) => {
          if (err) {
            cb(err);
          } else {
            const localVersions = items
              .filter(item => item.endsWith('.tgz'))
              .map(item => item.substring(basename(name).length + 1, item.length - 4));
            const allVersions = Object.keys(data.versions);
            for (const version of allVersions) {
              if (!localVersions.includes(version)) {
                delete data.versions[version];
              }
            }
            data['dist-tags'].latest = Object.keys(data.versions).sort((a, b) => cmp(b, a))[0];
            cb(null, data);
          }
        });
      }
    });
  }
}
