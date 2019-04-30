// @flow
import type {HMRServerOptions} from './types.js.flow';

import {Reporter} from '@parcel/plugin';
import HMRServer from './HMRServer';

const DEFAULT_CACHE_DIR = '.parcel-cache';

let servers: Map<number, HMRServer> = new Map();
export default new Reporter({
  async report(event, options, targets) {
    let hot = options.hot;
    if (!hot) return;

    let isBrowser = targets.some(target => target.env.context === 'browser');
    if (!isBrowser) return;

    let hmrOptions: HMRServerOptions = {
      ...hot,
      cacheDir: options.cacheDir || DEFAULT_CACHE_DIR
    };

    let server = servers.get(hmrOptions.port);
    if (!server) {
      server = new HMRServer(hmrOptions);
      servers.set(hmrOptions.port, server);
      await server.start();
    }

    if (event.type === 'buildSuccess') {
      server.emitUpdate(event);
    }

    if (event.type === 'buildFailure') {
      server.emitError(event.error);
    }
  }
});
