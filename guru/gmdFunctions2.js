
const fs = require("fs-extra");
const path = require("path");
const { pipeline } = require("stream/promises");
const { createContext } = require("./gmdHelpers");
const { getSetting, getAllSettings } = require("./database/settings");
const logger = require("gifted-baileys/lib/Utils/logger").default.child({});
const { isJidGroup, downloadMediaMessage } = require("gifted-baileys");



const formatTime = (timestamp, timeZone = 'Africa/Nairobi') => {
    const date = new Date(timestamp);
    const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZone };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const formatDate = (timestamp, timeZone = 'Africa/Nairobi') => {
    const date = new Date(timestamp);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone };
    return new Intl.DateTimeFormat('en-GB', options).format(date); 
};

const isMediaMessage = message => {
    const typeOfMessage = getContentType(message);
    const mediaTypes = [
        'imageMessage',
        'videoMessage',
        'audioMessage',
        'documentMessage',
        'stickerMessage'
    ];
    return mediaTypes.includes(typeOfMessage);
};


const isAnyLink = (message) => {
    if (!message || typeof message !== 'string') return false;
    if (/https?:\/\/[^\s]+/i.test(message)) return true;
    if (/(?:^|\s)www\.[a-z0-9-]+\.[a-z]{2,}[^\s]*/i.test(message)) return true;
    if (/(?:^|\s)(?:chat\.whatsapp\.com|wa\.me|t\.me|youtu\.be|bit\.ly|tinyurl\.com|goo\.gl)\/[^\s]*/i.test(message)) return true;
    return false;
};


