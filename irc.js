var irc = require('irc'),
    client,
    api,
    messageCallback;
    
exports.getApi = function() {
    return api;
};

exports.start = function (callback) {
    messageCallback = callback;

    if (!exports.config.server) {
        throw new Error("'server' must be set in config!");
    }

    if (!exports.config.nick) {
        throw new Error("'nick' must be set in config")
    }

    client = new irc.Client(exports.config.server,
                            exports.config.nick,
                            exports.config || [] // This lets you simply set any custom irc node.js module's options by putting them into config, you can start with "channels", look at https://github.com/martynsmith/node-irc/blob/master/lib/irc.js for more
                            );

    client.addListener('message', function (from, to, message) {
        let event = shim.createEvent(to, from, from, message);
        messageCallback(api, event);
    });

    // Dump errors to the console
    client.addListener('error', function(message) {
        console.log('error: ', message);
    });

    class IRCIntegration extends shim {
        sendMessage(message, thread) {
            client.say(thread, message);
        }

        getUsers(thread) {
            let obj = {};
            if (thread == exports.config.threadId) {
                obj[exports.config.senderId] = {
                    name: exports.config.senderName
                }
            }
            return obj;
        }
    }

    api = new IRCIntegration(exports.config.commandPrefix);
};

exports.stop = function () {
    client.stop();
};
