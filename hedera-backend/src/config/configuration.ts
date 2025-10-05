export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/hedera-mvp',
  },
  detection: {
    apiUrl: process.env.DETECTION_API_URL || 'http://localhost:8000',
  },
  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    operatorId: process.env.HEDERA_OPERATOR_ID,
    operatorPrivateKey: process.env.HEDERA_OPERATOR_PRIVATE_KEY,
    hcsTopicId: process.env.HCS_TOPIC_ID,
  },
  sheba: {
    tokenTicker: process.env.SHEBA_TOKEN_TICKER || 'SHEBA',
    tokenName: process.env.SHEBA_TOKEN_NAME || 'Sheba',
    rewardAmount: parseInt(process.env.SHEBA_REWARD_AMOUNT || '1', 10),
  },
});
