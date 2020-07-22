import { UploadTarball, ReadTarball } from "@verdaccio/streams";
import { getNotFound, getConflict, getInternalError } from '@verdaccio/commons-api';


export default class StoragePluginManage {
  constructor(packageName, helper, config, logger) {
    this.logger = logger;
    this.packageName = packageName;
    this.config = config;
  }

  /**
   * Handle a metadata update and
   * @param name
   * @param updateHandler
   * @param onWrite
   * @param transformPackage
   * @param onEnd
   */
  updatePackage(name, updateHandler, onWrite, transformPackage, onEnd) {
    /**
     * Example of implementation:
      this.customStore.get().then((pkg: Package) => {
        updateHandler(pkg, function onUpdateFinish(err) {
          if (err) {
            onEnd(err);
          } else {
            onWrite(name, pkg, onEnd);
          }
        })
      });
     */
  }

  /**
   * Delete a specific file (tarball or package.json)
   * @param fileName
   * @param callback
   */
  deletePackage(fileName, callback) {
     /**
     * Example of implementation:
     this.customStore.delete(fileName,  (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      })
     */
  }

  /**
   * Delete a package (folder, path)
   * This happens after all versions ar tarballs have been removed.
   * @param callback
   */
  removePackage(callback) {
    /**
     * Example of implementation:
      this.customStore.removePackage((err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      })
     */
  }

 /**
   * Publish a new package (version).
   * @param name
   * @param data
   * @param callback
   */
  createPackage(name, metadata, cb) {
    /**
     * Example of implementation:
     * this.customStore.create(name, data).then(err => {
        if (err.notFound) {
          callback(getNotFound());
        } else if (err.alreadyExist) {
          callback(getConflict());
        } else {
          callback(null);
        }
      })
     */
  }

  /**
   * Perform write anobject to the storage.
   * Similar to updatePackage but without middleware handlers
   * @param pkgName package name
   * @param pkg package metadata
   * @param callback
   */
  savePackage(name, value, cb) {
     /*
      Example of implementation:
      this.cumstomStore.write(pkgName, pkgName).then(data => {
        callback(null);
      }).catch(err => {
        callback(getInternalError(err.message));
      })
    */
  }

  /**
   * Read a package from storage
   * @param pkgName package name
   * @param callback
   */
  readPackage(name, cb) {
    /**
     * Example of implementation:
     * this.customStorage.read(name, (err, pkg: Package) => {
          if (err.fooError) {
            callback(getInternalError(err))
          } else if (err.barError) {
            callback(getNotFound());
          } else {
            callback(null, pkg)
          }
      });
     */
  }

  /**
   * Create writtable stream (write a tarball)
   * @param name
   */
  writeTarball(name) {
     /**
       * Example of implementation:
       * const stream = new UploadTarball({});
         return stream;
       */
  }

  /**
   * Create a readable stream (read a from a tarball)
   * @param name
   */
  readTarball(name) {
    /**
     * Example of implementation:
     * const stream = new ReadTarball({});
       return stream;
     */
  }
};
