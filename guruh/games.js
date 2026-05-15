
const { gmd } = require("../guru");
const {
    createGame,
    joinGame,
    getActiveGame,
    getWaitingGame,
    makeMove,
    endGame,
    initGamesDB,
} = require("../guru/database/games");

const {
    createWcgGame,
    joinWcgGame,
    startWcgGame,
    getActiveWcgGame,
    getWaitingWcgGame,
    submitWord,
    eliminatePlayer,
    endWcgGame,
    initWcgDB,
} = require("../guru/database/wcgGame");

const {
    createDiceGame,
    joinDiceGame,
    getActiveDiceGame,
    getWaitingDiceGame,
    playerRoll,
    endDiceGame,
    initDiceDB,
} = require("../guru/database/diceGame");

const { 
    clearGameTimeout, 
    setMoveTimeout, 
    setWcgTurnTimeout,
    setDiceTurnTimeout,
    clearDiceTimeout,
    renderBoard, 
    getPlayerName,
    handleAiTttMove,
    handleAiWcgMove,
    handleAiDiceRoll,
    gameTimeouts,
    diceTimeouts,
} = require("../guru/gameHandler");

const {
    wcgTimeouts,
    clearWcgTimeout,
    clearWcgJoinTimeout,
    setWcgJoinTimeout,
    formatScores,
    getDiceEmoji,
} = require("../guru/wcg");


const {
    findWcgWord,
    rollDice: aiRollDice,
    findBestTttMove,
    BOT_JID,
} = require("../guru/gameAI");

initGamesDB();
initWcgDB();
initDiceDB();

gmd({
    pattern: "games",
    aliases: ["game", "playgame", "playgames", "gamelist"],
    react: "🎮",
    category: "game",
    description: "Show all available games and commands",
}, async (from, Gifted, conText) => {
    const helpText = `🎮 *GAMES MENU*

╭━━━━━━━━━━━━━━━━━╮
│ ❌⭕ *TIC TAC TOE*
├━━━━━━━━━━━━━━━━━┤
│ .ttt - Start game (vs player)
│ .tttai - Play vs AI 🤖
│ .tttend - End current game
│ _Type *join* to join a game_
│ _Type *1-9* to make a move_
╰━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━╮
│ 🔤 *WORD CHAIN GAME*
├━━━━━━━━━━━━━━━━━┤
│ .wcg - Start game (multiplayer)
│ .wcgai - Play vs AI 🤖
│ .wcgbegin - Start the game (host)
│ .wcgend - End current game
│ .wcgscores - View scores
│ _Type *join* to join a game_
│ _Just type your word!_
╰━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━╮
│ 🎲 *DICE GAME*
├━━━━━━━━━━━━━━━━━┤
│ .dice [rounds] - Start game
│ .diceai [rounds] - Play vs AI 🤖
│ .diceend - End current game
│ _Type *join* to join a game_
│ _Type *roll* to roll the dice_
╰━━━━━━━━━━━━━━━━━╯

_🤖 AI modes let you play solo against the bot!_
_No command prefix needed during gameplay!_`;
    
    return await Gifted.sendMessage(from, {
        text: helpText,
    });
});

const setJoinTimeout = (chatJid, Gifted, player1) => {
    clearGameTimeout(chatJid);
    const timeout = setTimeout(async () => {
        const waiting = await getWaitingGame(chatJid);
        if (waiting) {
            await endGame(chatJid);
            await Gifted.sendMessage(chatJid, {
                text: `⏰ *TIC TAC TOE - TIMEOUT*\n\nNo one joined within 30 seconds.\nGame cancelled!\n\n@${getPlayerName(player1)} can start a new game with *.ttt*`,
    
                mentions: [player1],
            });
        }
        gameTimeouts.delete(chatJid);
    }, 30000);
    gameTimeouts.set(chatJid, timeout);
};

