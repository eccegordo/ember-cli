'use strict';

var Promise    = require('../../lib/ext/promise');
var assertFile = require('ember-cli-internal-test-helpers/lib/helpers/assert-file');
var conf       = require('../helpers/conf');
var ember      = require('../helpers/ember');
var path       = require('path');
var remove     = Promise.denodeify(require('fs-extra').remove);
var root       = process.cwd();
var tmproot    = path.join(root, 'tmp');
var expect     = require('chai').expect;
var mkTmpDirIn = require('../../lib/utilities/mk-tmp-dir-in');

describe('Acceptance: ember install', function() {
  this.timeout(60000);

  before(function() {
    conf.setup();
  });

  after(function() {
    conf.restore();
  });

  beforeEach(function() {
    return mkTmpDirIn(tmproot).then(function(tmpdir) {
      process.chdir(tmpdir);
    });
  });

  afterEach(function() {
    process.chdir(root);
    return remove(tmproot);
  });

  function initApp() {
    return ember([
      'init',
      '--name=my-app',
      '--skip-npm',
      '--skip-bower'
    ]);
  }

  function installAddon(args) {
    var generateArgs = ['install'].concat(args);

    return initApp().then(function() {
      return ember(generateArgs);
    });
  }

  it('installs addons via npm and runs generators', function() {
    return installAddon(['ember-cli-fastclick', 'ember-cli-photoswipe']).then(function(result) {
      assertFile('package.json', {
        contains: [
          /"ember-cli-fastclick": ".*"/,
          /"ember-cli-photoswipe": ".*"/
        ]
      });

      assertFile('bower.json', {
        contains: [
          /"fastclick": ".*"/,
          /"photoswipe": ".*"/
        ]
      });

      expect(result.outputStream.join()).not.to.include('The `ember generate` command ' +
                                              'requires an entity name to be specified. For more details, use `ember help`.');
    });
  });
});
