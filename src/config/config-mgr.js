import createLogger from '../logger.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import betterAjvErrors from 'better-ajv-errors';
import loadConfig from 'load-config-file';
import schema from './schema.js';
const logger = createLogger('config');
const ajv = new Ajv();
addFormats(ajv);

const defaultConfig = {
  basePort: 3000,
  dbFileName: 'chat.db'
};

loadConfig.register('.json', JSON.parse);


export default async function getConfig() {
  return new Promise(function (resolve, reject) {
    loadConfig('config', (e, config) => {
      if (e) {
        logger.warning('Could not find configuration, using default');
        resolve(defaultConfig)
        return defaultConfig
      } else {
        const validate = ajv.compile(schema)
        const isValid = validate(config);
        if (!isValid) {
          reject('Invalid configuration');
          logger.error('Invalid configuration');
          logger.log(betterAjvErrors(schema, config, validate.errors, { format: 'cli', indent: 2 }));
          process.exit(1);
        }
        logger.debug('Configuration found', JSON.stringify(config));
        resolve(config);
        return config;
      }
    });
  });
}