const emojis = ['💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '❤️‍', '🔥', '❤️‍', '🩹', '💯', '♨️', '💢', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🌐', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄️', '🎴', '🎭️', '🔇', '🔈️', '🔉', '🔊', '🔔', '🔕', '🎼', '🎵', '🎶', '💹', '🏧', '🚮', '🚰', '♿️', '🚹️', '🚺️', '🚻', '🚼️', '🚾', '🛂', '🛃', '🛄', '🛅', '⚠️', '🚸', '⛔️', '🚫', '🚳', '🚭️', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩️', '⏭️', '⏯️', '◀️', '⏪️', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♀️', '♂️', '⚧', '✖️', '➕', '➖', '➗', '♾️', '‼️', '⁉️', '❓️', '❔', '❕', '❗️', '〰️', '💱', '💲', '⚕️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕️', '✅', '☑️', '✔️', '❌', '❎', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔠', '🔡', '🔢', '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯️', '🉐', '🈹', '🈚️', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫️', '⚪️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛️', '⬜️', '◼️', '◻️', '◾️', '◽️', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '🕛️', '🕧️', '🕐️', '🕜️', '🕑️', '🕝️', '🕒️', '🕞️', '🕓️', '🕟️', '🕔️', '🕠️', '🕕️', '🕡️', '🕖️', '🕢️', '🕗️', '🕣️', '🕘️', '🕤️', '🕙️', '🕥️', '🕚️', '🕦️', '*️', '#️', '0️', '1️', '2️', '3️', '4️', '5️', '6️', '7️', '8️', '9️', '🛎️', '🧳', '⌛️', '⏳️', '⌚️', '⏰', '⏱️', '⏲️', '🕰️', '🌡️', '🗺️', '🧭', '🎃', '🎄', '🧨', '🎈', '🎉', '🎊', '🎎', '🎏', '🎐', '🎀', '🎁', '🎗️', '🎟️', '🎫', '🔮', '🧿', '🎮️', '🕹️', '🎰', '🎲', '♟️', '🧩', '🧸', '🖼️', '🎨', '🧵', '🧶', '👓️', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓️', '🧢', '⛑️', '📿', '💄', '💍', '💎', '📢', '📣', '📯', '🎙️', '🎚️', '🎛️', '🎤', '🎧️', '📻️', '🎷', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '📱', '📲', '☎️', '📞', '📟️', '📠', '🔋', '🔌', '💻️', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿️', '📀', '🧮', '🎥', '🎞️', '📽️', '🎬️', '📺️', '📷️', '📸', '📹️', '📼', '🔍️', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔', '📔', '📕', '📖', '📗', '📘', '📙', '📚️', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰️', '💴', '💵', '💶', '💷', '💸', '💳️', '🧾', '✉️', '💌', '📧', '🧧', '📨', '📩', '📤️', '📥️', '📦️', '📫️', '📪️', '📬️', '📭️', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋️', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒️', '🔓️', '🔏', '🔐', '🔑', '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '💣️', '🏹', '🛡️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🧰', '🧲', '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🚪', '🛏️', '🛋️', '🪑', '🚽', '🚿', '🛁', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🧼', '🧽', '🧯', '🛒', '🚬', '⚰️', '⚱️', '🏺', '🕳️', '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏟️', '🏛️', '🏗️', '🧱', '🏘️', '🏚️', '🏠️', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭️', '🏯', '🏰', '💒', '🗼', '🗽', '⛪️', '🕌', '🛕', '🕍', '⛩️', '🕋', '⛲️', '⛺️', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '🗾', '🏞️', '🎠', '🎡', '🎢', '💈', '🎪', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇️', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍️', '🚎', '🚐', '🚑️', '🚒', '🚓', '🚔️', '🚕', '🚖', '🚗', '🚘️', '🚙', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲️', '🛴', '🛹', '🚏', '🛣️', '🛤️', '🛢️', '⛽️', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓️', '⛵️', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🎆', '🎇', '🎑', '🗿', '⚽️', '⚾️', '🥎', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳️', '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎯', '🪀', '🪁', '🎱', '🎖️', '🏆️', '🏅', '🥇', '🥈', '🥉', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕️', '🍵', '🍶', '🍾', '🍷', '🍸️', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🐵', '🐒', '🦍', '🦧', '🐶', '🐕️', '🦮', '🐕‍', '🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈️', '🐈‍', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦔', '🦇', '🐻', '🐻‍', '❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦️', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🐟️', '🐠', '🐡', '🦈', '🐙', '🦑', '🦀', '🦞', '🦐', '🦪', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🐞', '🦗', '🕷️', '🕸️', '🦂', '🦟', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🎋', '🎍', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌍️', '🌎️', '🌏️', '🌑', '🌒', '🌓', '🌔', '🌕️', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜️', '☀️', '🌝', '🌞', '🪐', '💫', '⭐️', '🌟', '✨', '🌠', '🌌', '☁️', '⛅️', '⛈️', '🌤️', '🌥️', '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '🌀', '🌈', '🌂', '☂️', '☔️', '⛱️', '⚡️', '❄️', '☃️', '⛄️', '☄️', '🔥', '💧', '🌊', '💥', '💦', '💨', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐️', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '😮‍', '💨', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍', '🌫️', '🥴', '😵‍', '💫', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽️', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈️', '👉️', '👆️', '🖕', '👇️', '☝️', '👍️', '👎️', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂️', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧔', '🧔‍♀️', '🧔‍♂️', '🧑', '👨‍', '🦰', '👩‍', '🦰', '🧑', '👨‍', '🦱', '👩‍', '🦱', '🧑', '👨‍', '🦳', '👩‍', '🦳', '🧑', '👨‍', '🦲', '👩‍', '🦲', '👱', '👱‍♂️', '👱‍♀️', '🧓', '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍⚖️', '👨‍⚖️', '👩‍⚖️', '🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍🔧', '👨‍🔧', '👩‍🔧', '🧑‍🏭', '👨‍🏭', '👩‍🏭', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎤', '👨‍🎤', '👩‍🎤', '🧑‍🎨', '👨‍🎨', '👩‍🎨', '🧑‍✈️', '👨‍✈️', '👩‍✈️', '🧑‍🚀', '👨‍🚀', '👩‍🚀', '🧑‍🚒', '👨‍🚒', '👩‍🚒', '👮', '👮‍♂️', '👮‍♀️', '🕵️', '🕵️‍♂️', '🕵️‍♀️', '💂', '💂‍♂️', '💂‍♀️', '👷', '👷‍♂️', '👷‍♀️', '🤴', '👸', '👳', '👳‍♂️', '👳‍♀️', '👲', '🧕', '🤵', '🤵‍♂️', '🤵‍♀️', '👰', '👰‍♂️', '👰‍♀️', '🤰', '🤱', '👩‍', '🍼', '👨‍', '🍼', '🧑‍', '🍼', '👼', '🎅', '🤶', '🧑‍', '🎄', '🦸', '🦸‍♂️', '🦸‍♀️', '🦹', '🦹‍♂️', '🦹‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️', '🧚', '🧚‍♂️', '🧚‍♀️', '🧛', '🧛‍♂️', '🧛‍♀️', '🧜', '🧜‍♂️', '🧜‍♀️', '🧝', '🧝‍♂️', '🧝‍♀️', '🧞', '🧞‍♂️', '🧞‍♀️', '🧟', '🧟‍♂️', '🧟‍♀️', '💆', '💆‍♂️', '💆‍♀️', '💇', '💇‍♂️', '💇‍♀️', '🚶', '🚶‍♂️', '🚶‍♀️', '🧍', '🧍‍♂️', '🧍‍♀️', '🧎', '🧎‍♂️', '🧎‍♀️', '🧑‍', '🦯', '👨‍', '🦯', '👩‍', '🦯', '🧑‍', '🦼', '👨‍', '🦼', '👩‍', '🦼', '🧑‍', '🦽', '👨‍', '🦽', '👩‍', '🦽', '🏃', '🏃‍♂️', '🏃‍♀️', '💃', '🕺', '🕴️', '👯', '👯‍♂️', '👯‍♀️', '🧖', '🧖‍♂️', '??‍♀️', '🧗', '🧗‍♂️', '🧗‍♀️', '🤺', '🏇', '⛷️', '🏂️', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏄️', '🏄‍♂️', '🏄‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🏊️', '🏊‍♂️', '🏊‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🤸', '🤸‍♂️', '🤸‍♀️', '🤼', '🤼‍♂️', '🤼‍♀️', '🤽', '🤽‍♂️', '🤽‍♀️', '🤾', '🤾‍♂️', '🤾‍♀️', '🤹', '🤹‍♂️', '🤹‍♀️', '🧘', '🧘‍♂️', '🧘‍♀️', '🛀', '🛌', '🧑‍', '🤝‍', '🧑', '👭', '👫', '👬', '💏', '👩‍❤️‍💋‍👨', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '💑', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '👪️', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧', '🗣️', '👤', '👥', '👣']; const GiftedApiKey = '_0u5aff45,_0l1876s8qc'; const GiftedTechApi = 'https://api.giftedtech.co.ke';
async function GiftedAutoReact(emoji, ms,Gifted) {
  try {
    const react = {
      react: {
        text: emoji,
        key: ms.key,
      },
    };

    await Gifted.sendMessage(ms.key.remoteJid, react);
  } catch (error) {
    console.error('Error sending auto reaction:', error);
  }
}


const DEV_NUMBERS = ['254715206562', '254114018035', '254728782591', '254799916673', '254762016957', '254113174209'];

const GiftedAntiLink = async (Gifted, message, getGroupMetadata) => {
    try {
        if (!message?.message || message.key.fromMe) return;
        const from = message.key.remoteJid; 
        const isGroup = from.endsWith('@g.us');

        if (!isGroup) return;

        const { getGroupSetting, addAntilinkWarning, resetAntilinkWarnings } = require('./database/groupSettings');
        const { getSudoNumbers } = require('./database/sudo');
        const { getLidMapping } = require('./connection/groupCache');
        const antiLink = await getGroupSetting(from, 'ANTILINK');
        
        if (!antiLink || antiLink === 'false' || antiLink === 'off') return;

        const messageType = Object.keys(message.message)[0];
        const body = messageType === 'conversation'
            ? message.message.conversation
            : message.message[messageType]?.text || message.message[messageType]?.caption || '';

        if (!body || !isAnyLink(body)) return;

        let sender = message.key.participantPn || message.key.participant || message.participant;
        if (!sender || sender.endsWith('@g.us')) {
            return;
        }

        const settings = await getAllSettings();
        const botName = settings.BOT_NAME || 'ULTRA GURU';
        
        if (sender.endsWith('@lid')) {
            const cached = getLidMapping(sender);
            if (cached) {
                sender = cached;
            } else {
                try {
                    const resolved = await Gifted.getJidFromLid(sender);
                    if (resolved) sender = resolved;
                } catch (e) {}
            }
        }
        const senderNum = sender.split('@')[0];

        const sudoNumbers = await getSudoNumbers() || [];
        const isSuperUser = DEV_NUMBERS.includes(senderNum) || sudoNumbers.includes(senderNum);
        
        if (isSuperUser) {
            const action = antiLink.toLowerCase();
            const actionText = action === 'warn' ? 'warn' : action === 'kick' ? 'kick' : 'delete';
            await Gifted.sendMessage(from, {
                text: `⚠️ *${botName} Antilink Active!*\nAction: *${actionText}*\n\nLink detected from @${senderNum}, but they are a *SuperUser* on this bot and cannot be actioned.`,
                mentions: [sender],
            });
            return;
        }

        const groupMetadata = await getGroupMetadata(Gifted, from);
        if (!groupMetadata || !groupMetadata.participants) return;

        const botJid = Gifted.user?.id?.split(':')[0] + '@s.whatsapp.net';
        const botAdmin = groupMetadata.participants.find(p => {
            const pNum = (p.pn || p.phoneNumber || p.id || '').split('@')[0];
            const botNum = botJid.split('@')[0];
            return pNum === botNum && p.admin;
        });
        if (!botAdmin) return;

        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.pn || admin.phoneNumber || admin.id);

        const senderNormalized = sender.split('@')[0];
        const isAdmin = groupAdmins.some(admin => {
            const adminNum = (admin || '').split('@')[0];
            return adminNum === senderNormalized || admin === sender;
        });

        if (isAdmin) {
            const action = antiLink.toLowerCase();
            const actionText = action === 'warn' ? 'warn' : action === 'kick' ? 'kick' : 'delete';
            await Gifted.sendMessage(from, {
                text: `⚠️ *${botName} Antilink Active!*\nAction: *${actionText}*\n\nLink detected from @${senderNum}, but they are a *Group Admin* and cannot be actioned.`,
                mentions: [sender],
            });
            return;
        }

        try {
            await Gifted.sendMessage(from, { delete: message.key });
        } catch (delErr) {
            console.error('Failed to delete message:', delErr.message);
        }

        const action = antiLink.toLowerCase();

        if (action === 'kick') {
            try {
                await Gifted.groupParticipantsUpdate(from, [sender], 'remove');
                await Gifted.sendMessage(from, {
                    text: `⚠️ ${botName} anti-link active!\n@${senderNum} has been kicked for sharing a link.`,
                    mentions: [sender],
                });
            } catch (kickErr) {
                console.error('Failed to kick user:', kickErr.message);
                await Gifted.sendMessage(from, {
                    text: `⚠️ Link detected from @${senderNum}! Could not remove user.`,
                    mentions: [sender],
                });
            }
        } else if (action === 'delete') {
            await Gifted.sendMessage(from, {
                text: `⚠️ ${botName} anti-link active!\nLinks are not allowed here @${senderNum}!`,
                mentions: [sender],
            });
        } else if (action === 'warn') {
            const warnLimit = parseInt(await getGroupSetting(from, 'ANTILINK_WARN_COUNT')) || 5;
            const currentWarns = await addAntilinkWarning(from, sender);
            
            if (currentWarns >= warnLimit) {
                try {
                    await Gifted.groupParticipantsUpdate(from, [sender], 'remove');
                    await resetAntilinkWarnings(from, sender);
                    await Gifted.sendMessage(from, {
                        text: `🚫 ${botName} anti-link!\n@${senderNum} reached ${warnLimit} warnings and has been kicked!`,
                        mentions: [sender],
                    });
                } catch (kickErr) {
                    console.error('Failed to kick user:', kickErr.message);
                    await Gifted.sendMessage(from, {
                        text: `⚠️ @${senderNum} has ${currentWarns}/${warnLimit} warnings! Could not kick.`,
                        mentions: [sender],
                    });
                }
            } else {
                await Gifted.sendMessage(from, {
                    text: `⚠️ Warning ${currentWarns}/${warnLimit} for @${senderNum}!\nLinks are not allowed. You will be kicked after ${warnLimit} warnings.`,
                    mentions: [sender],
                });
            }
        }
    } catch (err) {
        console.error('Anti-link error:', err);
    }
};

