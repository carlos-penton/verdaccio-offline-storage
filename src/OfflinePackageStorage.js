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
  constructor(path, logger, config) {
    super(path, logger);
    this.config = config;
  }
  /**
   * Computes a package's definition that only lists the locally available versions.
   *
   * @param {string} name Package name.
   * @param cb Callback to invoke with the computed definition.
   */
  readPackage(name, cb) {
    const packageAccess = this.config.getMatchedPackagesSpec(name);
    // It's offline if set explicitly in the config or if no proxy is defined for the package
    const offline = this.config.offline || !packageAccess.proxy || !packageAccess.proxy.length;
    if (!offline) {
      this.logger.trace(
        {
          packageName: name,
        },
        '[verdaccio-offline-storage/readPackage] Resolving package @{packageName} in online mode'
      );
      super.readPackage(name, cb);
      return;
    }
    this.logger.trace(
      {
        packageName: name,
      },
      '[verdaccio-offline-storage/readPackage] Resolving package @{packageName} in offline mode'
    );
    super.readPackage(name, (err, data) => {
      if (err) {
        cb(err);
      } else {
        this.logger.trace(
          {
            packageName: name,
          },
          '[verdaccio-offline-storage/readPackage] Discovering local versions for package: @{packageName}'
        );
        readdir(this.path, (err, items) => {
          if (err) {
            this.logger.trace(
              {
                err,
                packageName: name,
              },
              '[verdaccio-offline-storage/readPackage/readdir] Error discovering package "@{packageName}" files: @{err}'
            );
            cb(err);
          } else {
            const localVersions = items
              .filter(item => item.endsWith('.tgz'))
              .map(item => item.substring(basename(name).length + 1, item.length - 4));
            this.logger.trace(
              {
                packageName: name,
                count: localVersions.length,
              },
              '[verdaccio-offline-storage/readPackage/readdir] Discovered @{count} items for package: @{packageName}'
            );
            const allVersions = Object.keys(data.versions);
            const originalVersionCount = allVersions.length;
            this.logger.trace(
              {
                packageName: name,
                count: originalVersionCount,
              },
              '[verdaccio-offline-storage/readPackage/readdir] Analyzing @{count} declared versions for package: @{packageName}'
            );
            for (const version of allVersions) {
              if (!localVersions.includes(version)) {
                delete data.versions[version];
                this.logger.trace(
                  {
                    packageName: name,
                    version,
                  },
                  '[verdaccio-offline-storage/readPackage/readdir] Removed @{packageName}@@{version}'
                );
              }
            }
            this.logger.trace(
              {
                packageName: name,
                count: originalVersionCount - Object.keys(data.versions).length,
              },
              '[verdaccio-offline-storage/readPackage/readdir] Removed @{count} versions for package: @{packageName}'
            );
            data['dist-tags'].latest = Object.keys(data.versions).sort((a, b) => cmp(b, a))[0];
            this.logger.trace(
              {
                packageName: name,
                latest: data['dist-tags'].latest,
              },
              '[verdaccio-offline-storage/readPackage/readdir] Set latest version to @{latest} for package: @{packageName}'
            );
            cb(null, data);
          }
        });
      }
    });
  }
}