gmd({
    pattern: "tictactoe",
    aliases: ["ttt", "tttstart"],
    react: "🎮",
    category: "game",
    description: "Start a TicTacToe game. Another player must type 'join' within 30 seconds.",
}, async (from, Gifted, conText) => {
    const { mek, sender, botName } = conText;
    
    const existingActive = await getActiveGame(from);
    if (existingActive) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already an active game in this chat!\nUse *.tttend* to end it first.",

        });
    }
    
    const existingWaiting = await getWaitingGame(from);
    if (existingWaiting) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already a game waiting for a player!\nType *join* to join, or use *.tttend* to cancel.",

        });
    }
    
    const sentMsg = await Gifted.sendMessage(from, {
        text: `🎮 *TIC TAC TOE*\n\n@${getPlayerName(sender)} wants to play!\n\n*Type "join" within 30 seconds to play!*\n\nPlayer 1: @${getPlayerName(sender)} (❌)\nPlayer 2: Waiting...\n\n${renderBoard([1, 2, 3, 4, 5, 6, 7, 8, 9])}\n\n⏰ _Auto-cancels in 30 seconds if no one joins_`,
        mentions: [sender],
    });
    
    await createGame(from, sender, sentMsg.key);
    setJoinTimeout(from, Gifted, sender);
});

gmd({
    pattern: "tttend",
    aliases: ["endttt", "tttcancel", "ttstop", "tictactoestop", "tictactoeend", "stopttt", "cancelttt"],
    react: "🛑",
    category: "game",
    description: "End the current TicTacToe game",
}, async (from, Gifted, conText) => {
    const { sender, isSuperUser } = conText;
    
    const activeGame = await getActiveGame(from);
    const waitingGame = await getWaitingGame(from);
    const game = activeGame || waitingGame;
    
    if (!game) {
        return await Gifted.sendMessage(from, {
            text: "❌ No active TicTacToe game to end!",
        });
    }
    
    const isPlayer = game.player1 === sender || game.player2 === sender;
    if (!isPlayer && !isSuperUser) {
        return await Gifted.sendMessage(from, {
            text: "❌ Only players or admins can end the game!",
        });
    }
    
    clearGameTimeout(from);
    await endGame(from);
    await Gifted.sendMessage(from, {
        text: `🛑 TicTacToe game ended by @${getPlayerName(sender)}!`,
        mentions: [sender],
    });
});

gmd({
    pattern: "tttjoin",
    aliases: ["jointtt"],
    react: "✅",
    category: "game",
    description: "Join a waiting TicTacToe game",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    const result = await joinGame(from, sender);
    
    if (!result) {
        return await Gifted.sendMessage(from, {
            text: "❌ No game waiting for players! Start one with *.ttt*",

        });
    }
    
    if (result.error === "same_player") {
        return await Gifted.sendMessage(from, {
            text: "❌ You can't play against yourself!",

        });
    }
    
    clearGameTimeout(from);
    
    const board = JSON.parse(result.board);
    await Gifted.sendMessage(from, {
        text: `🎮 *TIC TAC TOE - GAME STARTED!*\n\nPlayer 1: @${getPlayerName(result.player1)} (❌)\nPlayer 2: @${getPlayerName(result.player2)} (⭕)\n\n${renderBoard(board)}\n\n@${getPlayerName(result.currentTurn)}'s turn (❌)\n\n*Reply with a number (1-9) to move!*\n⏰ _30 seconds per move_`,
        mentions: [result.player1, result.player2, result.currentTurn],
    });
    
    setMoveTimeout(from, Gifted, result.currentTurn, result.player2, result.player1);
});

gmd({
    pattern: "tttboard",
    aliases: ["board", "tttshow"],
    react: "📋",
    category: "game",
    description: "Show the current TicTacToe board",
}, async (from, Gifted, conText) => {
    const game = await getActiveGame(from);
    
    if (!game) {
        return await Gifted.sendMessage(from, {
            text: "❌ No active game! Start one with *.ttt*",

        });
    }
    
    const board = JSON.parse(game.board);
    const currentSymbol = game.currentTurn === game.player1 ? "❌" : "⭕";
    
    await Gifted.sendMessage(from, {
        text: `🎮 *TIC TAC TOE*\n\nPlayer 1: @${getPlayerName(game.player1)} (❌)\nPlayer 2: @${getPlayerName(game.player2)} (⭕)\n\n${renderBoard(board)}\n\n@${getPlayerName(game.currentTurn)}'s turn (${currentSymbol})`,
        mentions: [game.player1, game.player2, game.currentTurn],
    });
});

