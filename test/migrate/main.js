const migrate = require('../../src/tabel.migrate');
const Tabel = require('../../src/Orm');
const config = require('../config');

const testWithDefaultStub = require('./testWithDefaultStub');
const testWithCustomStub = require('./testWithCustomStub');

// handle promise errors
process.on('unhandledRejection', err => { throw err; });

function run(mode, ...args) {
  const argsConfig = argsToConfig(args);

  if (Object.keys(argsConfig).length > 7) {
    return Promise.reject(new Error('invalid arguments'));
  }

  const orm = new Tabel(config[argsConfig.driver]);

  (() => (
    mode === 'custom' ? testWithCustomStub(migrate, orm, ...args) :
    mode === 'default' ? testWithDefaultStub(migrate, orm, ...args) :
    null
  ))();
}

function argsToConfig(args) {
  return args.reduce((config, token) => {
    const [key, val] = token.split('=');
    return {
      ...config,
      [key]: val
    };
  }, {});
}


run(...process.argv.slice(2));
