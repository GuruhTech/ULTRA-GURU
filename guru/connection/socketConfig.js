var _0xb11580=(function(_0x28c6f3,_0xa049e7){return !![]}());var _0x37ad0b=function(){return ![]};
const _0xe3417a = require('pino');
const _0xb8c6d0 = require('node-cache');
const { makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { cachedGroupMetadata } = require('./groupCache');
const _0x044663 = new _0xb8c6d0({ stdTTL: 0x708, useClones: false });
const _0x2ead40 = (version, state, logger) => {
    return {
        version,
        logger: _0xe3417a({ level: '\x73\x69\x6c\x65\x6e\x74' }),
        browser: ['\x55\x62\x75\x6e\x74\x75', '\x43\x68\x72\x6f\x6d\x65', '\x32\x32\x2e\x30\x34\x2e\x34'],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        cachedGroupMetadata,
        userDevicesCache: _0x044663,
        connectTimeoutMs: 0x3A98,
        defaultQueryTimeoutMs: 0x4E20,
        keepAliveIntervalMs: 0x4E20,
        fireInitQueries: false,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        retryRequestDelayMs: 0x32,
        maxMsgRetryCount: 2,
        generateHighQualityLinkPreview: false,
        getMessage: async () => undefined,
        emitOwnEvents: true,
        patchMessageBeforeSending: (message) => {
            const _0x4e4ad5 = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (_0x4e4ad5) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        }
    };
};
module.exports = { _0x2ead40 };
