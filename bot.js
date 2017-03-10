var botkit = require('botkit');
var fs = require('fs');
var spawn = require( 'child_process').spawn;

var allowedUsers = process.env.ALLOWED_USERS.split(' ').filter(String);
var allowedBots = process.env.ALLOWED_BOTS.split(' ').filter(String);

if (!process.env.TOKEN) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

var controller = botkit.slackbot({
  debug: process.env.DEBUG === 'true',
  stats_optout: true,
  retry: Infinity
});

controller.spawn({
  token: process.env.TOKEN
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

controller.hears([':flag-([a-z]{2}):'], ['ambient', 'direct_message', 'direct_mention', 'mention', 'bot_message'], function(bot, message) {
  var matchedCode = message.match[1];
  var anthemPath = `media/${matchedCode.toLowerCase()}.mid`;

  if (validatesAllowed(message)) {
    fs.open(anthemPath, 'r', (err, fd) => {
      if (err) {
        if (err.code === 'ENOENT') {
          bot.reply(message, "Oh noes, I can't sing this one :(");
          return;
        } else {
          throw err;
        }
      }

      // TODO make a way to sush the player from the bot
      // Probably something like timidity.kill('SIGINT');
      // but the process would need to be available outside of the callback
      var timidity = spawn('timidity', [anthemPath]);
      bot.reply(message, "Let's sing!");
    });
  } else {
    bot.reply(message, 'ಠ_ಠ');
  }
});

function validatesAllowed(message) {
  var hasUserFilter = allowedUsers.length;
  var hasBotFilter = allowedBots.length;
  var userAllowed = !hasUserFilter || allowedUsers.includes(message.user);
  var botAllowed = !hasBotFilter || allowedBots.includes(message.bot_id);

  return userAllowed || botAllowed;
}
