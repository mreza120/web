import { AssetNamespace } from '@shapeshiftoss/caip'
import { Asset, AssetDataSource, ChainTypes, NetworkTypes } from '@shapeshiftoss/types'

export const BTC: Asset = {
  caip2: 'bip122:000000000019d6689c085ae165831e93',
  caip19: 'bip122:000000000019d6689c085ae165831e93/slip44:0',
  name: 'bitcoin',
  chain: ChainTypes.Bitcoin,
  network: NetworkTypes.MAINNET,
  precision: 8,
  slip44: 0,
  contractType: AssetNamespace.ERC20,
  color: '#FFFFFF',
  secondaryColor: '#FFFFFF',
  dataSource: AssetDataSource.CoinGecko,
  icon: 'https://assets.coincap.io/assets/icons/btc@2x.png',
  explorer: 'https://live.blockcypher.com',
  explorerTxLink: 'https://live.blockcypher.com/btc/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  sendSupport: false,
  receiveSupport: false,
  symbol: 'BTC'
}
export const WETH: Asset = {
  caip2: 'eip155:1',
  caip19: 'eip155:1/erc20:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  name: 'WETH',
  chain: ChainTypes.Ethereum,
  dataSource: AssetDataSource.CoinGecko,
  network: NetworkTypes.MAINNET,
  precision: 18,
  tokenId: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  contractType: AssetNamespace.ERC20,
  color: '#FFFFFF',
  secondaryColor: '#FFFFFF',
  icon: 'https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1628852295',
  slip44: 0,
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  sendSupport: true,
  receiveSupport: true,
  symbol: 'WETH'
}

export const ETH: Asset = {
  caip2: 'eip155:1',
  caip19: 'eip155:1/slip44:60',
  chain: ChainTypes.Ethereum,
  dataSource: AssetDataSource.CoinGecko,
  network: NetworkTypes.MAINNET,
  symbol: 'ETH',
  name: 'Ethereum',
  precision: 18,
  slip44: 60,
  color: '#FFFFFF',
  secondaryColor: '#FFFFFF',
  icon: 'https://assets.coincap.io/assets/icons/eth@2x.png',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  sendSupport: true,
  receiveSupport: true
}

export const FOX: Asset = {
  caip2: 'eip155:1',
  caip19: 'eip155:1/erc20:0xc770eefad204b5180df6a14ee197d99d808ee52d',
  name: 'Fox',
  chain: ChainTypes.Ethereum,
  dataSource: AssetDataSource.CoinGecko,
  network: NetworkTypes.MAINNET,
  precision: 18,
  tokenId: '0xc770eefad204b5180df6a14ee197d99d808ee52d',
  contractType: AssetNamespace.ERC20,
  color: '#FFFFFF',
  secondaryColor: '#FFFFFF',
  icon: 'https://assets.coincap.io/assets/icons/fox@2x.png',
  sendSupport: true,
  slip44: 0,
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  receiveSupport: true,
  symbol: 'FOX'
}
export const USDC: Asset = {
  caip2: 'eip155:1',
  caip19: 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  name: 'USD Coin',
  chain: ChainTypes.Ethereum,
  dataSource: AssetDataSource.CoinGecko,
  network: NetworkTypes.MAINNET,
  precision: 6,
  tokenId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  contractType: AssetNamespace.ERC20,
  color: '#FFFFFF',
  secondaryColor: '#FFFFFF',
  icon: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  sendSupport: true,
  receiveSupport: true,
  symbol: 'USDC',
  slip44: 60
}

export const ETHCHAIN_QUOTE = {
  sellAsset: WETH,
  buyAsset: USDC,
  priceImpact: '0.00353623343019489995',
  success: true,
  statusCode: 0,
  rate: '3839.269108',
  minimum: '0.000259545173425274',
  maximum: '100000000000000000000000000',
  feeData: {
    fee: '153244500000000000',
    chainSpecific: {
      estimatedGas: '424500',
      gasPrice: '361000000000'
    }
  },
  sellAmount: '324000000000000000000',
  buyAmount: '1243923191084',
  sources: [
    {
      name: 'Uniswap_V3',
      proportion: '1'
    }
  ]
}

export const ETHCHAIN_QUOTE_FEES = {
  chainSpecific: {
    approvalFee: '0',
    estimatedGas: '424500',
    gasPrice: '361000000000',
    totalFee: '0.1532445'
  },
  fee: '0.1532445'
}

export const MIN_MAX = { minimum: '1000000', minimumPrice: '5000' }
