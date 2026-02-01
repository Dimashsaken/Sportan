import {
  logger,
  consoleTransport,
  fileAsyncTransport,
} from 'react-native-logs';
import * as FileSystem from 'expo-file-system';

const config = {
  transport: __DEV__ ? consoleTransport : fileAsyncTransport,
  severity: __DEV__ ? 'debug' : 'error',
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    } as const,
    FS: FileSystem,
    fileName: `logs_${new Date().toISOString().split('T')[0]}`,
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

export const LOG = logger.createLogger(config);
