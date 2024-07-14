import { EndpointId } from "@layerzerolabs/lz-definitions";
const arbsepContract = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: "MyOFT"
};
const optsepContract = {
    eid: EndpointId.OPTSEP_V2_TESTNET,
    contractName: "MyOFT"
};
export default { contracts: [{ contract: arbsepContract }, { contract: optsepContract }], connections: [{ from: arbsepContract, to: optsepContract, config: { sendLibrary: "0x4f7cd4DA19ABB31b0eC98b9066B9e857B1bf9C0E", receiveLibraryConfig: { receiveLibrary: "0x75Db67CDab2824970131D5aa9CECfC9F69c69636", gracePeriod: 0 }, sendConfig: { executorConfig: { maxMessageSize: 10000, executor: "0x5Df3a1cEbBD9c8BA7F8dF51Fd632A9aef8308897" }, ulnConfig: { confirmations: 1, requiredDVNs: ["0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8"], optionalDVNs: [], optionalDVNThreshold: 0 } }, receiveConfig: { ulnConfig: { confirmations: 1, requiredDVNs: ["0x53f488E93b4f1b60E8E83aa374dBe1780A1EE8a8"], optionalDVNs: [], optionalDVNThreshold: 0 } } } }, { from: optsepContract, to: arbsepContract, config: { sendLibrary: "0xB31D2cb502E25B30C651842C7C3293c51Fe6d16f", receiveLibraryConfig: { receiveLibrary: "0x9284fd59B95b9143AF0b9795CAC16eb3C723C9Ca", gracePeriod: 0 }, sendConfig: { executorConfig: { maxMessageSize: 10000, executor: "0xDc0D68899405673b932F0DB7f8A49191491A5bcB" }, ulnConfig: { confirmations: 1, requiredDVNs: ["0xd680ec569f269aa7015F7979b4f1239b5aa4582C"], optionalDVNs: [], optionalDVNThreshold: 0 } }, receiveConfig: { ulnConfig: { confirmations: 1, requiredDVNs: ["0xd680ec569f269aa7015F7979b4f1239b5aa4582C"], optionalDVNs: [], optionalDVNThreshold: 0 } } } }] };
