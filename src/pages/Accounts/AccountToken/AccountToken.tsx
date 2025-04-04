import { CAIP19 } from '@shapeshiftoss/caip'
import toLower from 'lodash/toLower'
import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router-dom'
import { Route } from 'Routes/helpers'
import { AssetAccountDetails } from 'components/AssetAccountDetails'
import { AccountSpecifier } from 'state/slices/accountSpecifiersSlice/accountSpecifiersSlice'
import { selectAccountSpecifierStrings } from 'state/slices/selectors'
export type MatchParams = {
  accountId: AccountSpecifier
  assetId: CAIP19
}

type AccountTokenProps = {
  route?: Route
}

export const AccountToken = ({ route }: AccountTokenProps) => {
  const { accountId, assetId } = useParams<MatchParams>()

  /**
   * if the user switches the wallet while visiting this page,
   * the accountId is no longer valid for the app,
   * so we'll redirect user to the "accounts" page,
   * in order to choose the account from beginning.
   */
  const accountSpecifierStrings = useSelector(selectAccountSpecifierStrings)
  const isCurrentAccountIdOwner = Boolean(
    accountSpecifierStrings.map(toLower).includes(toLower(accountId))
  )
  if (!isCurrentAccountIdOwner) return <Redirect to='/accounts' />

  const caip19 = assetId ? decodeURIComponent(assetId) : null
  if (!caip19) return null
  return (
    <AssetAccountDetails assetId={caip19} accountId={accountId} route={route} key={accountId} />
  )
}
