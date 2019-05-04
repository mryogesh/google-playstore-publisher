#!/usr/bin/env node

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('t', {
    alias: 'track',
    type: 'string',
    default: 'internal'
  })
  .option('k', {
    alias: 'key',
    type: 'string',
    describe: 'Service account file path',
    demand: true
  })
  .option('a', {
    alias: 'apk',
    type: 'string',
    describe: 'Release apk file path',
    demand: true
  })
  .option('p', {
    alias: 'packageName',
    type: 'string',
    describe: 'Enter package name',
    demand: true
  })
  .help('h').argv;

const options = {
  track: argv.track,
  keyFilePath: argv.key,
  apkFilePath: argv.apk,
  packageName: argv.packageName
};

const playstore = require('./index');

playstore.publish(options).catch(err => {
  console.error(err);
  process.exit(1);
});
