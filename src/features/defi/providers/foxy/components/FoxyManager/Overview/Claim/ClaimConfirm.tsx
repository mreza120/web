import {
  Button,
  Link,
  ModalBody,
  ModalFooter,
  Skeleton,
  SkeletonText,
  Stack,
  useToast
} from '@chakra-ui/react'
import { AssetNamespace, AssetReference, CAIP19, caip19 } from '@shapeshiftoss/caip'
import { bnOrZero } from '@shapeshiftoss/chain-adapters'
import { ChainTypes, NetworkTypes } from '@shapeshiftoss/types'
import { useFoxy } from 'features/defi/contexts/FoxyProvider/FoxyProvider'
import { useEffect, useState } from 'react'
import { useTranslate } from 'react-polyglot'
import { useHistory } from 'react-router'
import { Amount } from 'components/Amount/Amount'
import { AssetIcon } from 'components/AssetIcon'
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis'
import { Row } from 'components/Row/Row'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useChainAdapters } from 'context/PluginProvider/PluginProvider'
import { useWallet } from 'context/WalletProvider/WalletProvider'
import { selectAssetByCAIP19, selectMarketDataById } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

type ClaimConfirmProps = {
  assetId: CAIP19
  amount?: string
  contractAddress: string
  chain: ChainTypes
  onBack: () => void
}

export const ClaimConfirm = ({
  assetId,
  amount,
  contractAddress,
  chain,
  onBack
}: ClaimConfirmProps) => {
  const [userAddress, setUserAddress] = useState<string>('')
  const [estimatedGas, setEstimatedGas] = useState<string>('0')
  const [loading, setLoading] = useState<boolean>(false)
  const chainAdapterManager = useChainAdapters()
  const { foxy } = useFoxy()
  const { state: walletState } = useWallet()
  const translate = useTranslate()
  const claimAmount = bnOrZero(amount).toString()
  const history = useHistory()

  // Asset Info
  const network = NetworkTypes.MAINNET
  const asset = useAppSelector(state => selectAssetByCAIP19(state, assetId))
  const feeAssetCAIP19 = caip19.toCAIP19({
    chain,
    network,
    assetNamespace: AssetNamespace.Slip44,
    assetReference: AssetReference.Ethereum
  })
  const feeAsset = useAppSelector(state => selectAssetByCAIP19(state, feeAssetCAIP19))
  const feeMarketData = useAppSelector(state => selectMarketDataById(state, feeAssetCAIP19))

  const toast = useToast()

  const handleConfirm = async () => {
    if (!walletState.wallet || !contractAddress || !userAddress || !foxy) return
    setLoading(true)
    try {
      const txid = await foxy.claimWithdraw({
        claimAddress: userAddress,
        userAddress,
        wallet: walletState.wallet,
        contractAddress
      })
      history.push('/status', {
        txid,
        assetId,
        amount,
        userAddress,
        estimatedGas,
        chain
      })
    } catch (error) {
      console.error('ClaimWithdraw:handleConfirm error', error)
      toast({
        position: 'top-right',
        description: translate('common.transactionFailedBody'),
        title: translate('common.transactionFailed'),
        status: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        if (!walletState.wallet || !contractAddress || !foxy) return
        const chainAdapter = await chainAdapterManager.byChainId('eip155:1')
        const userAddress = await chainAdapter.getAddress({ wallet: walletState.wallet })
        setUserAddress(userAddress)
        const [gasLimit, gasPrice] = await Promise.all([
          foxy.estimateClaimWithdrawGas({
            claimAddress: userAddress,
            userAddress,
            contractAddress,
            wallet: walletState.wallet
          }),
          foxy.getGasPrice()
        ])
        const gasEstimate = bnOrZero(gasPrice).times(gasLimit).toFixed(0)
        setEstimatedGas(gasEstimate)
      } catch (error) {
        // TODO: handle client side errors
        console.error('FoxyClaim error:', error)
      }
    })()
  }, [
    chainAdapterManager,
    contractAddress,
    feeAsset.precision,
    feeMarketData.price,
    foxy,
    walletState.wallet
  ])

  return (
    <SlideTransition>
      <ModalBody>
        <Stack alignItems='center' justifyContent='center' py={8}>
          <Text color='gray.500' translation='defi.modals.claim.claimAmount' />
          <Stack direction='row' alignItems='center' justifyContent='center'>
            <AssetIcon boxSize='10' src={asset.icon} />
            <Amount.Crypto
              fontSize='3xl'
              fontWeight='medium'
              value={bnOrZero(claimAmount).div(`1e+${asset.precision}`).toString()}
              symbol={asset?.symbol}
            />
          </Stack>
        </Stack>
      </ModalBody>
      <ModalFooter flexDir='column'>
        <Stack width='full' spacing={6}>
          <Row>
            <Row.Label>
              <Text translation='defi.modals.claim.claimToAddress' />
            </Row.Label>
            <Row.Value>
              <Skeleton minWidth='100px' isLoaded={!!userAddress}>
                <Link
                  isExternal
                  color='blue.500'
                  // TODO:(ryankk) create explorer links given a link template and a value
                  href={`${asset?.explorerAddressLink}${userAddress}`}
                >
                  <MiddleEllipsis address={userAddress} />
                </Link>
              </Skeleton>
            </Row.Value>
          </Row>
          <Row>
            <Row.Label>
              <Text translation='common.estimatedGas' />
            </Row.Label>
            <Row.Value>
              <SkeletonText
                noOfLines={2}
                isLoaded={!!bnOrZero(estimatedGas).gt(0)}
                fontSize='md'
                display='flex'
                flexDir='column'
                alignItems='flex-end'
              >
                <Stack textAlign='right' spacing={0}>
                  <Amount.Fiat
                    value={bnOrZero(estimatedGas)
                      .div(`1e+${feeAsset.precision}`)
                      .times(feeMarketData.price)
                      .toFixed(2)}
                  />
                  <Amount.Crypto
                    color='gray.500'
                    value={bnOrZero(estimatedGas).div(`1e+${feeAsset.precision}`).toFixed(5)}
                    symbol={feeAsset.symbol}
                  />
                </Stack>
              </SkeletonText>
            </Row.Value>
          </Row>
          <Stack direction='row' width='full' justifyContent='space-between'>
            <Button size='lg' onClick={onBack}>
              {translate('common.cancel')}
            </Button>
            <Button size='lg' colorScheme='blue' onClick={handleConfirm} isLoading={loading}>
              {translate('defi.modals.claim.confirmClaim')}
            </Button>
          </Stack>
        </Stack>
      </ModalFooter>
    </SlideTransition>
  )
}