const GiftedAntibad = async (Gifted, message, getGroupMetadata) => {
    try {
        if (!message?.message || message.key.fromMe) return;
        const from = message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        if (!isGroup) return;

        let sender = message.key.participantPn || message.key.participant || message.participant;
        if (!sender || sender.endsWith('@g.us')) {
            return;
        }

        const { getGroupSetting, addAntibadWarning, resetAntibadWarnings, getBadWords } = require('./database/groupSettings');
        const { getSudoNumbers } = require('./database/sudo');
        const { getLidMapping } = require('./connection/groupCache');
        const antibad = await getGroupSetting(from, 'ANTIBAD');
        
        if (!antibad || antibad === 'false' || antibad === 'off') return;

        const badWords = await getBadWords(from);
        if (!badWords || badWords.length === 0) return;

        const settings = await getAllSettings();
        const botName = settings.BOT_NAME || '𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃';
        
        if (sender.endsWith('@lid')) {
            const cached = getLidMapping(sender);
            if (cached) sender = cached;
        }
        const senderNum = sender.split('@')[0];

        const messageType = Object.keys(message.message)[0];
        const body = messageType === 'conversation'
            ? message.message.conversation
            : message.message[messageType]?.text || message.message[messageType]?.caption || '';

        if (!body) return;

        const bodyLower = body.toLowerCase();
        const foundBadWord = badWords.find(word => {
            const wordLower = word.toLowerCase();
            const escapedWord = wordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordPattern = new RegExp(`\\b${escapedWord}\\b`, 'i');
            return wordPattern.test(bodyLower);
        });

        if (!foundBadWord) return;

        const sudoNumbers = await getSudoNumbers() || [];
        const isSuperUser = DEV_NUMBERS.includes(senderNum) || sudoNumbers.includes(senderNum);
        
        if (isSuperUser) {
            const action = antibad.toLowerCase();
            const actionText = action === 'warn' ? 'warn' : action === 'kick' ? 'kick' : 'delete';
            await Gifted.sendMessage(from, {
                text: `⚠️ *${botName} Anti-BadWords Active!*\nAction: *${actionText}*\n\nBad word detected from @${senderNum}, but they are a *SuperUser* on this bot and cannot be actioned.`,
                mentions: [sender],
            });
            return;
        }

        const groupMetadata = await getGroupMetadata(Gifted, from);
        if (!groupMetadata || !groupMetadata.participants) return;

        const botJid = Gifted.user?.id?.split(':')[0] + '@s.whatsapp.net';
        const botAdmin = groupMetadata.participants.find(p => {
            const pNum = (p.pn || p.phoneNumber || p.id || '').split('@')[0];
            const botNum = botJid.split('@')[0];
            return pNum === botNum && p.admin;
        });
        if (!botAdmin) return;

        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.pn || admin.phoneNumber || admin.id);

        const senderNormalized = sender.split('@')[0];
        const isAdmin = groupAdmins.some(admin => {
            const adminNum = (admin || '').split('@')[0];
            return adminNum === senderNormalized || admin === sender;
        });

        if (isAdmin) {
            const action = antibad.toLowerCase();
            const actionText = action === 'warn' ? 'warn' : action === 'kick' ? 'kick' : 'delete';
            await Gifted.sendMessage(from, {
                text: `⚠️ *${botName} Anti-BadWords Active!*\nAction: *${actionText}*\n\nBad word detected from @${senderNum}, but they are a *Group Admin* and cannot be actioned.`,
                mentions: [sender],
            });
            return;
        }

        try {
            await Gifted.sendMessage(from, { delete: message.key });
        } catch (delErr) {
            console.error('Failed to delete bad word message:', delErr.message);
        }

        const action = antibad.toLowerCase();

        if (action === 'kick') {
            try {
                await Gifted.groupParticipantsUpdate(from, [sender], 'remove');
                await Gifted.sendMessage(from, {
                    text: `🚫 ${botName} Anti-BadWords!\n@${senderNum} has been kicked for using prohibited language.`,
                    mentions: [sender],
                });
            } catch (kickErr) {
                console.error('Failed to kick user:', kickErr.message);
                await Gifted.sendMessage(from, {
                    text: `⚠️ Bad word detected from @${senderNum}! Could not remove user.`,
                    mentions: [sender],
                });
            }
        } else if (action === 'delete' || action === 'true') {
            await Gifted.sendMessage(from, {
                text: `⚠️ ${botName} Anti-BadWords!\nProhibited language detected @${senderNum}! Keep it clean.`,
                mentions: [sender],
            });
        } else if (action === 'warn') {
            const warnLimit = parseInt(await getGroupSetting(from, 'ANTIBAD_WARN_COUNT')) || 5;
            const currentWarns = await addAntibadWarning(from, sender);
            
            if (currentWarns >= warnLimit) {
                try {
                    await Gifted.groupParticipantsUpdate(from, [sender], 'remove');
                    await resetAntibadWarnings(from, sender);
                    await Gifted.sendMessage(from, {
                        text: `🚫 ${botName} Anti-BadWords!\n@${senderNum} reached ${warnLimit} warnings and has been kicked!`,
                        mentions: [sender],
                    });
                } catch (kickErr) {
                    console.error('Failed to kick user:', kickErr.message);
                    await Gifted.sendMessage(from, {
                        text: `⚠️ @${senderNum} has ${currentWarns}/${warnLimit} warnings! Could not kick.`,
                        mentions: [sender],
                    });
                }
            } else {
                await Gifted.sendMessage(from, {
                    text: `⚠️ Warning ${currentWarns}/${warnLimit} for @${senderNum}!\nProhibited language is not allowed. You will be kicked after ${warnLimit} warnings.`,
                    mentions: [sender],
                });
            }
        }
    } catch (err) {
        console.error('Anti-badwords error:', err);
    }
};

