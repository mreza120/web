import { Box, Collapse, Flex, Link, SimpleGrid } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { FaStickyNote } from 'react-icons/fa'
import { Amount } from 'components/Amount/Amount'
import { IconCircle } from 'components/IconCircle'
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis'
import { Row } from 'components/Row/Row'
import { RawText, Text } from 'components/Text'
import { TransactionStatus } from 'components/Transactions/TransactionStatus'
import { TxDetails } from 'hooks/useTxDetails/useTxDetails'
import { fromBaseUnit } from 'lib/math'

export const TransactionGeneric = ({ txDetails }: { txDetails: TxDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleOpen = () => setIsOpen(!isOpen)

  const toAddress = txDetails.ensTo || txDetails.to
  const fromAddress = txDetails.ensFrom || txDetails.from

  return (
    <>
      <Flex
        alignItems='center'
        flex={1}
        justifyContent='space-between'
        textAlign='left'
        as='button'
        w='full'
        py={4}
        onClick={toggleOpen}
      >
        <Flex alignItems='center' width='full'>
          <IconCircle mr={3}>
            <FaStickyNote />
          </IconCircle>

          <Flex justifyContent='flex-start' flex={1} alignItems='center'>
            <Box flex={1}>
              <Text
                fontWeight='bold'
                overflow='hidden'
                flex={1}
                textOverflow='ellipsis'
                maxWidth='60%'
                lineHeight='1'
                whiteSpace='nowrap'
                mb={2}
                translation={['transactionRow.unknown', { symbol: '' }]}
              />
              <RawText color='gray.500' fontSize='sm' lineHeight='1'>
                {dayjs(txDetails.tx.blockTime * 1000).fromNow()}
              </RawText>
            </Box>

            <Flex flexDir='column' ml='auto' textAlign='right'>
              {txDetails.value && txDetails.precision && (
                <Amount.Crypto
                  color='inherit'
                  value={fromBaseUnit(txDetails.value, txDetails.precision)}
                  symbol={txDetails.symbol}
                  maximumFractionDigits={6}
                  prefix=''
                />
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Collapse in={isOpen} unmountOnExit>
        <SimpleGrid gridTemplateColumns='repeat(auto-fit, minmax(180px, 1fr))' spacing='4' py={6}>
          {txDetails.tx.blockTime && (
            <Row variant='vertical' hidden={!txDetails.tx.blockTime}>
              <Row.Label>
                <Text translation='transactionRow.date' />
              </Row.Label>
              <Row.Value>{dayjs(Number(txDetails.tx.blockTime) * 1000).format('LLL')}</Row.Value>
            </Row>
          )}
          <Row variant='vertical' hidden={!(txDetails.explorerTxLink && txDetails.tx.txid)}>
            <Row.Label>
              <Text translation='transactionRow.txid' />
            </Row.Label>
            <Row.Value>
              <Link
                isExternal
                color='blue.500'
                href={`${txDetails.explorerTxLink}${txDetails.tx.txid}`}
              >
                <MiddleEllipsis address={txDetails.tx.txid} />
              </Link>
            </Row.Value>
          </Row>

          <Row variant='vertical' hidden={!txDetails.tradeTx}>
            <Row.Label>
              <Text translation={'transactionRow.amount'} />
            </Row.Label>
            <Row.Value>
              <Amount.Crypto
                value={fromBaseUnit(
                  txDetails.sellTransfer?.value ?? '0',
                  txDetails.sellAsset?.precision ?? 18
                )}
                symbol={txDetails.sellAsset?.symbol ?? ''}
                maximumFractionDigits={6}
              />
              <Text translation='transactionRow.for' />
              <Amount.Crypto
                value={fromBaseUnit(
                  txDetails.buyTransfer?.value ?? '0',
                  txDetails.buyAsset?.precision ?? 18
                )}
                symbol={txDetails.buyAsset?.symbol ?? ''}
                maximumFractionDigits={6}
              />
            </Row.Value>
          </Row>

          {txDetails.tx?.fee && txDetails.feeAsset && (
            <Row variant='vertical'>
              <Row.Label>
                <Text translation='transactionRow.fee' />
              </Row.Label>
              <Row.Value>
                <Amount.Crypto
                  value={fromBaseUnit(
                    txDetails.tx?.fee?.value ?? '0',
                    txDetails.feeAsset?.precision ?? 18
                  )}
                  symbol={txDetails.feeAsset.symbol}
                  maximumFractionDigits={6}
                />
              </Row.Value>
            </Row>
          )}
          <TransactionStatus txStatus={txDetails.tx.status} />
          {toAddress && (
            <Row variant='vertical'>
              <Row.Label>
                <Text translation={'transactionRow.to'} />
              </Row.Label>
              <Row.Value>
                <Link
                  isExternal
                  color='blue.500'
                  href={`${txDetails.explorerAddressLink}${toAddress}`}
                >
                  <MiddleEllipsis address={toAddress} />
                </Link>
              </Row.Value>
            </Row>
          )}
          {fromAddress && (
            <Row variant='vertical'>
              <Row.Label>
                <Text translation={'transactionRow.from'} />
              </Row.Label>
              <Row.Value>
                <Link
                  isExternal
                  color='blue.500'
                  href={`${txDetails.explorerAddressLink}${fromAddress}`}
                >
                  <MiddleEllipsis address={fromAddress} />
                </Link>
              </Row.Value>
            </Row>
          )}
        </SimpleGrid>
      </Collapse>
    </>
  )
}
