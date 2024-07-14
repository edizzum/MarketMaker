import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const optsepContract: OmniPointHardhat = {
    eid: EndpointId.OPTSEP_V2_TESTNET,
    contractName: 'MyOFT',
}

const arbsepContract: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'MyOFT',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: arbsepContract, // buraya 
        },
        {
            contract: optsepContract, // buradan
        },
    ],
    connections: [
        { // Sets the config on Arbitrum Sepolia
            from: arbsepContract,
            to: optsepContract,
            config: {},
        },
        { // Sets the config on  Sepolia
            from: optsepContract,
            to: arbsepContract,
            config: {},
        },
    ],
}

export default config