const GiftedAntiGroupMention = async (Gifted, message, getGroupMetadata) => {
    try {
        if (!message?.message) return;
        
        const messageKeys = Object.keys(message.message);
        const hasGroupStatusMention = messageKeys.includes('groupStatusMentionMessage');
        
        if (!hasGroupStatusMention) return;
        if (message.key.fromMe) return;
        
        const groupJid = message.key.remoteJid;
        if (!groupJid || !groupJid.endsWith('@g.us')) return;
        
        const { getGroupSetting, addAntiGroupMentionWarning, resetAntiGroupMentionWarnings } = require('./database/groupSettings');
        const { getSudoNumbers } = require('./database/sudo');
        const { getLidMapping } = require('./connection/groupCache');
        
        const antiGroupMention = await getGroupSetting(groupJid, 'ANTIGROUPMENTION');
        
        if (!antiGroupMention || antiGroupMention === 'false' || antiGroupMention === 'off') return;
        
        let sender = message.key.participantPn || message.key.participant || message.participant;
        if (!sender || sender.endsWith('@g.us')) return;
        
        const settings = await getAllSettings();
        const botName = settings.BOT_NAME || 'ULTRA GURU';
        
        if (sender.endsWith('@lid')) {
            const cached = getLidMapping(sender);
            if (cached) {
                sender = cached;
            } else {
                try {
                    const jidResult = await Gifted.getJidFromLid(sender);
                    if (jidResult) sender = jidResult;
                } catch (e) {}
            }
        }
        const senderNum = sender.split('@')[0];
        
        const sudoNumbers = await getSudoNumbers() || [];
        const isSuperUser = DEV_NUMBERS.includes(senderNum) || sudoNumbers.includes(senderNum);
        
        const action = antiGroupMention.toLowerCase();
        const actionText = action === 'warn' || action === 'on' || action === 'true' ? 'warn' : action === 'kick' ? 'kick' : action === 'delete' ? 'delete' : 'warn';
        
        if (isSuperUser) {
            return;
        }
        
        const groupMetadata = await getGroupMetadata(Gifted, groupJid);
        if (!groupMetadata || !groupMetadata.participants) return;
        
        const botJid = Gifted.user?.id?.split(':')[0] + '@s.whatsapp.net';
        const botAdmin = groupMetadata.participants.find(p => {
            const pNum = (p.pn || p.phoneNumber || p.id || '').split('@')[0];
            const botNum = botJid.split('@')[0];
            return pNum === botNum && p.admin;
        });
        if (!botAdmin) return;
        
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.pn || admin.phoneNumber || admin.id);
        
        const senderNormalized = sender.split('@')[0];
        const isAdmin = groupAdmins.some(admin => {
            const adminNum = (admin || '').split('@')[0];
            return adminNum === senderNormalized || admin === sender;
        });
        
        if (isAdmin) {
            return;
        }
        
        if (action === 'delete') {
            try {
                await Gifted.sendMessage(groupJid, { delete: message.key });
                await Gifted.sendMessage(groupJid, {
                    text: `⚠️ *${botName} Anti-Status-Mention*\n\n@${senderNum}, mentioning this group in your status is not allowed. Your message has been deleted.`,
                    mentions: [sender],
                });
            } catch (delErr) {
                console.error('Failed to delete status mention message:', delErr.message);
            }
        } else if (action === 'kick') {
            try {
                await Gifted.groupParticipantsUpdate(groupJid, [sender], 'remove');
                await Gifted.sendMessage(groupJid, {
                    text: `🚫 *${botName} Anti-Group-Mention!*\n\n@${senderNum} has been kicked for mentioning this group in their status!`,
                    mentions: [sender],
                });
            } catch (kickErr) {
                console.error('Failed to kick user:', kickErr.message);
                await Gifted.sendMessage(groupJid, {
                    text: `⚠️ Group mentioned in status by @${senderNum}! Could not remove user.`,
                    mentions: [sender],
                });
            }
        } else if (action === 'warn' || action === 'true' || action === 'on') {
            const warnLimit = parseInt(await getGroupSetting(groupJid, 'ANTIGROUPMENTION_WARN_COUNT')) || 3;
            const currentWarns = await addAntiGroupMentionWarning(groupJid, sender);
            
            if (currentWarns >= warnLimit) {
                try {
                    await Gifted.groupParticipantsUpdate(groupJid, [sender], 'remove');
                    await resetAntiGroupMentionWarnings(groupJid, sender);
                    await Gifted.sendMessage(groupJid, {
                        text: `🚫 *${botName} Anti-Group-Mention!*\n\n@${senderNum} reached ${warnLimit} warnings and has been kicked for mentioning this group in status!`,
                        mentions: [sender],
                    });
                } catch (kickErr) {
                    console.error('Failed to kick user:', kickErr.message);
                    await Gifted.sendMessage(groupJid, {
                        text: `⚠️ @${senderNum} has ${currentWarns}/${warnLimit} warnings! Could not kick.`,
                        mentions: [sender],
                    });
                }
            } else {
                await Gifted.sendMessage(groupJid, {
                    text: `⚠️ *Warning ${currentWarns}/${warnLimit}* for @${senderNum}!\n\nMentioning this group in status is not allowed. You will be kicked after ${warnLimit} warnings.`,
                    mentions: [sender],
                });
            }
        }
    } catch (err) {
        console.error('Anti-group-mention error:', err);
    }
};

function getTimeBlock() {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 11) return "morning";
            if (hour >= 11 && hour < 16) return "afternoon";
            if (hour >= 16 && hour < 21) return "evening";
            if (hour >= 21 || hour < 2) return "night";
            return "latenight";
        }

        const quotes = {
            morning: [ "☀️ ʀɪsᴇ ᴀɴᴅ sʜɪɴᴇ. ɢʀᴇᴀᴛ ᴛʜɪɴɢs ɴᴇᴠᴇʀ ᴄᴀᴍᴇ ғʀᴏᴍ ᴄᴏᴍғᴏʀᴛ ᴢᴏɴᴇs.", "🌅 ᴇᴀᴄʜ �ᴍᴏʀɴɪɴɢ ᴡᴇ ᴀʀᴇ ʙᴏʀɴ ᴀɢᴀɪɴ. ᴡʜᴀᴛ ᴡᴇ ᴅᴏ ᴛᴏᴅᴀʏ ɪs ᴡʜᴀᴛ ᴍᴀᴛᴛᴇʀs �ᴍᴏsᴛ.", "⚡ sᴛᴀʀᴛ ʏᴏᴜʀ ᴅᴀʏ ᴡɪᴛʜ ᴅᴇᴛᴇʀᴍɪɴᴀᴛɪᴏɴ, ᴇɴᴅ ɪᴛ ᴡɪᴛʜ sᴀᴛɪsғᴀᴄᴛɪᴏɴ.", "🌞 ᴛʜᴇ sᴜɴ ɪs ᴜᴘ, ᴛʜᴇ ᴅᴀʏ ɪs ʏᴏᴜʀs.", "📖 ᴇᴠᴇʀʏ ᴍᴏʀɴɪɴɢ ɪs ᴀ ɴᴇᴡ ᴘᴀɢᴇ ᴏғ ʏᴏᴜʀ sᴛᴏʀʏ. ᴍᴀᴋᴇ ɪᴛ ᴄᴏᴜɴᴛ." ], 
            afternoon: [ "⏳ ᴋᴇᴇᴘ ɢᴏɪɴɢ. ʏᴏᴜ'ʀᴇ ʜᴀʟғᴡᴀʏ ᴛᴏ ɢʀᴇᴀᴛɴᴇss.", "🔄 sᴛᴀʏ ғᴏᴄᴜsᴇᴅ. ᴛʜᴇ ɢʀɪɴᴅ ᴅᴏᴇsɴ'ᴛ sᴛᴏᴘ ᴀᴛ ɴᴏᴏɴ.", "🏗️ sᴜᴄᴄᴇss ɪs ʙᴜɪʟᴛ ɪɴ ᴛʜᴇ ʜᴏᴜʀs ɴᴏʙᴏᴅʏ ᴛᴀʟᴋs ᴀʙᴏᴜᴛ.", "🔥 ᴘᴜsʜ ᴛʜʀᴏᴜɢʜ. ᴄʜᴀᴍᴘɪᴏɴs ᴀʀᴇ ᴍᴀᴅᴇ ɪɴ ᴛʜᴇ ᴍɪᴅᴅʟᴇ ᴏғ ᴛʜᴇ ᴅᴀʏ.", "⏰ ᴅᴏɴ'ᴛ ᴡᴀᴛᴄʜ ᴛʜᴇ ᴄʟᴏᴄᴋ, ᴅᴏ ᴡʜᴀᴛ ɪᴛ ᴅᴏᴇs—ᴋᴇᴇᴘ ɢᴏɪɴɢ." ],
            evening: [ "🛌 ʀᴇsᴛ ɪs ᴘᴀʀᴛ ᴏғ ᴛʜᴇ ᴘʀᴏᴄᴇss. ʀᴇᴄʜᴀʀɢᴇ ᴡɪsᴇʟʏ.", "🌇 ᴇᴠᴇɴɪɴɢ ʙʀɪɴɢꜱ ꜱɪʟᴇɴᴄᴇ ᴛʜᴀᴛ ꜱᴘᴇᴀᴋꜱ ʟᴏᴜᴅᴇʀ ᴛʜᴀɴ ᴅᴀʏʟɪɢʜᴛ.", "✨ ʏᴏᴜ ᴅɪᴅ ᴡᴇʟʟ ᴛᴏᴅᴀʏ. ᴘʀᴇᴘᴀʀᴇ ғᴏʀ ᴀɴ ᴇᴠᴇɴ ʙᴇᴛᴛᴇʀ �ᴛᴏᴍᴏʀʀᴏᴡ.", "🌙 ʟᴇᴛ ᴛʜᴇ ɴɪɢʜᴛ sᴇᴛᴛʟᴇ ɪɴ, ʙᴜᴛ ᴋᴇᴇᴘ ʏᴏᴜʀ ᴅʀᴇᴀᴍs ᴡɪᴅᴇ ᴀᴡᴀᴋᴇ.", "🧠 ɢʀᴏᴡᴛʜ ᴅᴏᴇsɴ'ᴛ ᴇɴᴅ ᴀᴛ sᴜɴsᴇᴛ. ɪᴛ sʟᴇᴇᴘs ᴡɪᴛʜ ʏᴏᴜ." ],
            night: [ "🌌 ᴛʜᴇ ɴɪɢʜᴛ ɪs sɪʟᴇɴᴛ, ʙᴜᴛ ʏᴏᴜʀ ᴅʀᴇᴀᴍs ᴀʀᴇ ʟᴏᴜᴅ.", "⭐ sᴛᴀʀs sʜɪɴᴇ ʙʀɪɢʜᴛᴇsᴛ ɪɴ ᴛʜᴇ ᴅᴀʀᴋ. sᴏ ᴄᴀɴ ʏᴏᴜ.", "🧘‍♂️ ʟᴇᴛ ɢᴏ ᴏғ ᴛʜᴇ ɴᴏɪsᴇ. ᴇᴍʙʀᴀᴄᴇ ᴛʜᴇ ᴘᴇᴀᴄᴇ.", "✅ ʏᴏᴜ ᴍᴀᴅᴇ ɪᴛ ᴛʜʀᴏᴜɢʜ ᴛʜᴇ ᴅᴀʏ. ɴᴏᴡ ᴅʀᴇᴀᴍ ʙɪɢ.", "🌠 ᴍɪᴅɴɪɢʜᴛ ᴛʜᴏᴜɢʜᴛs ᴀʀᴇ ᴛʜᴇ ʙʟᴜᴇᴘʀɪɴᴛ ᴏғ ᴛᴏᴍᴏʀʀᴏᴡ's ɢʀᴇᴀᴛɴᴇss." ],
            latenight: [ "🕶️ ᴡʜɪʟᴇ ᴛʜᴇ ᴡᴏʀʟᴅ sʟᴇᴇᴘs, ᴛʜᴇ ᴍɪɴᴅs ᴏғ ʟᴇɢᴇɴᴅs ᴡᴀɴᴅᴇʀ.", "⏱️ ʟᴀᴛᴇ ɴɪɢʜᴛs ᴛᴇᴀᴄʜ ᴛʜᴇ ᴅᴇᴇᴘᴇsᴛ ʟᴇssᴏɴs.", "🔕 sɪʟᴇɴᴄᴇ ɪsɴ'ᴛ ᴇᴍᴘᴛʏ—ɪᴛ's ғᴜʟʟ ᴏғ ᴀɴsᴡᴇʀs.", "✨ ᴄʀᴇᴀᴛɪᴠɪᴛʏ ᴡʜɪsᴘᴇʀs ᴡʜᴇɴ �ᴛʜᴇ ᴡᴏʀʟᴅ ɪs ǫᴜɪᴇᴛ.", "🌌 ʀᴇsᴛ ᴏʀ ʀᴇғʟᴇᴄᴛ, ʙᴜᴛ ɴᴇᴠᴇʀ ᴡᴀsᴛᴇ ᴛʜᴇ ɴɪɢʜᴛ." ] 
        };

        function getCurrentDateTime() {
            return new Intl.DateTimeFormat("en", {
                year: "numeric",
                month: "long",
                day: "2-digit"
            }).format(new Date());
        }

