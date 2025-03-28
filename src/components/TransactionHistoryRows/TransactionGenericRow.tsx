import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, SimpleGrid, Stack } from '@chakra-ui/react'
import { chainAdapters } from '@shapeshiftoss/types'
import { FaArrowRight, FaExchangeAlt, FaStickyNote, FaThumbsUp } from 'react-icons/fa'
import { Amount } from 'components/Amount/Amount'
import { AssetIcon } from 'components/AssetIcon'
import { IconCircle } from 'components/IconCircle'
import { Text } from 'components/Text'
import { TransactionLink } from 'components/TransactionHistoryRows/TransactionLink'
import { TransactionTime } from 'components/TransactionHistoryRows/TransactionTime'
import { Direction } from 'hooks/useTxDetails/useTxDetails'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { fromBaseUnit } from 'lib/math'
import { TxId } from 'state/slices/txHistorySlice/txHistorySlice'
import { breakpoints } from 'theme/theme'

const TransactionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case chainAdapters.TxType.Send:
    case Direction.Outbound:
      return <ArrowUpIcon />
    case chainAdapters.TxType.Receive:
    case Direction.Inbound:
      return <ArrowDownIcon color='green.500' />
    case chainAdapters.TradeType.Trade:
      return <FaExchangeAlt />
    case Direction.InPlace:
      return <FaThumbsUp />
    default:
      return <FaStickyNote />
  }
}

type TransactionRowAsset = {
  symbol: string
  amount: string
  precision: number
  currentPrice?: string
}

type TransactionGenericRowProps = {
  type: string
  symbol: string
  title?: string
  showDateAndGuide?: boolean
  compactMode?: boolean
  assets: TransactionRowAsset[]
  fee?: TransactionRowAsset
  txid: TxId
  blockTime: number
  explorerTxLink: string
  toggleOpen: Function
  isFirstAssetOutgoing?: boolean
  parentWidth: number
}

export const TransactionGenericRow = ({
  type,
  title,
  showDateAndGuide,
  assets,
  fee,
  txid,
  blockTime,
  explorerTxLink,
  compactMode = false,
  toggleOpen,
  isFirstAssetOutgoing = false,
  parentWidth
}: TransactionGenericRowProps) => {
  const isLargerThanSm = parentWidth > parseInt(breakpoints['sm'], 10)
  const isLargerThanMd = parentWidth > parseInt(breakpoints['md'], 10)
  const isLargerThanLg = parentWidth > parseInt(breakpoints['lg'], 10)

  let columns = '1fr'
  let dateFormat = 'MM/DD/YYYY hh:mm A'

  if (isLargerThanSm) {
    columns = '1fr 2fr'
    dateFormat = 'hh:mm A'
  }
  if (isLargerThanMd) {
    columns = '1fr 2fr'
  }
  if (isLargerThanLg) {
    columns = '1fr 2fr 1fr 1fr'
  }
  return (
    <Button
      height='auto'
      fontWeight='inherit'
      variant='unstyled'
      w='full'
      p={4}
      onClick={() => toggleOpen()}
    >
      <SimpleGrid
        gridTemplateColumns={{ base: '1fr', md: columns }}
        textAlign='left'
        justifyContent='flex-start'
        alignItems='center'
      >
        <Flex alignItems='flex-start' flex={1} flexDir='column' width='full'>
          <Flex alignItems='center' width='full'>
            <IconCircle mr={2} boxSize={{ base: '24px', md: compactMode ? '24px' : '40px' }}>
              <TransactionIcon type={type} />
            </IconCircle>
            <Stack
              direction={{ base: 'row', md: compactMode ? 'row' : 'column' }}
              flex={1}
              spacing={0}
              fontSize={{ base: 'sm', md: compactMode ? 'sm' : 'md' }}
              alignItems={{ base: 'center', md: compactMode ? 'center' : 'flex-start' }}
            >
              <Text
                fontWeight='bold'
                flex={1}
                translation={
                  title ? title : [`transactionRow.${type.toLowerCase()}`, { symbol: '' }]
                }
              />
              <TransactionTime blockTime={blockTime} format={dateFormat} />
            </Stack>
          </Flex>
        </Flex>
        <Flex flex={2} flexDir='column' width='full'>
          <Stack
            direction='row'
            width='full'
            alignItems='center'
            spacing={{ base: 0, md: compactMode ? 0 : 4 }}
            justifyContent={{
              base: 'space-between',
              md: compactMode ? 'space-between' : 'flex-start'
            }}
            fontSize={{ base: 'sm', md: compactMode ? 'sm' : 'md' }}
            divider={
              <Box border={0} color='gray.500' fontSize='sm'>
                <FaArrowRight />
              </Box>
            }
          >
            {assets.map((asset, index) => (
              <Stack
                alignItems='center'
                key={index}
                mt={{ base: 2, md: compactMode ? 2 : 0 }}
                direction={{
                  base: index === 0 ? 'row' : 'row-reverse',
                  md: compactMode ? (index === 0 ? 'row' : 'row-reverse') : 'row'
                }}
                textAlign={{
                  base: index === 0 ? 'left' : 'right',
                  md: compactMode ? (index === 0 ? 'left' : 'right') : 'left'
                }}
              >
                <AssetIcon
                  symbol={asset.symbol.toLowerCase()}
                  boxSize={{ base: '24px', md: compactMode ? '24px' : '40px' }}
                />
                <Box flex={1}>
                  <Amount.Crypto
                    color='inherit'
                    fontWeight='medium'
                    prefix={index === 0 && isFirstAssetOutgoing ? '-' : ''}
                    value={fromBaseUnit(asset.amount ?? '0', asset.precision)}
                    symbol={asset.symbol}
                    maximumFractionDigits={4}
                  />
                  {asset.currentPrice && (
                    <Amount.Fiat
                      color='gray.500'
                      fontSize='sm'
                      lineHeight='1'
                      prefix={index === 0 && isFirstAssetOutgoing ? '-' : ''}
                      value={bnOrZero(fromBaseUnit(asset.amount ?? '0', asset.precision))
                        .times(asset.currentPrice)
                        .toString()}
                    />
                  )}
                </Box>
              </Stack>
            ))}
          </Stack>
        </Flex>
        {isLargerThanLg && (
          <Flex alignItems='flex-start' flex={1} flexDir='column'>
            {fee && (
              <Flex alignItems='center' width='full'>
                <Box flex={1}>
                  <Amount.Crypto
                    color='inherit'
                    fontWeight='bold'
                    value={fromBaseUnit(fee.amount, fee.precision)}
                    symbol={fee.symbol}
                    maximumFractionDigits={6}
                  />
                  <Amount.Fiat
                    color='gray.500'
                    fontSize='sm'
                    lineHeight='1'
                    value={
                      fee.amount
                        ? bnOrZero(fromBaseUnit(fee.amount, fee.precision))
                            .times(fee.currentPrice ?? 0)
                            .toString()
                        : '0'
                    }
                  />
                </Box>
              </Flex>
            )}
          </Flex>
        )}
        {isLargerThanLg && (
          <Flex flex={0} flexDir='column'>
            <Flex justifyContent='flex-end' alignItems='center'>
              <TransactionLink txid={txid} explorerTxLink={explorerTxLink} />
            </Flex>
          </Flex>
        )}
      </SimpleGrid>
    </Button>
  )
}
