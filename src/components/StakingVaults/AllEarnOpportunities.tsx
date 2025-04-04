import { Box } from '@chakra-ui/react'
import {
  EarnOpportunityType,
  useNormalizeOpportunities
} from 'features/defi/helpers/normalizeOpportunity'
import qs from 'qs'
import { useCallback } from 'react'
import { useHistory, useLocation } from 'react-router'
import { Card } from 'components/Card/Card'
import { Text } from 'components/Text'
import { useWallet, WalletActions } from 'context/WalletProvider/WalletProvider'
import { useSortedYearnVaults } from 'hooks/useSortedYearnVaults/useSortedYearnVaults'
import { useFoxyBalances } from 'pages/Defi/hooks/useFoxyBalances'
import { selectFeatureFlag } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { StakingTable } from './StakingTable'

export const AllEarnOpportunities = () => {
  const history = useHistory()
  const location = useLocation()
  const foxyInvestorFeatureFlag = useAppSelector(state => selectFeatureFlag(state, 'FoxyInvestor'))
  const {
    state: { isConnected },
    dispatch
  } = useWallet()
  const sortedVaults = useSortedYearnVaults()
  const { opportunities } = useFoxyBalances()

  const foxyRows = foxyInvestorFeatureFlag ? opportunities : []

  const allRows = useNormalizeOpportunities({
    vaultArray: sortedVaults,
    foxyArray: foxyRows
  })

  const handleClick = useCallback(
    (opportunity: EarnOpportunityType) => {
      const { type, provider, contractAddress, chain, tokenAddress, rewardAddress } = opportunity
      if (!isConnected) {
        dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: true })
        return
      }
      history.push({
        pathname: `/defi/${type}/${provider}/deposit`,
        search: qs.stringify({
          chain,
          contractAddress,
          tokenId: tokenAddress,
          rewardId: rewardAddress
        }),
        state: { background: location }
      })
    },
    [dispatch, history, isConnected, location]
  )

  return (
    <Card variant='outline' my={6}>
      <Card.Header flexDir='row' display='flex'>
        <Box>
          <Card.Heading>
            <Text translation='defi.earn' />
          </Card.Heading>
          <Text color='gray.500' translation='defi.earnBody' />
        </Box>
      </Card.Header>
      <Card.Body pt={0} px={2}>
        <StakingTable data={allRows} onClick={handleClick} />
      </Card.Body>
    </Card>
  )
}