gmd({
    pattern: "wcg",
    aliases: ["wordchain", "wcgstart", "wordgame"],
    react: "🔤",
    category: "game",
    description: "Start a Word Chain Game",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    const existingActive = await getActiveWcgGame(from);
    if (existingActive) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already an active Word Chain game!\nUse *.wcgend* to end it first.",

        });
    }
    
    const existingWaiting = await getWaitingWcgGame(from);
    if (existingWaiting) {
        return await Gifted.sendMessage(from, {
            text: "❌ A game is waiting for players!\nUse *.wcgjoin* to join or *.wcgend* to cancel.",

        });
    }
    
    await createWcgGame(from, sender);
    
    await Gifted.sendMessage(from, {
        text: `🔤 *WORD CHAIN GAME*\n\n@${getPlayerName(sender)} wants to play!\n\n📜 *Rules:*\n• Each word must start with the last letter of the previous word\n• No repeating words\n• Minimum 2 letters per word\n• 30 seconds per turn\n\n👥 *Players:*\n1. @${getPlayerName(sender)}\n\n⏰ *30 seconds to join!*\n*Type .wcgjoin to join!*\n*Host types .wcgbegin to start early*`,
        mentions: [sender],
    });
    
    setWcgJoinTimeout(from, async () => {
        const waitingGame = await getWaitingWcgGame(from);
        if (!waitingGame) return;
        
        const players = JSON.parse(waitingGame.players);
        if (players.length < 2) {
            await endWcgGame(from);
            await Gifted.sendMessage(from, {
                text: "⏰ *Time's up!*\n\nNo one joined the game. Game cancelled.",
            });
            return;
        }
        
        const result = await startWcgGame(from);
        if (result.error) return;
        
        const playerList = result.players.map((p, i) => `${i + 1}. @${getPlayerName(p)}`).join('\n');
        
        await Gifted.sendMessage(from, {
            text: `⏰ *Time's up! Game starting!*\n\n🚀 *WORD CHAIN STARTED!*\n\n👥 *Players:*\n${playerList}\n\n🔄 @${getPlayerName(result.currentTurn)}'s turn!\n*Say any word to begin!*\n\n⏰ _30 seconds per turn_`,
            mentions: [...result.players, result.currentTurn],
        });
        
        setWcgTurnTimeout(from, Gifted, result.currentTurn, result.game);
    });
});

gmd({
    pattern: "wcgjoin",
    aliases: ["joinwcg", "joinwordchain"],
    react: "✅",
    category: "game",
    description: "Join a Word Chain Game",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    const result = await joinWcgGame(from, sender);
    
    if (result.error === 'no_game') {
        return await Gifted.sendMessage(from, {
            text: "❌ No game waiting! Start one with *.wcg*",
        });
    }
    
    if (result.error === 'cant_join_own_game') {
        return await Gifted.sendMessage(from, {
            text: "❌ You can't play against yourself! Wait for someone else to join.",
        });
    }
    
    if (result.error === 'already_joined') {
        return await Gifted.sendMessage(from, {
            text: "❌ You've already joined this game!",
        });
    }
    
    const playerList = result.players.map((p, i) => `${i + 1}. @${getPlayerName(p)}`).join('\n');
    const mentions = result.players;
    
    await Gifted.sendMessage(from, {
        text: `✅ @${getPlayerName(sender)} joined!\n\n👥 *Players (${result.players.length}):*\n${playerList}\n\n*More can join with .wcgjoin*\n*Host types .wcgbegin when ready*`,
        mentions,
    });
});

