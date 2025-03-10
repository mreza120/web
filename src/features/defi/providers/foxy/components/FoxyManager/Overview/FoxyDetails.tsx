import { Center, Flex, ModalBody, ModalFooter, Stack, Tag } from '@chakra-ui/react'
import { AssetNamespace, caip19 } from '@shapeshiftoss/caip'
import { FoxyApi } from '@shapeshiftoss/investor-foxy'
import { NetworkTypes } from '@shapeshiftoss/types'
import { DefiParams, DefiQueryParams } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { matchPath } from 'react-router'
import { Amount } from 'components/Amount/Amount'
import { AssetIcon } from 'components/AssetIcon'
import { CircularProgress } from 'components/CircularProgress/CircularProgress'
import { Text } from 'components/Text'
import { useBrowserRouter } from 'context/BrowserRouterProvider/BrowserRouterProvider'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { useFoxyBalances } from 'pages/Defi/hooks/useFoxyBalances'
import { selectAssetByCAIP19 } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { FoxyEmpty } from './FoxyEmpty'
import { WithdrawCard } from './WithdrawCard'

type FoxyDetailsProps = {
  api: FoxyApi
}

export const FoxyDetails = ({ api }: FoxyDetailsProps) => {
  const { opportunities, loading } = useFoxyBalances()
  const {
    query,
    history: browserHistory,
    location: browserLocation
  } = useBrowserRouter<DefiQueryParams, DefiParams>()
  const match = matchPath<DefiParams>(browserLocation.pathname, {
    path: '/defi/:earnType/:provider/:action',
    exact: true
  })
  const { chain, contractAddress, tokenId, rewardId } = query
  const opportunity = opportunities.find(e => e.contractAddress === contractAddress)
  const foxyBalance = bnOrZero(opportunity?.balance)
  const network = NetworkTypes.MAINNET
  const assetNamespace = AssetNamespace.ERC20
  const stakingAssetCAIP19 = caip19.toCAIP19({
    chain,
    network,
    assetNamespace,
    assetReference: tokenId
  })
  const stakingAsset = useAppSelector(state => selectAssetByCAIP19(state, stakingAssetCAIP19))
  const rewardAssetCAIP19 = caip19.toCAIP19({
    chain,
    network,
    assetNamespace,
    assetReference: rewardId
  })
  const rewardAsset = useAppSelector(state => selectAssetByCAIP19(state, rewardAssetCAIP19))
  const apy = bnOrZero(opportunity?.apy).times(100).toString()
  if (loading || !opportunity) {
    return (
      <Center minW='350px' minH='350px'>
        <CircularProgress isIndeterminate />
      </Center>
    )
  }
  if (foxyBalance.eq(0)) {
    return (
      <FoxyEmpty
        assets={[stakingAsset, rewardAsset]}
        apy={bnOrZero(opportunity?.apy).times(100).toString()}
        onClick={() =>
          browserHistory.push({
            ...browserLocation,
            pathname: `/defi/${match?.params.earnType}/${match?.params.provider}/deposit/`
          })
        }
      />
    )
  }
  return (
    <Flex
      width='full'
      minWidth={{ base: '100%', xl: '500px' }}
      maxWidth='fit-content'
      flexDir='column'
    >
      <ModalBody>
        <Stack alignItems='center' justifyContent='center' py={8}>
          <Text color='gray.500' translation='defi.modals.foxyOverview.foxyBalance' />
          <Stack direction='row' alignItems='center' justifyContent='center'>
            <AssetIcon boxSize='10' src={rewardAsset.icon} />
            <Amount.Crypto
              fontSize='3xl'
              fontWeight='medium'
              value={opportunity?.cryptoAmount}
              symbol={rewardAsset?.symbol}
            />
          </Stack>
          <Tag colorScheme='green'>{apy}% APR</Tag>
        </Stack>
      </ModalBody>
      <ModalFooter justifyContent='flex-start' alignItems='flex-start' flexDir='column'>
        <Stack width='full'>
          <Text fontWeight='medium' translation='defi.modals.foxyOverview.withdrawals' />
          <WithdrawCard asset={stakingAsset} {...opportunity.withdrawInfo} />
        </Stack>
      </ModalFooter>
    </Flex>
  )
}
