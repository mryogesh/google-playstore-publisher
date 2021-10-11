#!/usr/bin/env node
const aab = 'aab'
const apk = 'apk'
const fileTypes = [aab, apk]

const standard = "standard"
const appShare = "appShare"
const uploadTypes = [standard, appShare]

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
  .option('p', {
    alias: 'filePath',
    type: 'string',
    describe: 'Release apk/aab file path',
    demand: true
  })
  .option('n', {
    alias: 'name',
    type: 'string',
    describe: 'Enter file name',
    demand: true
  })
  .option('f', {
    alias: 'fileType',
    choices: fileTypes,
    describe: 'Choose file type',
    demand: true
  })
  .option('u', {
    alias: 'uploadType',
    choices: uploadTypes,
    describe: 'Choose upload type',
    default: standard
  })
  .help('h').argv;

const options = {
  track: argv.track,
  keyFilePath: argv.key,
  filePath: argv.filePath,
  packageName: argv.packageName,
};

const shareOptions = {
  keyFilePath: argv.key,
  filePath: argv.filePath,
  packageName: argv.packageName,
}

const fileType = argv.fileType

const uploadType = argv.uploadType

const playstore = require('./index');

if (uploadType == appShare) {
  playstore.shareAAB(shareOptions).catch(err => {
    console.error(err)
  }).then(() => {
    process.exit(1);
  })
}

if (fileType === aab) {
  playstore.publishAAB(options).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else if (fileType == apk) {
  playstore.publishAPK(options).catch(err => {
    console.error(err);
    process.exit(1);
  });
}