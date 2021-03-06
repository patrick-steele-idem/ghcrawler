// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const config = require('painless-config');
const CrawlerService = require('../CrawlerService');
const createRefreshingOptions = require('../options').createRefreshingOptions;
const crawlerFactory = require('./crawlerFactory');
const factoryLogger = require('./util/logger');

const subsystemNames = ['crawler', 'fetcher', 'queuing', 'storage', 'locker'];

function createService(options) {
  factoryLogger.info('appInitStart');
  const crawlerName = config.get('CRAWLER_NAME') || 'crawler';
  let mode = options.mode || config.get('CRAWLER_MODE') || '';
  const optionsProvider = mode === 'InMemory' ? 'memory' : (config.get('CRAWLER_OPTIONS_PROVIDER') || 'memory');
  const crawlerPromise = createRefreshingOptions(crawlerName, subsystemNames, optionsProvider, options).then(options => {
    factoryLogger.info(`creating refreshingOption completed`);
    mode = mode || 'InMemory';
    factoryLogger.info(`begin create crawler of type ${mode}`);
    const crawler = crawlerFactory[`create${mode}Crawler`](options);
    return [crawler, options];
  });
  return new CrawlerService(crawlerPromise);
}

exports.createService = createService;