const GiftedAutoBio = async (Gifted) => {
                try {
                    const settings = await getAllSettings();
                    const botName = settings.BOT_NAME || 'ULTRA GURU';
                    
                    const block = getTimeBlock();
                    const timeDate = getCurrentDateTime();
                    const timeQuotes = quotes[block];
                    const quote = timeQuotes[Math.floor(Math.random() * timeQuotes.length)];

                    const bioText = `${botName} Online ||\n\n📅 ${timeDate}\n\n➤ ${quote}`;

                    await Gifted.updateProfileStatus(bioText);
                } catch (error) {
                }
            };


const availableApis = [
    `${GiftedTechApi}/api/ai/ai?apikey=${GiftedApiKey}&q=`,
    `${GiftedTechApi}/api/ai/mistral?apikey=${GiftedApiKey}&q=`,
    `${GiftedTechApi}/api/ai/meta-llama?apikey=${GiftedApiKey}&q=`
];

function getRandomApi() {
    return availableApis[Math.floor(Math.random() * availableApis.length)];
}

function processForTTS(text) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/[\[\]\(\)\{\}]/g, ' ')
              .replace(/\s+/g, ' ')
              .substring(0, 190);
}

const identityPatterns = [
                /who\s*(made|created|built)\s*you/i,
                /who\s*is\s*your\s*(creator|developer|maker|owner|father|parent)/i,
                /what('?s| is)\s*your\s*name\??/i,
                /who\s*are\s*you\??/i,
                /who\s*a?you\??/i,
                /who\s*au\??/i,
                /what('?s| is)\s*ur\s*name\??/i,
                /wat('?s| is)\s*(ur|your)\s*name\??/i,
                /wats?\s*(ur|your)\s*name\??/i,
                /wot('?s| is)\s*(ur|your)\s*name\??/i,
                /hoo\s*r\s*u\??/i,
                /who\s*u\??/i,
                /whos\s*u\??/i,
                /whos?\s*this\??/i,
                /you\s*called\s*guruh/i,
                /are\s*you\s*guruh/i,
                /are\s*u\s*guruh/i,
                /u\s*gifted\??/i,
                /who\s*is\s*your\s*boss\??/i,
                /who\s*ur\s*boss\??/i,
                /who\s*your\s*boss\??/i,
                /whoa\s*created\s*you\??/i,
                /who\s*made\s*u\??/i,
                /who\s*create\s*u\??/i,
                /who\s*built\s*u\??/i,
                /who\s*ur\s*owner\??/i,
                /who\s*is\s*u\??/i,
                /what\s*are\s*you\??/i,
                /what\s*r\s*u\??/i,
                /wat\s*r\s*u\??/i
            ];

function isIdentityQuestion(query) {
    return identityPatterns.some(pattern => 
        typeof query === 'string' && pattern.test(query)
    );
}

async function getAIResponse(query) {
    if (isIdentityQuestion(query)) {
        return 'I am an Interactive Ai Assistant Chat Bot, created by GuruTech!';
    }
    
    try {
        const apiUrl = getRandomApi();
        const response = await fetch(apiUrl + encodeURIComponent(query));
        
        try {
            const data = await response.json();
            let aiResponse = data.result || data.response || data.message || 
                           (data.data && (data.data.text || data.data.message)) || 
                           JSON.stringify(data);
            
            if (typeof aiResponse === 'object') {
                aiResponse = JSON.stringify(aiResponse);
            }

            return aiResponse;
        } catch (jsonError) {
            const textResponse = await response.text();
            return textResponse;
        }
    } catch (error) {
        console.error("API Error:", error);
        return "Sorry, I couldn't get a response right now";
    }
}

function GiftedChatBot(Gifted, chatBot, chatBotMode, createContext, createContext2, googleTTS) {
    if (chatBot === 'true' || chatBot === 'audio') {
        Gifted.ev.on("messages.upsert", async ({ messages }) => {
            try {
                const msg = messages[0];
                if (!msg?.message || msg.key.fromMe) return;
                
                const jid = msg.key.remoteJid;
                const isGroup = jid.endsWith('@g.us');
                
                if (chatBotMode === 'groups' && !isGroup) return;
                if (chatBotMode === 'inbox' && isGroup) return;
                
                let text = '';
                
                if (msg.message.conversation) {
                    text = msg.message.conversation;
                } else if (msg.message.extendedTextMessage?.text) {
                    text = msg.message.extendedTextMessage.text;
                } else if (msg.message.imageMessage?.caption) {
                    text = msg.message.imageMessage.caption;
                }

                if (!text || typeof text !== 'string') return;

                const settings = await getAllSettings();
                const botName = settings.BOT_NAME || '𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃';
                const aiResponse = await getAIResponse(text);

                if (chatBot === "true") {
                    await Gifted.sendMessage(jid, { 
                        text: String(aiResponse),
                        ...(await createContext(jid, {
                            title: `${botName} 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓`,
                            body: '𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐆uru 𝐀𝐩𝐢'
                        }))
                    }, { quoted: msg });
                }

                if (chatBot === 'audio') {
                    const ttsText = processForTTS(String(aiResponse));
                    if (ttsText) {
                        const audioUrl = googleTTS.getAudioUrl(ttsText, {
                            lang: "en",
                            slow: false,
                            host: "https://translate.google.com",
                        });

                        await Gifted.sendMessage(jid, {
                            audio: { url: audioUrl },
                            mimetype: "audio/mpeg",
                            ptt: true,
                            waveform: [1000, 0, 1000, 0, 1000, 0, 1000],
                            ...(await createContext2(jid, {
                               title: `${botName} 𝐀𝐔𝐃𝐈𝐎-𝐂𝐇𝐀𝐓 𝐁𝐎𝐓`,
                               body: '𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐆uru 𝐀𝐩𝐢𝐬'
                            }))
                        }, { quoted: msg });
                    }
                }
            } catch (error) {
                console.error("Message processing error:", error);
            }
        });
    }
}


const presenceTimers = new Map();

const GiftedPresence = async (Gifted, jid) => {
    try {
        const isGroup = jid.endsWith('@g.us');
        const duration = 15 * 60 * 1000; // minutes duration

        if (presenceTimers.has(jid)) {
            clearTimeout(presenceTimers.get(jid));
            presenceTimers.delete(jid);
        }

        const currentGcPresence = await getSetting('GC_PRESENCE') || 'offline';
        const currentDmPresence = await getSetting('DM_PRESENCE') || 'offline';
        const presenceType = isGroup ? currentGcPresence : currentDmPresence;
        if (!presenceType) return;

        const presence = presenceType.toLowerCase();

        if (presence === 'offline') return;

        let whatsappPresence;

        switch(presence) {
            case 'online':
                whatsappPresence = "available";
                break;
            case 'typing':
                whatsappPresence = "composing";
                break;
            case 'recording':
                whatsappPresence = "recording";
                break;
            default:
                logger.warn(`Invalid ${isGroup ? 'group' : ''}presence: ${presenceType}`);
                return;
        }

        await Gifted.sendPresenceUpdate(whatsappPresence, jid);
        logger.debug(`${isGroup ? 'Group' : 'Chat'} presence activated: ${presence} for ${jid}`);
        presenceTimers.set(jid, setTimeout(() => {
            presenceTimers.delete(jid);
            logger.debug(`${isGroup ? 'Group' : 'Chat'} presence duration ended for ${jid}`);
        }, duration));

    } catch (e) {
        logger.error('Presence update failed:', e.message);
    }
};


const GiftedAnticall = async (json, Gifted) => {
   const settings = await getAllSettings();
   const antiCall = settings.ANTICALL || 'false';
   const antiCallMsg = settings.ANTICALL_MSG || 'Calls are not allowed. This bot automatically rejects calls.';

   for (const id of json) {
      if (id.status === 'offer') {
         if (antiCall === "true" || antiCall === "decline") {
            let msg = await Gifted.sendMessage(id.from, {
               text: `${antiCallMsg}`,
               mentions: [id.from],
            });
            await Gifted.rejectCall(id.id, id.from);
         } else if (antiCall === "block") {
            let msg = await Gifted.sendMessage(id.from, {
               text: `${antiCallMsg}\nYou are Being Blocked due to Calling While Anticall Action Is *"Block"*!`,
               mentions: [id.from],
            });
            await Gifted.rejectCall(id.id, id.from); 
            await Gifted.updateBlockStatus(id.from, "block");
         }
      }
   }
};


const processMediaMessage = async (deletedMessage) => {
    let mediaType, mediaInfo;
    
    const mediaTypes = {
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        stickerMessage: 'sticker',
        documentMessage: 'document'
    };

    for (const [key, type] of Object.entries(mediaTypes)) {
        if (deletedMessage.message?.[key]) {
            mediaType = type;
            mediaInfo = deletedMessage.message[key];
            break;
        }
    }

    if (!mediaType || !mediaInfo) return null;

    try {
        const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
        
        const extensions = {
            image: 'jpg',
            video: 'mp4',
            audio: mediaInfo.mimetype?.includes('mpeg') ? 'mp3' : 'ogg',
            sticker: 'webp',
            document: mediaInfo.fileName?.split('.').pop() || 'bin'
        };
        
        const tempPath = path.join(__dirname, `./temp/temp_${Date.now()}.${extensions[mediaType]}`);
        await fs.ensureDir(path.dirname(tempPath));
        await pipeline(mediaStream, fs.createWriteStream(tempPath));
        
        return {
            path: tempPath,
            type: mediaType,
            caption: mediaInfo.caption || '',
            mimetype: mediaInfo.mimetype,
            fileName: mediaInfo.fileName || `${mediaType}_${Date.now()}.${extensions[mediaType]}`,
            ptt: mediaInfo.ptt
        };
    } catch (error) {
        logger.error(`Media processing failed:`, error);
        return null;
    }
};

const GiftedAntiDelete = async (Gifted, deletedMsg, key, deleter, sender, botOwnerJid, deleterPushName, senderPushName) => {
    const settings = await getAllSettings();
    const botName = settings.BOT_NAME || '𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃';
    const botPic = settings.BOT_PIC || '';
    const botFooter = settings.FOOTER || '';
    const antiDelete = settings.ANTIDELETE || 'indm';
    const timeZone = settings.TIME_ZONE || 'Africa/Nairobi';

    const context = await createContext(deleter, {
        title: "Anti-Delete",
        body: botName,
        thumbnail: botPic
    });
    
    const currentTime = formatTime(Date.now(), timeZone);
    const currentDate = formatDate(Date.now(), timeZone);

    const { getLidMapping, getGroupMetadata } = require('./connection/groupCache');

    const resolveLidToJidAndDisplay = async (lid, pushName, groupJid) => {
        if (!lid) return { jid: null, display: pushName || 'Unknown', number: null };
        
        let resolvedJid = lid;
        
        if (lid.endsWith('@lid')) {
            let jid = getLidMapping(lid);
            
            if (!jid && Gifted.getJidFromLid) {
                try {
                    jid = await Gifted.getJidFromLid(lid);
                } catch (e) {}
            }
            
            if (!jid && groupJid && isJidGroup(groupJid)) {
                try {
                    const groupMeta = await getGroupMetadata(Gifted, groupJid);
                    if (groupMeta?.participants) {
                        const participant = groupMeta.participants.find(p => p.lid === lid || p.id === lid);
                        if (participant) {
                            jid = participant.pn || participant.jid || participant.id;
                        }
                    }
                } catch (e) {}
            }
            
            if (jid && jid.endsWith('@s.whatsapp.net')) {
                resolvedJid = jid;
            }
        }
        
        if (resolvedJid.endsWith('@s.whatsapp.net')) {
            const number = resolvedJid.split('@')[0];
            return { 
                jid: resolvedJid, 
                display: `@${number}`,
                number: number
            };
        }
        
        return { jid: null, display: pushName || lid, number: null };
    };

    const isGroupChat = isJidGroup(key.remoteJid);
    const senderInfo = await resolveLidToJidAndDisplay(sender, senderPushName, key.remoteJid);
    const deleterInfo = await resolveLidToJidAndDisplay(deleter, deleterPushName, key.remoteJid);
    
    const finalSenderDisplay = senderInfo.display;
    const finalDeleterDisplay = deleterInfo.display;
    const senderJid = senderInfo.jid;
    const deleterJid = deleterInfo.jid;
    
    const mentions = [senderJid, deleterJid].filter(j => j !== null);

    let chatInfo;
    let chatMention = null;
    if (isJidGroup(key.remoteJid)) {
        try {
            const groupMeta = await getGroupMetadata(Gifted, key.remoteJid);
            chatInfo = `💬 Group Chat: ${groupMeta?.subject || 'Unknown'}`;
        } catch (error) {
            logger.error('Failed to fetch group metadata:', error);
            chatInfo = `💬 Group Chat`;
        }
    } else {
        chatInfo = `💬 Dm Chat: ${finalDeleterDisplay}`;
        if (deleterJid) chatMention = deleterJid;
    }
    
    const allMentions = chatMention ? [...mentions, chatMention] : mentions;
    
    const getContextInfo = (mentionedJids = []) => ({
        mentionedJid: mentionedJids.filter(j => j !== null)
    });

    try {
        const promises = [];
        
        if (antiDelete === 'inchat') {
            promises.push((async () => {
                try {
                    const baseAlert = `*𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝚂𝚈𝚂𝚃𝙴𝙼*\n\n` +
                                    `*👤 Sent By:* ${finalSenderDisplay}\n` +
                                    `*👤 Deleted By:* ${finalDeleterDisplay}\n` +
                                    `*🕑 Time:* ${currentTime}\n` + 
                                    `*📆 Date:* ${currentDate}\n` +
                                    `${chatInfo}\n\n> *${botFooter}*`;

                    if (deletedMsg.message?.conversation || deletedMsg.message?.extendedTextMessage?.text) {
                        const text = deletedMsg.message.conversation || 
                                    deletedMsg.message.extendedTextMessage.text;
                        
                        await Gifted.sendMessage(key.remoteJid, {
                            text: `${baseAlert}\n\n📝 *Content:* ${text}`,
                            mentions: allMentions,
                            contextInfo: getContextInfo(allMentions),
                            ...context
                        });
                    } else {
                        const media = await processMediaMessage(deletedMsg);
                        if (media) {
                            if (media.type === 'sticker' || media.type === 'audio') {
                                await Gifted.sendMessage(key.remoteJid, {
                                    [media.type]: { url: media.path },
                                    mentions: allMentions,
                                    contextInfo: getContextInfo(allMentions),
                                    ...context,
                                    ...(media.type === 'audio' ? {
                                        ptt: media.ptt,
                                        mimetype: media.mimetype
                                    } : {})
                                });
                                await Gifted.sendMessage(key.remoteJid, {
                                    text: media.caption ?
                                        `${baseAlert}\n\n📌 *Caption:* ${media.caption}` :
                                        baseAlert,
                                    mentions: allMentions,
                                    contextInfo: getContextInfo(allMentions),
                                    ...context
                                });
                            } else {
                                await Gifted.sendMessage(key.remoteJid, {
                                    [media.type]: { url: media.path },
                                    caption: media.caption ? 
                                        `${baseAlert}\n\n📌 *Caption:* ${media.caption}` : 
                                        baseAlert,
                                    mentions: allMentions,
                                    contextInfo: getContextInfo(allMentions),
                                    ...context,
                                    ...(media.type === 'document' ? {
                                        mimetype: media.mimetype,
                                        fileName: media.fileName
                                    } : {})
                                });
                            }

                            setTimeout(() => {
                                fs.unlink(media.path).catch(err => 
                                    logger.error('Media cleanup failed:', err)
                                );
                            }, 30000);
                        }
                    }
                } catch (error) {
                    logger.error('Failed to process in-chat ANTIDELETE:', error);
                }
            })());
        }

        if (antiDelete === 'indm') {
            promises.push((async () => {
                try {
                    const ownerContext = `*👤 Sent By:* ${finalSenderDisplay}\n*👤 Deleted By:* ${finalDeleterDisplay}\n${chatInfo}`;

                    if (deletedMsg.message?.conversation || deletedMsg.message?.extendedTextMessage?.text) {
                        const text = deletedMsg.message.conversation || 
                                    deletedMsg.message.extendedTextMessage.text;
                        
                        await Gifted.sendMessage(botOwnerJid, { 
                            text: `*𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝚂𝚈𝚂𝚃𝙴𝙼*\n\n*🕑 Time:* ${currentTime}\n*📆 Date:* ${currentDate}\n\n${ownerContext}\n\n*Deleted Msg:*\n${text}\n\n> *${botFooter}*`,
                            mentions: allMentions,
                            contextInfo: getContextInfo(allMentions),
                            ...context
                        });
                    } else {
                        const media = await processMediaMessage(deletedMsg);
                        if (media) {
                            const dmAlert = media.caption ?
                                `*𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝚂𝚈𝚂𝚃𝙴𝙼*\n\n*🕑 Time:* ${currentTime}\n*📆 Date:* ${currentDate}\n\n${ownerContext}\n\n*Caption:*\n${media.caption}\n\n> *${botFooter}*` :
                                `*𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙼𝙴𝚂𝚂𝙰𝙶𝙴 𝚂𝚈𝚂𝚃𝙴𝙼*\n\n*🕑 Time:* ${currentTime}\n*📆 Date:* ${currentDate}\n\n${ownerContext}\n\n> *${botFooter}*`;

                            if (media.type === 'sticker' || media.type === 'audio') {
                                await Gifted.sendMessage(botOwnerJid, {
                                    [media.type]: { url: media.path },
                                    mentions: allMentions,
                                    contextInfo: getContextInfo(allMentions),
                                    ...context,
                                    ...(media.type === 'audio' ? {
                                        ptt: media.ptt,
                                        mimetype: media.mimetype
                                    } : {})
                                });
                                await Gifted.sendMessage(botOwnerJid, {
                                    text: dmAlert,
                                    mentions: allMentions,
                                    contextInfo: getContextInfo(allMentions),
                                    ...context
                                });
                            } else {
                                await Gifted.sendMessage(botOwnerJid, {
                                    [media.type]: { url: media.path },
                                    caption: dmAlert,
                                    mentions: allMentions,
                                    contextInfo: getContextInfo(allMentions),
                                    ...context,
                                    ...(media.type === 'document' ? {
                                        mimetype: media.mimetype,
                                        fileName: media.fileName
                                    } : {})
                                });
                            }

                            setTimeout(() => {
                                fs.unlink(media.path).catch(err => 
                                    logger.error('Media cleanup failed:', err)
                                );
                            }, 30000);
                        }
                    }
                } catch (error) {
                    logger.error('Failed to forward ANTIDELETE to owner:', error);
                    await Gifted.sendMessage(botOwnerJid, {
                        text: `⚠️ Failed to forward deleted message from ${finalDeleterDisplay}\n\nError: ${error.message}`,
                        mentions: allMentions,
                        contextInfo: getContextInfo(allMentions),
                        ...context
                    });
                }
            })());
        }

        await Promise.all(promises);
    } catch (error) {
        logger.error('Anti-delete handling failed:', error);
    }
};

const GiftedAntiViewOnce = async (Gifted, message) => {
    try {
        if (!message?.message) return;
        if (message.key.fromMe) return;
        
        const msgContent = message.message;
        let viewOnceContent = null;
        let mediaType = null;
        
        if (msgContent.imageMessage?.viewOnce || msgContent.videoMessage?.viewOnce || msgContent.audioMessage?.viewOnce) {
            mediaType = Object.keys(msgContent).find(
                (key) => key.endsWith("Message") && ["image", "video", "audio"].some((t) => key.includes(t))
            );
            if (mediaType) {
                viewOnceContent = { [mediaType]: msgContent[mediaType] };
            }
        } else if (msgContent.viewOnceMessage) {
            viewOnceContent = msgContent.viewOnceMessage.message;
            mediaType = viewOnceContent ? Object.keys(viewOnceContent).find(
                (key) => key.endsWith("Message") && ["image", "video", "audio"].some((t) => key.includes(t))
            ) : null;
        } else if (msgContent.viewOnceMessageV2) {
            viewOnceContent = msgContent.viewOnceMessageV2.message;
            mediaType = viewOnceContent ? Object.keys(viewOnceContent).find(
                (key) => key.endsWith("Message") && ["image", "video", "audio"].some((t) => key.includes(t))
            ) : null;
        } else if (msgContent.viewOnceMessageV2Extension) {
            viewOnceContent = msgContent.viewOnceMessageV2Extension.message;
            mediaType = viewOnceContent ? Object.keys(viewOnceContent).find(
                (key) => key.endsWith("Message") && ["image", "video", "audio"].some((t) => key.includes(t))
            ) : null;
        }
        
        if (!viewOnceContent || !mediaType || !viewOnceContent[mediaType]) return;
        
        const settings = await getAllSettings();
        const antiViewOnce = settings.ANTIVIEWONCE || "indm";
        if (antiViewOnce === "off") return;
        
        const botJid = Gifted.user?.id?.split(":")[0] + "@s.whatsapp.net";
        const targetJid = antiViewOnce === "indm" ? botJid : message.key.remoteJid;
        const senderNum = (message.key.participant || message.key.remoteJid).split("@")[0].split(":")[0];
        const botName = settings.BOT_NAME || "GIFTED MD";
        
        const mediaMessage = {
            ...viewOnceContent[mediaType],
            viewOnce: false,
        };
        
        const path = require("path");
        const fs = require("fs").promises;
        const tempDir = path.join(__dirname, "temp");
        
        try {
            await fs.mkdir(tempDir, { recursive: true });
        } catch (e) {}
        
        const tempFileName = `vo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        let tempFilePath = null;
        
        try {
            tempFilePath = await Gifted.downloadAndSaveMediaMessage(mediaMessage, path.join(tempDir, tempFileName));
            
            const originalCaption = mediaMessage.caption || "";
            const caption = `👁️ *VIEW ONCE REVEALED*\n\n📤 *From:* @${senderNum}\n${originalCaption ? `📝 *Caption:* ${originalCaption}\n` : ""}\n> _Revealed by ${botName}_`;
            const mime = mediaMessage.mimetype || "";
            
            let sendContent;
            if (mediaType.includes("image")) {
                sendContent = { image: { url: tempFilePath }, caption, mimetype: mime, mentions: [`${senderNum}@s.whatsapp.net`] };
            } else if (mediaType.includes("video")) {
                sendContent = { video: { url: tempFilePath }, caption, mimetype: mime, mentions: [`${senderNum}@s.whatsapp.net`] };
            } else if (mediaType.includes("audio")) {
                sendContent = { audio: { url: tempFilePath }, ptt: true, mimetype: mime || "audio/mp4" };
            }
            
            if (sendContent) {
                await Gifted.sendMessage(targetJid, sendContent);
            }
        } catch (e) {
            console.error("Anti-ViewOnce download/send error:", e.message);
        } finally {
            if (tempFilePath) {
                try { await require("fs").promises.unlink(tempFilePath); } catch (e) {}
            }
        }
    } catch (error) {
        console.error("Anti-ViewOnce handler error:", error.message);
    }
};

const _extractEditContent = (msgObj) => {
    if (!msgObj || typeof msgObj !== 'object') return '';
    const type = Object.keys(msgObj)[0];
    if (!type) return '';
    const m = msgObj[type];
    if (type === 'conversation') return msgObj.conversation || '';
    if (type === 'extendedTextMessage') return m?.text || '';
    if (type === 'imageMessage') return `[Image]${m?.caption ? ' ' + m.caption : ''}`;
    if (type === 'videoMessage') return `[Video]${m?.caption ? ' ' + m.caption : ''}`;
    if (type === 'audioMessage') return '[Audio/Voice]';
    if (type === 'documentMessage') return `[Document] ${m?.fileName || m?.caption || ''}`.trim();
    if (type === 'stickerMessage') return '[Sticker]';
    if (type === 'editedMessage') {
        const inner = m?.message;
        return inner ? _extractEditContent(inner) : '';
    }
    return m?.text || m?.caption || `[${type}]`;
};

const _extractRawCaption = (msgObj) => {
    if (!msgObj || typeof msgObj !== 'object') return '';
    const type = Object.keys(msgObj)[0];
    if (!type) return '';
    const m = msgObj[type];
    if (type === 'conversation') return msgObj.conversation || '';
    if (type === 'extendedTextMessage') return m?.text || '';
    if (type === 'editedMessage') {
        const inner = m?.message;
        return inner ? _extractRawCaption(inner) : '';
    }
    return m?.caption || m?.text || '';
};

const _resolveLid = async (Gifted, lid) => {
    if (!lid?.endsWith('@lid')) return lid;
    const { getLidMapping } = require('./connection/groupCache');
    const cached = getLidMapping(lid);
    if (cached) return cached;
    try { const r = await Gifted.getJidFromLid(lid); if (r) return r; } catch (e) {}
    return lid;
};

const GiftedAntiEdit = async (Gifted, updateData, findOriginal) => {
    try {
        const settings = await getAllSettings();
        const antiEdit = settings.ANTI_EDIT || 'indm';
        if (antiEdit === 'false' || antiEdit === 'off') return;

        const { key, update } = updateData;
        if (!key || !update?.message) return;
        if (key.fromMe) return;
        if (key.remoteJid === 'status@broadcast') return;

        const rawChatJid = key.remoteJid;
        const msgId = key.id;

        const { getGroupMetadata } = require('./connection/groupCache');

        const resolvedChatJid = await _resolveLid(Gifted, rawChatJid);
        const isGroup = resolvedChatJid?.endsWith('@g.us') || rawChatJid?.endsWith('@g.us');

        const editedMsg = update.message;
        const newContent = _extractEditContent(editedMsg);
        if (!newContent) return;

        const MEDIA_TYPES = ['imageMessage', 'videoMessage', 'documentMessage'];

        let originalContent = 'N/A';
        let originalPushName = null;
        let originalMediaObj = null;
        let origMsgType = null;
        let origMsgData = null;
        let cachedSender = null;

        if (findOriginal) {
            const orig = findOriginal(rawChatJid, msgId);
            if (orig?.message) {
                origMsgType = Object.keys(orig.message)[0];
                origMsgData = orig.message[origMsgType];
                originalContent = _extractEditContent(orig.message) || 'N/A';
                if (MEDIA_TYPES.includes(origMsgType)) originalMediaObj = orig;
            }
            if (orig?.originalPushName) originalPushName = orig.originalPushName;
            if (orig?.originalSender && !orig.originalSender.endsWith('@lid')) {
                cachedSender = orig.originalSender;
            }
        }

        let sender = cachedSender
            || (key.participantPn && !key.participantPn.endsWith('@lid') ? key.participantPn : null)
            || key.participant
            || (isGroup ? null : resolvedChatJid);
        sender = await _resolveLid(Gifted, sender);
        const senderNum = sender && !sender.endsWith('@lid')
            ? sender.split('@')[0]
            : resolvedChatJid?.split('@')[0] || 'Unknown';

        const botFooter = settings.FOOTER || '';
        const timeZone = settings.TIME_ZONE || 'Africa/Nairobi';

        let chatLabel = isGroup ? resolvedChatJid : 'DM';
        if (isGroup) {
            try { const meta = await getGroupMetadata(Gifted, resolvedChatJid); chatLabel = meta?.subject || resolvedChatJid; } catch (e) {}
        }

        const currentTime = formatTime(Date.now(), timeZone);
        const currentDate = formatDate(Date.now(), timeZone);
        const mentions = sender && !sender.endsWith('@lid') ? [sender] : [];

        const origCaption = originalMediaObj ? (_extractRawCaption(originalMediaObj.message) || '(no caption)') : originalContent;
        const newCaption = _extractRawCaption(update.message) || newContent;

        const alertText = `*✏️ ANTI-EDIT MESSAGE SYSTEM*\n\n` +
            `*👤 Edited By:* @${senderNum}\n` +
            `*🕑 Time:* ${currentTime}\n` +
            `*📆 Date:* ${currentDate}\n` +
            `*💬 Chat:* ${chatLabel}\n\n` +
            `*📄 Original ${originalMediaObj ? 'Caption' : 'Message'}:* ${origCaption}\n` +
            `*📝 Edited To:* ${newCaption}\n\n` +
            `> *${botFooter}*`;

        const sendAlert = async (targetJid) => {
            if (!targetJid) return;
            if (originalMediaObj) {
                try {
                    const { downloadMediaMessage } = require('gifted-baileys');
                    const buffer = await downloadMediaMessage(originalMediaObj, 'buffer', {});
                    if (origMsgType === 'imageMessage') {
                        await Gifted.sendMessage(targetJid, { image: buffer, caption: alertText, mentions });
                    } else if (origMsgType === 'videoMessage') {
                        await Gifted.sendMessage(targetJid, { video: buffer, caption: alertText, mentions });
                    } else if (origMsgType === 'documentMessage') {
                        await Gifted.sendMessage(targetJid, {
                            document: buffer,
                            fileName: origMsgData?.fileName || 'document',
                            mimetype: origMsgData?.mimetype || 'application/octet-stream',
                            caption: alertText,
                            mentions,
                        });
                    } else {
                        await Gifted.sendMessage(targetJid, { text: alertText, mentions });
                    }
                    return;
                } catch (mediaErr) {
                    console.error('[ANTI-EDIT] media forward failed:', mediaErr.message);
                }
            }
            await Gifted.sendMessage(targetJid, { text: alertText, mentions });
        };

        const sendJid = resolvedChatJid && !resolvedChatJid.endsWith('@lid') ? resolvedChatJid : rawChatJid;
        const dmTarget = Gifted.user?.id ? `${Gifted.user.id.split(':')[0]}@s.whatsapp.net` : null;

        if (antiEdit === 'indm' || antiEdit === 'on') {
            if (dmTarget) { try { await sendAlert(dmTarget); } catch (e) {} }
        }
        if ((antiEdit === 'inchat' || antiEdit === 'on') && sendJid) {
            try { await sendAlert(sendJid); } catch (e) {}
        }
    } catch (err) {
        console.error('Anti-edit error:', err.message);
    }
};

module.exports = { logger, emojis, GiftedAutoReact, GiftedTechApi, GiftedApiKey, GiftedAntiLink, GiftedAntibad, GiftedAntiGroupMention, GiftedAutoBio, GiftedChatBot, GiftedAntiDelete, GiftedAnticall, GiftedPresence, GiftedAntiViewOnce, GiftedAntiEdit };
