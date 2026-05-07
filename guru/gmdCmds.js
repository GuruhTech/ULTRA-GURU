
const commands = [];

function gmd(options, handler) {
    commands.push({ ...options, handler });
}

module.exports = { gmd, commands };
