import { Asset, chainAdapters, MarketData } from '@shapeshiftoss/types'
import { useEffect, useState } from 'react'
import { ensReverseLookup } from 'lib/ens'
import { ReduxState } from 'state/reducer'
import { selectAssetByCAIP19, selectMarketDataById, selectTxById } from 'state/slices/selectors'
import { Tx } from 'state/slices/txHistorySlice/txHistorySlice'
import { useAppSelector } from 'state/store'

// Adding a new supported method? Also update transactionRow.parser translations accordingly
export enum ContractMethod {
  Deposit = 'deposit',
  Approve = 'approve',
  Withdraw = 'withdraw',
  AddLiquidityEth = 'addLiquidityETH',
  RemoveLiquidityEth = 'removeLiquidityETH',
  TransferOut = 'transferOut'
}

export enum Direction {
  InPlace = 'in-place',
  Outbound = 'outbound',
  Inbound = 'inbound'
}

export interface TxDetails {
  tx: Tx
  buyTransfer?: chainAdapters.TxTransfer
  sellTransfer?: chainAdapters.TxTransfer
  tradeTx?: chainAdapters.TxTransfer
  feeAsset?: Asset
  buyAsset?: Asset
  sellAsset?: Asset
  value?: string
  to: string
  ensTo?: string
  from: string
  ensFrom?: string
  type: chainAdapters.TradeType | chainAdapters.TxType | ''
  symbol: string
  precision: number
  explorerTxLink: string
  explorerAddressLink: string
  direction?: Direction
  sourceMarketData: MarketData
  destinationMarketData: MarketData
  feeMarketData: MarketData
}

export const getStandardTx = (tx: Tx) => (tx.transfers.length === 1 ? tx.transfers[0] : undefined)
export const getTransferByType = (tx: Tx, txType: chainAdapters.TxType) =>
  tx.transfers.find(t => t.type === txType)
export const getBuyTransfer = (tx: Tx) => getTransferByType(tx, chainAdapters.TxType.Receive)
export const getSellTransfer = (tx: Tx) => getTransferByType(tx, chainAdapters.TxType.Send)
export const getTransferByAsset = (tx: Tx, asset: Asset) =>
  tx.transfers.find(t => t.caip19 === asset.caip19)

export const isSupportedContract = (tx: Tx) =>
  Object.values(ContractMethod).includes(tx.data?.method as ContractMethod)

/**
 * isTradeContract
 *
 * Returns true when a tx has transfers matching the generalized idea of a
 * trade (i.e. some account sells to pool A and buys from pool B).
 *
 * @param buyTransfer transfer with TxType.Receive
 * @param sellTransfer transfer with TxType.Send
 * @returns boolean
 */
export const isTradeContract = (
  buyTransfer: chainAdapters.TxTransfer,
  sellTransfer: chainAdapters.TxTransfer
): boolean => {
  return sellTransfer.from === buyTransfer.to && sellTransfer.to !== buyTransfer.from
}

export const useTxDetails = (txId: string, activeAsset?: Asset): TxDetails => {
  const tx = useAppSelector((state: ReduxState) => selectTxById(state, txId))
  const method = tx.data?.method

  const standardTx = getStandardTx(tx)
  const buyTransfer = getTransferByType(tx, chainAdapters.TxType.Receive)
  const sellTransfer = getTransferByType(tx, chainAdapters.TxType.Send)
  const tradeTx = (activeAsset && getTransferByAsset(tx, activeAsset)) ?? buyTransfer
  // const tradeTx = activeAsset?.caip19 === sellTransfer?.caip19 ? sellTransfer : buyTransfer

  const direction: Direction | undefined = (() => {
    switch (method) {
      case ContractMethod.Deposit:
      case ContractMethod.AddLiquidityEth:
      case ContractMethod.TransferOut:
        return Direction.Outbound
      case ContractMethod.Withdraw:
      case ContractMethod.RemoveLiquidityEth:
        return Direction.Inbound
      case ContractMethod.Approve:
        return Direction.InPlace
      default:
        return undefined
    }
  })()

  const standardAsset = useAppSelector((state: ReduxState) =>
    selectAssetByCAIP19(state, standardTx?.caip19 ?? '')
  )

  // stables need precision of eth (18) rather than 10
  const feeAsset = useAppSelector(state => selectAssetByCAIP19(state, tx.fee?.caip19 ?? ''))
  const buyAsset = useAppSelector(state => selectAssetByCAIP19(state, buyTransfer?.caip19 ?? ''))
  const sellAsset = useAppSelector(state => selectAssetByCAIP19(state, sellTransfer?.caip19 ?? ''))
  const tradeAsset = activeAsset?.symbol === sellAsset?.symbol ? sellAsset : buyAsset
  const sourceMarketData = useAppSelector(state =>
    selectMarketDataById(state, sellTransfer?.caip19 ?? '')
  )
  const destinationMarketData = useAppSelector(state =>
    selectMarketDataById(state, buyTransfer?.caip19 ?? '')
  )
  const feeMarketData = useAppSelector(state => selectMarketDataById(state, tx.fee?.caip19 ?? ''))

  const value = standardTx?.value ?? tradeTx?.value ?? undefined
  const to = standardTx?.to ?? tradeTx?.to ?? ''
  const from = standardTx?.from ?? tradeTx?.from ?? ''

  const [ensFrom, setEnsFrom] = useState<string>()
  const [ensTo, setEnsTo] = useState<string>()

  useEffect(() => {
    ;(async () => {
      const reverseFromLookup = await ensReverseLookup(from)
      const reverseToLookup = await ensReverseLookup(to)
      !reverseFromLookup.error && setEnsFrom(reverseFromLookup.name)
      !reverseToLookup.error && setEnsTo(reverseToLookup.name)
    })()
  }, [from, to])
  const tradeType =
    buyTransfer && sellTransfer && isTradeContract(buyTransfer, sellTransfer)
      ? chainAdapters.TradeType.Trade
      : undefined
  const type = isSupportedContract(tx)
    ? chainAdapters.TxType.Contract
    : standardTx?.type ?? tx.tradeDetails?.type ?? tradeType ?? ''
  const symbol = standardAsset?.symbol ?? tradeAsset?.symbol ?? ''
  const precision = standardAsset?.precision ?? tradeAsset?.precision ?? 18
  const explorerTxLink =
    standardAsset?.explorerTxLink ?? tradeAsset?.explorerTxLink ?? feeAsset?.explorerTxLink ?? ''
  const explorerAddressLink =
    standardAsset?.explorerAddressLink ??
    tradeAsset?.explorerAddressLink ??
    feeAsset?.explorerAddressLink ??
    ''

  return {
    tx,
    buyTransfer,
    sellTransfer,
    tradeTx,
    feeAsset,
    buyAsset,
    sellAsset,
    value,
    to,
    ensTo,
    from,
    ensFrom,
    type,
    symbol,
    precision,
    explorerTxLink,
    explorerAddressLink,
    direction,
    sourceMarketData,
    destinationMarketData,
    feeMarketData
  }
}