gmd({
    pattern: "wcgbegin",
    aliases: ["startwcg", "wcggo"],
    react: "🚀",
    category: "game",
    description: "Start the Word Chain Game (host only)",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    const waitingGame = await getWaitingWcgGame(from);
    if (!waitingGame) {
        return await Gifted.sendMessage(from, {
            text: "❌ No game waiting to start!",

        });
    }
    
    const players = JSON.parse(waitingGame.players);
    if (players[0] !== sender) {
        return await Gifted.sendMessage(from, {
            text: "❌ Only the host can start the game!",

        });
    }
    
    clearWcgJoinTimeout(from);
    
    const result = await startWcgGame(from);
    
    if (result.error === 'not_enough_players') {
        return await Gifted.sendMessage(from, {
            text: "❌ Need at least 2 players to start!",

        });
    }
    
    const playerList = result.players.map((p, i) => `${i + 1}. @${getPlayerName(p)}`).join('\n');
    
    await Gifted.sendMessage(from, {
        text: `🚀 *WORD CHAIN STARTED!*\n\n👥 *Players:*\n${playerList}\n\n🔄 @${getPlayerName(result.currentTurn)}'s turn!\n*Say any word to begin!*\n\n⏰ _30 seconds per turn_`,
        mentions: [...result.players, result.currentTurn],
    });
    
    setWcgTurnTimeout(from, Gifted, result.currentTurn, result.game);
});

gmd({
    pattern: "wcgend",
    aliases: ["endwcg", "wcgstop", "stopwcg", "wcgcancel"],
    react: "🛑",
    category: "game",
    description: "End the Word Chain Game",
}, async (from, Gifted, conText) => {
    const { sender, isSuperUser } = conText;
    
    const game = await getActiveWcgGame(from) || await getWaitingWcgGame(from);
    
    if (!game) {
        return await Gifted.sendMessage(from, {
            text: "❌ No Word Chain game to end!",
        });
    }
    
    const players = JSON.parse(game.players);
    const isPlayer = players.includes(sender);
    if (!isPlayer && !isSuperUser) {
        return await Gifted.sendMessage(from, {
            text: "❌ Only players or admins can end the game!",
        });
    }
    
    clearWcgTimeout(from);
    clearWcgJoinTimeout(from);
    const scores = await endWcgGame(from);
    
    let text = `🛑 Word Chain ended by @${getPlayerName(sender)}!`;
    if (scores && Object.keys(scores).length > 0) {
        text += `\n\n📊 *Final Scores:*\n${formatScores(scores)}`;
    }
    
    await Gifted.sendMessage(from, {
        text,
        mentions: [sender],
    });
});

gmd({
    pattern: "wcgscores",
    aliases: ["wcgscore", "wordchainscore"],
    react: "📊",
    category: "game",
    description: "Show Word Chain scores",
}, async (from, Gifted, conText) => {
    const game = await getActiveWcgGame(from);
    
    if (!game) {
        return await Gifted.sendMessage(from, {
            text: "❌ No active Word Chain game!",

        });
    }
    
    const scores = JSON.parse(game.scores);
    const players = JSON.parse(game.players);
    const usedWords = JSON.parse(game.usedWords);
    
    await Gifted.sendMessage(from, {
        text: `📊 *WORD CHAIN SCORES*\n\n${formatScores(scores)}\n\n📝 Words used: ${usedWords.length}\n🔄 Current turn: @${getPlayerName(game.currentTurn)}\n${game.lastWord ? `Last word: *${game.lastWord}*` : ''}`,
        mentions: [...players, game.currentTurn],
    });
});

