import { CAIP19 } from '@shapeshiftoss/caip'
import { useMemo } from 'react'
import { useTranslate } from 'react-polyglot'
import { Card } from 'components/Card/Card'
import { TransactionHistoryList } from 'components/TransactionHistory/TransactionHistoryList'
import { useWallet } from 'context/WalletProvider/WalletProvider'
import { useWalletSupportsChain } from 'hooks/useWalletSupportsChain/useWalletSupportsChain'
import { AccountSpecifier } from 'state/slices/accountSpecifiersSlice/accountSpecifiersSlice'
import {
  selectAccountIdsByAssetId,
  selectAssetByCAIP19,
  selectTxIdsByFilter
} from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

type AssetTransactionHistoryProps = {
  assetId: CAIP19
  accountId?: AccountSpecifier
  useCompactMode?: boolean
  limit?: number
}

export const AssetTransactionHistory: React.FC<AssetTransactionHistoryProps> = ({
  assetId,
  accountId,
  useCompactMode = false,
  limit
}) => {
  const translate = useTranslate()
  const {
    state: { wallet }
  } = useWallet()

  const asset = useAppSelector(state => selectAssetByCAIP19(state, assetId))
  const chainId = asset.caip2
  const accountIds = useAppSelector(state => selectAccountIdsByAssetId(state, assetId))
  const filter = useMemo(
    // if we are passed an accountId, we're on an asset account page, use that specifically.
    // otherwise, we're on an asset page, use all accountIds related to this asset
    () => ({ assetIds: [assetId], accountIds: accountId ? [accountId] : accountIds }),
    [assetId, accountId, accountIds]
  )

  const walletSupportsChain = useWalletSupportsChain({ chainId, wallet })

  const txIds = useAppSelector(state => selectTxIdsByFilter(state, filter))

  if (!walletSupportsChain) return null

  return (
    <Card>
      <Card.Header>
        <Card.Heading>
          {translate(
            useCompactMode
              ? 'transactionHistory.recentTransactions'
              : 'transactionHistory.transactionHistory'
          )}
        </Card.Heading>
      </Card.Header>
      <TransactionHistoryList
        txIds={limit ? txIds.slice(0, limit) : txIds}
        useCompactMode={useCompactMode}
      />
    </Card>
  )
}
