import { readdir } from 'fs';
import { basename } from 'path';
import cmp from 'semver-compare';
import LocalFS from '@verdaccio/local-storage/lib/local-fs';

export default class OfflineStorage extends LocalFS {
  readPackage(name, cb) {
    super.readPackage(name, (err, data) => {
      if (err) {
        cb(err);
      } else {
        readdir(this.path, (err, items) => {
          if (err) {
            cb(err);
          } else {
            const versions = items
              .filter(item => item.endsWith('.tgz'))
              .map(item => item.substring(basename(name).length + 1, item.length - 4));
            const allVersions = Object.keys(data.versions);
            for (const version of allVersions) {
              if (!versions.includes(version)) {
                delete data.versions[version];
              }
            }
            data['dist-tags'].latest = versions.sort((a, b) => cmp(b, a))[0];
            cb(null, data);
          }
        });
      }
    });
  }
}