gmd({
    pattern: "w",
    aliases: ["word", "wcgword", "say"],
    react: "🔤",
    category: "game",
    description: "Submit a word in Word Chain Game",
}, async (from, Gifted, conText) => {
    const { sender, q, botPrefix } = conText;
    
    const game = await getActiveWcgGame(from);
    if (!game) {
        return;
    }
    
    if (!q || q.trim() === '') {
        return await Gifted.sendMessage(from, {
            text: `❌ Provide a word!\n\nUsage: ${botPrefix}w <word>`,

        });
    }
    
    const word = q.trim().split(/\s+/)[0];
    const result = await submitWord(from, sender, word);
    
    if (result.error === 'not_your_turn') {
        return await Gifted.sendMessage(from, {
            text: "❌ It's not your turn!",

        });
    }
    
    if (result.error === 'word_used') {
        return await Gifted.sendMessage(from, {
            text: `❌ "${word}" has already been used!`,

        });
    }
    
    if (result.error === 'wrong_letter') {
        return await Gifted.sendMessage(from, {
            text: `❌ Word must start with *${result.expected.toUpperCase()}*!`,

        });
    }
    
    if (result.error === 'too_short') {
        return await Gifted.sendMessage(from, {
            text: "❌ Word must be at least 2 letters!",

        });
    }
    
    clearWcgTimeout(from);
    
    const nextLetter = result.word.slice(-1).toUpperCase();
    
    const updatedGame = await getActiveWcgGame(from);
    if (updatedGame && updatedGame.isAiGame && result.nextPlayer === BOT_JID) {
        await Gifted.sendMessage(from, {
            text: `✅ *${result.word}* (+${result.word.length} pts)\n\n🤖 AI is thinking...`,

        });
        await handleAiWcgMoveInternal(from, Gifted, updatedGame);
        return;
    }
    
    await Gifted.sendMessage(from, {
        text: `✅ *${result.word}* (+${result.word.length} pts)\n\n🔄 @${getPlayerName(result.nextPlayer)}'s turn\nNext word starts with: *${nextLetter}*\n\n📊 Words: ${result.wordCount} | ⏰ 30s`,
        mentions: [result.nextPlayer],
    });
    
    setWcgTurnTimeout(from, Gifted, result.nextPlayer, result.game);
});

async function handleAiWcgMoveInternal(from, Gifted, game) {
    const lastWord = game.lastWord;
    const usedWords = JSON.parse(game.usedWords);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiWord = findWcgWord(lastWord, usedWords);
    
    if (!aiWord) {
        const scores = JSON.parse(game.scores);
        await endWcgGame(from);
        await Gifted.sendMessage(from, {
            text: `🎉 *YOU WIN!*\n\n🤖 AI couldn't find a word starting with *${lastWord.slice(-1).toUpperCase()}*!\n\n📊 *Final Scores:*\n${formatScores(scores)}`,

        });
        return;
    }
    
    const result = await submitWord(from, BOT_JID, aiWord);
    
    if (result.error) {
        const scores = JSON.parse(game.scores);
        await endWcgGame(from);
        await Gifted.sendMessage(from, {
            text: `🎉 *YOU WIN!*\n\n🤖 AI made an error!\n\n📊 *Final Scores:*\n${formatScores(scores)}`,

        });
        return;
    }
    
    const nextLetter = result.word.slice(-1).toUpperCase();
    await Gifted.sendMessage(from, {
        text: `🤖 AI says: *${result.word}* (+${result.word.length} pts)\n\n🔄 @${getPlayerName(result.nextPlayer)}'s turn\nNext word starts with: *${nextLetter}*\n\n📊 Words: ${result.wordCount} | ⏰ 30s`,
        mentions: [result.nextPlayer],
    });
    
    setWcgTurnTimeout(from, Gifted, result.nextPlayer, result.game);
}

gmd({
    pattern: "dice",
    aliases: ["dicestart", "dicegame", "rolldice"],
    react: "🎲",
    category: "game",
    description: "Start a Dice Game",
}, async (from, Gifted, conText) => {
    const { sender, q } = conText;
    
    const existingActive = await getActiveDiceGame(from);
    if (existingActive) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already an active Dice game!\nUse *.diceend* to end it first.",

        });
    }
    
    const existingWaiting = await getWaitingDiceGame(from);
    if (existingWaiting) {
        return await Gifted.sendMessage(from, {
            text: "❌ A game is waiting for an opponent!\nUse *.dicejoin* to join or *.diceend* to cancel.",

        });
    }
    
    const rounds = parseInt(q) || 3;
    await createDiceGame(from, sender, rounds);
    
    await Gifted.sendMessage(from, {
        text: `🎲 *DICE GAME*\n\n@${getPlayerName(sender)} wants to play!\n\n📜 *Rules:*\n• ${rounds} rounds\n• Each player rolls once per round\n• Highest roll wins the round\n• Most rounds won = winner!\n\n*Type .dicejoin to play!*\n⏰ _30 seconds to join_`,
        mentions: [sender],
    });
    
    const timeout = setTimeout(async () => {
        const waiting = await getWaitingDiceGame(from);
        if (waiting) {
            await endDiceGame(from);
            await Gifted.sendMessage(from, {
                text: `⏰ *DICE GAME - TIMEOUT*\n\nNo one joined within 30 seconds.\nGame cancelled!`,
    
            });
        }
    }, 30000);
    diceTimeouts.set(from + '_join', timeout);
});

