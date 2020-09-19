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
  constructor(path, logger, offlineMode) {
    super(path, logger);
    this.offlineMode = offlineMode;
  }
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
        this.logger.debug(
          {
            packageName: name,
          },
          '[verdaccio-offline-storage/readPackage] discovering local versions for package: @{packageName}'
        );
        readdir(this.path, (err, items) => {
          if (err) {
            this.logger.trace(
              {
                err,
                packageName: name,
              },
              '[verdaccio-offline-storage/readPackage/readdir] error discovering package "@{packageName}" files: @{err}'
            );
            cb(err);
          } else if (this.offlineMode) {
            const localVersions = items
              .filter(item => item.endsWith('.tgz'))
              .map(item => item.substring(basename(name).length + 1, item.length - 4));
            this.logger.trace(
              {
                packageName: name,
                count: localVersions.length,
              },
              '[verdaccio-offline-storage/readPackage/readdir] offline mode - discovered @{count} items for package: @{packageName}'
            );
            const allVersions = Object.keys(data.versions);
            const originalVersionCount = allVersions.length;
            this.logger.trace(
              {
                packageName: name,
                count: originalVersionCount,
              },
              '[verdaccio-offline-storage/readPackage/readdir] offline mode - analyzing @{count} declared versions for package: @{packageName}'
            );
            for (const version of allVersions) {
              if (!localVersions.includes(version)) {
                delete data.versions[version];
                this.logger.trace(
                  {
                    packageName: name,
                    version,
                  },
                  '[verdaccio-offline-storage/readPackage/readdir] offline mode - removed @{packageName}@@{version}'
                );
              }
            }
            this.logger.trace(
              {
                packageName: name,
                count: originalVersionCount - Object.keys(data.versions).length,
              },
              '[verdaccio-offline-storage/readPackage/readdir] offline mode - removed @{count} versions for package: @{packageName}'
            );
            data['dist-tags'].latest = Object.keys(data.versions).sort((a, b) => cmp(b, a))[0];
            this.logger.trace(
              {
                packageName: name,
                latest: data['dist-tags'].latest,
              },
              '[verdaccio-offline-storage/readPackage/readdir] offline mode - set latest version to @{latest} for package: @{packageName}'
            );
            cb(null, data);
          } else {
            this.logger.trace(
              {
                packageName: name,
              },
              '[verdaccio-offline-storage/readPackage/readdir] online mode - local package @{packageName} found'
            );
            cb(null, data);
          }
        });
      }
    });
  }
}
