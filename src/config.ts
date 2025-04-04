import * as envalid from 'envalid'
import { bool } from 'envalid'

import env from './env'

const { cleanEnv, str, url } = envalid

// add validators for each .env variable
// note env vars must be prefixed with REACT_APP_
const validators = {
  REACT_APP_UNCHAINED_ETHEREUM_HTTP_URL: url(),
  REACT_APP_UNCHAINED_ETHEREUM_WS_URL: url(),
  REACT_APP_UNCHAINED_BITCOIN_HTTP_URL: url(),
  REACT_APP_UNCHAINED_BITCOIN_WS_URL: url(),
  REACT_APP_UNCHAINED_COSMOS_HTTP_URL: url(),
  REACT_APP_UNCHAINED_COSMOS_WS_URL: url(),
  REACT_APP_ETHEREUM_NODE_URL: url(),
  REACT_APP_PORTIS_DAPP_ID: str({ devDefault: 'fakePortisId' }),
  REACT_APP_HIDE_SPLASH: bool({ default: false }),
  REACT_APP_GEM_COINIFY_SUPPORTED_COINS: url(),
  REACT_APP_GEM_WYRE_SUPPORTED_COINS: url(),
  REACT_APP_GEM_ASSET_LOGO: url(),
  REACT_APP_GEM_ENV: str(),
  REACT_APP_GEM_API_KEY: str(),
  REACT_APP_FEATURE_YEARN: bool({ default: true }),
  REACT_APP_FEATURE_COSMOS_INVESTOR: bool({ default: false }),
  REACT_APP_FEATURE_PLUGIN_BITCOIN: bool({ default: false }),
  REACT_APP_FEATURE_PLUGIN_COSMOS: bool({ default: false }),
  REACT_APP_FEATURE_GEM_RAMP: bool({ default: false }),
  REACT_APP_FEATURE_FOXY_INVESTOR: bool({ default: false }),
  REACT_APP_REDUX_LOGGING: bool({ default: false })
}

function reporter<T>({ errors }: envalid.ReporterOptions<T>) {
  Object.entries(errors).forEach(([envVar, err]) => {
    if (!err) return
    console.error(err)
    console.error(
      envVar,
      'missing from config. Check sample.env and add it to your local .env and add a validator in config.ts'
    )
  })
}

export const getConfig = () => cleanEnv(env, validators, { reporter })