gmd({
    pattern: "dicejoin",
    aliases: ["joindice"],
    react: "✅",
    category: "game",
    description: "Join a Dice Game",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    if (diceTimeouts.has(from + '_join')) {
        clearTimeout(diceTimeouts.get(from + '_join'));
        diceTimeouts.delete(from + '_join');
    }
    
    const result = await joinDiceGame(from, sender);
    
    if (result.error === 'no_game') {
        return await Gifted.sendMessage(from, {
            text: "❌ No game waiting! Start one with *.dice*",

        });
    }
    
    if (result.error === 'same_player') {
        return await Gifted.sendMessage(from, {
            text: "❌ You can't play against yourself!",

        });
    }
    
    await Gifted.sendMessage(from, {
        text: `🎲 *DICE GAME STARTED!*\n\n👤 @${getPlayerName(result.player1)} vs @${getPlayerName(result.player2)}\n🎯 Best of ${result.rounds} rounds\n\n*Round 1*\n@${getPlayerName(result.player1)}, type *.roll* to roll!\n\n⏰ _30 seconds per turn_`,
        mentions: [result.player1, result.player2],
    });
    
    setDiceTurnTimeout(from, Gifted, result.player1, result.game);
});

gmd({
    pattern: "roll",
    aliases: ["diceroll", "throwdice"],
    react: "🎲",
    category: "game",
    description: "Roll the dice in an active game",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    const game = await getActiveDiceGame(from);
    if (!game) {
        return await Gifted.sendMessage(from, {
            text: "❌ No active Dice game! Start one with *.dice*",

        });
    }
    
    clearDiceTimeout(from);
    const result = await playerRoll(from, sender);
    
    if (result.error === 'not_your_turn') {
        return await Gifted.sendMessage(from, {
            text: "❌ It's not your turn!",

        });
    }
    
    if (result.roundComplete || result.gameFinished) {
        let text = `🎲 *Round ${result.currentRound} Results*\n\n`;
        text += `${getDiceEmoji(result.player1Roll)} @${getPlayerName(result.player1)}: ${result.player1Roll}\n`;
        text += `${getDiceEmoji(result.player2Roll)} @${getPlayerName(result.player2)}: ${result.player2Roll}\n\n`;
        
        if (result.roundWinner) {
            text += `🏆 @${getPlayerName(result.roundWinner)} wins this round!\n`;
        } else {
            text += `🤝 It's a tie!\n`;
        }
        
        text += `\n📊 *Score:* ${result.player1Score} - ${result.player2Score}`;
        
        if (result.gameFinished) {
            text += `\n\n🎮 *GAME OVER!*\n`;
            if (result.gameWinner) {
                text += `🏆 *WINNER:* @${getPlayerName(result.gameWinner)}!`;
            } else {
                text += `🤝 *It's a tie!*`;
            }
            await endDiceGame(from);
        } else {
            text += `\n\n*Round ${result.nextRound}*\n@${getPlayerName(result.player1)}, type *.roll*!`;
            setDiceTurnTimeout(from, Gifted, result.player1, game);
        }
        
        await Gifted.sendMessage(from, {
            text,
            mentions: [result.player1, result.player2, result.roundWinner, result.gameWinner].filter(Boolean),
        });
    } else {
        if (game.isAiGame && result.waitingFor === BOT_JID) {
            clearDiceTimeout(from);
            await Gifted.sendMessage(from, {
                text: `🎲 @${getPlayerName(sender)} rolled: ${getDiceEmoji(result.roll)} *${result.roll}*\n\n🤖 AI is rolling...`,
                mentions: [sender],
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const aiResult = await playerRoll(from, BOT_JID);
            
            if (aiResult.error) {
                await Gifted.sendMessage(from, {
                    text: `❌ AI roll error. Game ended.`,
                });
                await endDiceGame(from);
                return;
            }
            
            let text = `🎲 *Round ${aiResult.currentRound} Results*\n\n`;
            text += `${getDiceEmoji(aiResult.player1Roll)} @${getPlayerName(aiResult.player1)}: ${aiResult.player1Roll}\n`;
            text += `${getDiceEmoji(aiResult.player2Roll)} 🤖 AI: ${aiResult.player2Roll}\n\n`;
            
            if (aiResult.roundWinner) {
                const winnerName = aiResult.roundWinner === BOT_JID ? '🤖 AI' : `@${getPlayerName(aiResult.roundWinner)}`;
                text += `🏆 ${winnerName} wins this round!\n`;
            } else {
                text += `🤝 It's a tie!\n`;
            }
            
            text += `\n📊 *Score:* ${aiResult.player1Score} - ${aiResult.player2Score}`;
            
            if (aiResult.gameFinished) {
                text += `\n\n🎮 *GAME OVER!*\n`;
                if (aiResult.gameWinner) {
                    const winnerName = aiResult.gameWinner === BOT_JID ? '🤖 AI wins!' : `🏆 @${getPlayerName(aiResult.gameWinner)} wins!`;
                    text += winnerName;
                } else {
                    text += `🤝 *It's a tie!*`;
                }
                await endDiceGame(from);
            } else {
                text += `\n\n*Round ${aiResult.nextRound}*\n@${getPlayerName(aiResult.player1)}, type *.roll*!`;
                const freshGame = await getActiveDiceGame(from);
                setDiceTurnTimeout(from, Gifted, aiResult.player1, freshGame);
            }
            
            await Gifted.sendMessage(from, {
                text,
                mentions: [aiResult.player1],
            });
            return;
        }
        
        await Gifted.sendMessage(from, {
            text: `🎲 @${getPlayerName(sender)} rolled: ${getDiceEmoji(result.roll)} *${result.roll}*\n\n@${getPlayerName(result.waitingFor)}, type *.roll*!`,
            mentions: [sender, result.waitingFor],
        });
        setDiceTurnTimeout(from, Gifted, result.waitingFor, game);
    }
});

gmd({
    pattern: "diceend",
    aliases: ["enddice", "dicestop", "stopdice", "dicecancel"],
    react: "🛑",
    category: "game",
    description: "End the Dice Game",
}, async (from, Gifted, conText) => {
    const { sender, isSuperUser } = conText;
    
    const game = await getActiveDiceGame(from) || await getWaitingDiceGame(from);
    
    if (!game) {
        return await Gifted.sendMessage(from, {
            text: "❌ No Dice game to end!",
        });
    }
    
    const isPlayer = game.player1 === sender || game.player2 === sender;
    if (!isPlayer && !isSuperUser) {
        return await Gifted.sendMessage(from, {
            text: "❌ Only players or admins can end the game!",
        });
    }
    
    clearDiceTimeout(from);
    if (diceTimeouts.has(from + '_join')) {
        clearTimeout(diceTimeouts.get(from + '_join'));
        diceTimeouts.delete(from + '_join');
    }
    await endDiceGame(from);
    
    await Gifted.sendMessage(from, {
        text: `🛑 Dice game ended by @${getPlayerName(sender)}!`,
        mentions: [sender],
    });
});

gmd({
    pattern: "tttai",
    aliases: ["tttbot", "tictactoeai", "aitt"],
    react: "🤖",
    category: "game",
    description: "Play TicTacToe against AI",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    const existingActive = await getActiveGame(from);
    if (existingActive) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already an active game in this chat!\nUse *.tttend* to end it first.",

        });
    }
    
    const existingWaiting = await getWaitingGame(from);
    if (existingWaiting) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already a game waiting!\nUse *.tttend* to cancel.",

        });
    }
    
    const sentMsg = await Gifted.sendMessage(from, {
        text: `🤖 *TIC TAC TOE vs AI*\n\nPlayer: @${getPlayerName(sender)} (❌)\nAI: 🤖 (⭕)\n\n${renderBoard([1, 2, 3, 4, 5, 6, 7, 8, 9])}\n\n@${getPlayerName(sender)}'s turn (❌)\n*Reply with a number (1-9) to move!*`,
        mentions: [sender],
    });
    
    await createGame(from, sender, sentMsg.key, true);
});

