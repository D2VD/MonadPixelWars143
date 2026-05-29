import type { Address } from 'viem';
import { monadPixelWarsAbi } from '@/contracts/abi';

export { monadPixelWarsAbi };

const configuredAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const configuredDeploymentBlock = process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK;

export const CONTRACT_ADDRESS = configuredAddress?.startsWith('0x')
  ? (configuredAddress as Address)
  : undefined;

export const DEPLOYMENT_BLOCK = configuredDeploymentBlock ? BigInt(configuredDeploymentBlock) : 0n;

export const hasContractConfig = Boolean(CONTRACT_ADDRESS);