gmd({
    pattern: "wcgai",
    aliases: ["wcgbot", "wordchainai", "aiwcg"],
    react: "🤖",
    category: "game",
    description: "Play Word Chain Game against AI",
}, async (from, Gifted, conText) => {
    const { sender } = conText;
    
    const existingActive = await getActiveWcgGame(from);
    if (existingActive) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already an active Word Chain game!\nUse *.wcgend* to end it first.",

        });
    }
    
    const existingWaiting = await getWaitingWcgGame(from);
    if (existingWaiting) {
        return await Gifted.sendMessage(from, {
            text: "❌ A game is waiting for players!\nUse *.wcgend* to cancel.",

        });
    }
    
    const { WcgDB } = require("../guru/database/wcgGame");
    await WcgDB.destroy({ where: { chatJid: from } });
    
    const scores = {};
    scores[sender] = 0;
    scores[BOT_JID] = 0;
    
    await WcgDB.create({
        chatJid: from,
        players: JSON.stringify([sender, BOT_JID]),
        currentTurn: sender,
        lastWord: null,
        usedWords: '[]',
        scores: JSON.stringify(scores),
        status: 'active',
        isAiGame: true,
    });
    
    await Gifted.sendMessage(from, {
        text: `🤖 *WORD CHAIN vs AI*\n\n📜 *Rules:*\n• Each word must start with the last letter of the previous word\n• No repeating words\n• Minimum 2 letters per word\n• 30 seconds per turn\n\n👤 @${getPlayerName(sender)} vs 🤖 AI\n\n@${getPlayerName(sender)}'s turn - say any word to start!\n\n⏰ _30 seconds per turn_`,
        mentions: [sender],
    });
    
    setWcgTurnTimeout(from, Gifted, sender, null);
});

gmd({
    pattern: "diceai",
    aliases: ["dicebot", "aidice", "rolldiceai"],
    react: "🤖",
    category: "game",
    description: "Play Dice against AI",
}, async (from, Gifted, conText) => {
    const { sender, q } = conText;
    
    const existingActive = await getActiveDiceGame(from);
    if (existingActive) {
        return await Gifted.sendMessage(from, {
            text: "❌ There's already an active Dice game!\nUse *.diceend* to end it first.",

        });
    }
    
    const existingWaiting = await getWaitingDiceGame(from);
    if (existingWaiting) {
        return await Gifted.sendMessage(from, {
            text: "❌ A game is waiting!\nUse *.diceend* to cancel.",

        });
    }
    
    const rounds = parseInt(q) || 3;
    const { DiceDB } = require("../guru/database/diceGame");
    await DiceDB.destroy({ where: { chatJid: from } });
    
    await DiceDB.create({
        chatJid: from,
        player1: sender,
        player2: BOT_JID,
        player1Roll: null,
        player2Roll: null,
        currentTurn: sender,
        rounds: Math.min(Math.max(rounds, 1), 10),
        currentRound: 1,
        player1Score: 0,
        player2Score: 0,
        status: 'active',
        isAiGame: true,
    });
    
    await Gifted.sendMessage(from, {
        text: `🤖 *DICE GAME vs AI*\n\n👤 @${getPlayerName(sender)} vs 🤖 AI\n🎯 Best of ${rounds} rounds\n\n*Round 1*\n@${getPlayerName(sender)}, type *.roll* to roll!\n\n⏰ _30 seconds per turn_`,
        mentions: [sender],
    });
    
    setDiceTurnTimeout(from, Gifted, sender, null);
});

module.exports = {};
