'use strict';

const ACCESS_TOKEN = "EAAcfesqguzMBAFCT9Q6fmMi9exWMiYUocgnS6ZBYkWoTzmfW821jFUdJON5BT83wGzwv5xd3fNY7guZBqfe4ke9IX5vc7LvSol7ZBTkZAZAGVnm793XQhMsw7YZA9hfApgr0qzaHvtxsXK43VYrY7sEBrN4D8baczegLuVv3IIrZAnS49oZCv1rc"
const VERIFY_TOKEN = "PNCK@SKT"
const PAGE_ACCESS_TOKEN = "EAAcfesqguzMBAKIMZAPpHpj9NdLAezkqCG9g8zmwRhcWvudsEhtwZBO2cYlp56kia3BIzbZBu1N8WGOTVq5eXvJnXY9YZCXmvnVsdBmwAmrZACyYrpLzrr8ewrZCucKcrMWmmZCIr5C6nEvJJgLYIFdSruoqAnTLKuqZBQgzaZBHsHtf6usdwnlKs"
const SERVER_URL = "https://b2bdccfe46cb.ngrok.io/"
const webhook_time = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

const
    request = require('request'),
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()); // creates express http server


const FB = require('fb');
const line = require('@line/bot-sdk');
const login = require("facebook-comment-api");


const config = {
    "channelAccessToken": "3/+68WtmeyhDMGMHpeiFmyeL9SrVi6h48s2qC1zxrjl4JVfusqi1XO4XCjhnGs2Pet1jizGxtuMO0jGINVFyrffPCxUE1gsaEpeIsfqPMNEtuPbER6fIIXyKK5vGhMuA8pjG6R1f9DxgvofvjW2+CQdB04t89/1O/w1cDnyilFU=",
    "channelSecret": "ec622c36142635afdf1e91bfd0bdb643"
};
const client = new line.Client(config);



app.get('/', function (_req, res) {
    console.log('get!');
    res.status(200).send('EVENT_RECEIVED');
});

app.post('/webhook', (req, res) => {
    let body = req.body;
  
    if (body.object === 'page') {
        body.entry.forEach(entry => {
            if (entry.messaging) {
                let messagingEvent = entry.messaging[0];
                let sender_psid = messagingEvent.sender.id;
                console.log(`Sender PSID: ${sender_psid}`);
                if (messagingEvent.message) {
                    console.log("receivedMessage")
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    console.log("receivedDeliveryConfirmation")
                    receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    console.log("receivedPostback")
                    receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    console.log("receivedMessageRead")
                    receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    console.log("receivedAccountLink")
                    receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            } else if (entry.changes) {
                var pageID = entry.id;
                let changes = entry.changes[0];
                let values = changes.value;
                let field = changes.field;
                let item = changes.value.item;
                let post_id = changes.value.post_id;
                let post = changes.value.post;
                let w_value_verb = changes.value.verb;
                let w_value_reaction_type = changes.value.reaction_type;
                console.log(field, pageID, webhook_time);
                login({ access_token: "EAAcfesqguzMBAKIMZAPpHpj9NdLAezkqCG9g8zmwRhcWvudsEhtwZBO2cYlp56kia3BIzbZBu1N8WGOTVq5eXvJnXY9YZCXmvnVsdBmwAmrZACyYrpLzrr8ewrZCucKcrMWmmZCIr5C6nEvJJgLYIFdSruoqAnTLKuqZBQgzaZBHsHtf6usdwnlKs" }, (err, api) => {
                    if (err) return console.error(err);
            
                    api.listen((err, event) => {
            
                        api.sendComment({ body: entry.changes }, event.idReplyTo)
                        api.addFriend({ body: entry.changes }, event.idReplyTo)
                    });
                });
                //console.log(changes);
                if (field == "feed") {
                    if (item === "comment") {
                        processComments(entry.changes[0].value, entry.changes[0].value.message);
                    }
                    console.log("Changes")
                }
            } 
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

//let encode_message = encodeURIComponent(comment.message);
//let message_body = `Thank you for your question, to better assist you I am passing you to our support department. Click the link below to be transferred. https://m.me/acmeincsupport?ref=${encode_message}`;


function processComments(comment, messagetext) {
    let comment_id;
    if (comment.item == 'post') {
        comment_id = comment.post_id;
    } else if (comment.item == 'comment') {
        comment_id = comment.comment_id;
    }
    console.log("id_comment : " + comment_id);
    const login = require("facebook-comment-api");
  
    let ConLN = /หวย/g;
    let NUMLN = /^S\d/gi;
    if (messagetext.match(ConLN)) {
        var msg_text = 'ต้องการล็อตเตอรี่พิมพ์ (Sพิมพ์ใหญ่)Sตามด้วยเลขที่ต้องการค้นหาครับ';
        return postFBcomment(comment_id, msg_text);
    } else if (messagetext.match(NUMLN)) {
        HTcomment(comment_id, messagetext);
    }


}

function HTcomment(comment_id, msg_user) {
    FB.setAccessToken('EAAcfesqguzMBAF4uzrIdc79Lc8tLn0NGAX3CoNiZAQeBZBKYgpPRi2z7NMt6roI3Ka5JuP1uBP8ymoClHR224uvo3SqH3MdRKSEaZCbf7ytpiRsM2xIMVnIalmReLKg79YNOYLLQaPYptMzCdgHOvNr4GXRJKRQAh5h8wULs5xTtmJZBjmra');
    var usermsgnum = msg_user.split("S");
    var lengthNumber = usermsgnum[1].length;
    if (lengthNumber < 6) {
        FB.api('497783551468004/products?fields=id,retailer_id&limit=1000', function (res) {
            if (!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
            }
            res.data.forEach(function (product) {
                var retailer_id = product.retailer_id;
                let regex1 = new RegExp(usermsgnum[1]);
                let array1 = regex1.exec(retailer_id);
                if (array1 !== null) {
                    var idnum = array1.input;
                    var url = "https://www.facebook.com/commerce/products/" + product.id + "?ref=mini_shop_product_details&referral_code=mini_shop_page_card_cta";
                    var ReNum = idnum.replace(/1/gi, "1️⃣").replace(/2/gi, "2️⃣").replace(/3/gi, "3️⃣").replace(/4/gi, "4️⃣").replace(/5/gi, "5️⃣").replace(/6/gi, "6️⃣").replace(/7/gi, "7️⃣").replace(/8/gi, "8️⃣").replace(/9/gi, "9️⃣").replace(/0/gi, "0️⃣");
                    var text_msg = "🔎 ค้นหาพบเลข\n🥇 " + ReNum + " 🎉\nค้นหาจาก " + usermsgnum[1] + " | " + lengthNumber + " หลัก";
                    console.log(text_msg);
                    postFBcomment(comment_id, text_msg, idnum, url);
                }
            });
        });
    } else {
        var text_msg_er = "🔎 ผลการค้นหาเลข " + usermsgnum[1] + " จำนวน " + lengthNumber + " หลัก\n🔅 คุณ  หวยที่ไหน เขาเล่น 7 ตัวครับ ตลกป่ะ 555";
        const response = messenger.sendTextMessage({ id: senderId, text: text_msg_er, notificationType: 'REGULAR' })
    }
}


function postFBcomment(comment_id, msg_text, idnum, url) {
    FB.setAccessToken(PAGE_ACCESS_TOKEN);
    FB.api(comment_id + "/comments", 'post', { id: comment_id, message: msg_text + "\n" + url }, function (res) {
        if (!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        console.log('Post Id: ' + res.id);
    });
}

app.get('/webhook', (req, res) => {
    console.log(req);
    const verify_token = VERIFY_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === verify_token) {
            console.log('🚀𝗪𝗘𝗕𝗛𝗢𝗢𝗞_𝗩𝗘𝗥𝗜𝗙𝗜𝗘𝗗');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

function name(params) {
    const { createCanvas } = require("canvas");
    const { loadImage } = require('canvas')
    const myimg = loadImage('https://rayhaber.com/wp-content/uploads/2021/04/opel-manta-gse-elektromod-19-mayis-ayinda-resmen-tanitilacak.jpg')
    myimg.then(() => {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        const buffer = canvas.toBuffer("image/png");
        const fs = require("fs");
        loadImage("./NodeJS.png").then((image) => {
            context.drawImage(image, 425, 225);
            const buffer = canvas.toBuffer("image/png");
            fs.writeFileSync("./image.png", buffer);
        });

    }).catch(err => {
        console.log('oh no!', err)
    })
}

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    //console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
        // Just logging message echoes to console
        console.log("Received echo for message %s and app %d with metadata %s",
            messageId, appId, metadata);
        return;
    } else if (quickReply) {
        var quickReplyPayload = quickReply.payload;
        console.log("Quick reply for message %s with payload %s",
            messageId, quickReplyPayload);

        sendTextMessage(senderID, "Quick reply tapped");
        return;
    }

    if (messageText) {

        // If we receive a text message, check to see if it matches any special
        // keywords and send back the corresponding example. Otherwise, just echo
        // the text we received.

        switch (messageText) {
            case 'image':
                sendImageMessage(senderID);
                break;

            case 'gif':
                sendGifMessage(senderID);
                break;

            case 'audio':
                sendAudioMessage(senderID);
                break;

            case 'video':
                sendVideoMessage(senderID);
                break;

            case 'file':
                sendFileMessage(senderID);
                break;

            case 'button':
                sendButtonMessage(senderID);
                break;

            case 'generic':
                sendGenericMessage(senderID);
                break;

            case 'receipt':
                sendReceiptMessage(senderID);
                break;

            case 'quick reply':
                sendQuickReply(senderID);
                break;

            case 'read receipt':
                sendReadReceipt(senderID);
                break;

            case 'typing on':
                sendTypingOn(senderID);
                break;

            case 'typing off':
                sendTypingOff(senderID);
                break;

            case 'account linking':
                sendAccountLinking(senderID);
                break;

            default:
                let user_buy_vn = /^V\d{2}$|^v\d{2}$/gi;
                let user_buy_lao = /^L\d{2}$|^l\d{2}$/gi;
                let HTscan = /^S\d.+$/g;
                let HTBUY = /^HTBUY=\d{6}$/g;
                let ConVN = /^A@V\d{2}$/g;
                let ConLN = /^A@L\d{2}$/g;
                if (messageText.match(user_buy_vn)) {
                    let G_lotto = "Vietnam";
                    let lotto_number = recipientID + "_" + G_lotto;
                    const CheckNumRef = firebase.database().ref();
                    CheckNumRef.child("GOLD_LOTTO_CONF/" + lotto_number + "/").child(messageText).get().then((snapshot) => {
                        if (snapshot.exists()) {
                            let reply_msg_user = "❌ เลขนี้ ผู้ขาย 💸 รับเงินมาแล้วครับ"
                            sendTextMessage(senderID, reply_msg_user)
                        } else {
                            console.log("No data available");
                            console.log("buy lotto VN !!!!");
                            //lotto(senderID, recipientID, messageText, G_lotto);
                        }
                    }).catch((error) => {
                        console.error(error);
                    });

                } else if (messageText.match(user_buy_lao)) {
                    let G_lotto = "Vietnam";
                    let lotto_number = recipientID + "_" + G_lotto;
                    const CheckNumRef = firebase.database().ref();
                    CheckNumRef.child("GOLD_LOTTO_CONF/" + lotto_number + "/").child(messageText).get().then((snapshot) => {
                        if (snapshot.exists()) {
                            let reply_msg_user = "❌ เลขนี้ ผู้ขาย 💸 รับเงินมาแล้วครับ"
                            sendTextMessage(senderID, reply_msg_user)
                        } else {
                            console.log("No data available");
                            let G_lotto = "laos";
                            console.log("buy lotto Lao !!!!");
                            //lotto(senderID, recipientID, messageText, G_lotto);
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                } else if (messageText.match(HTscan)) {
                    console.log("HTscan !!!!");
                    resultsscanHTlottoo(senderID, messageText);
                } else if (messageText.match(HTBUY)) {
                    let HTNUMBBER = messageText.split("=");
                    console.log("HTBUY !!!!");
                    //BUYHTlottoo(senderID, HTNUMBBER[1]);
                } else if (messageText.match(ConVN)) {
                    let G_lotto = "Vietnam";
                    console.log("Confrim Vietnam !!!!");
                    //Conf(senderID, recipientID, messageText, G_lotto);
                } else if (messageText.match(ConLN)) {
                    let G_lotto = "laos";
                    console.log("Confrim laos !!!!");
                    //Conf(senderID, recipientID, messageText, G_lotto);
                } else {
                    sendTextMessage(event.sender.id, messageText);
                }
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;
    var sequenceNumber = delivery.seq;

    if (messageIDs) {
        messageIDs.forEach(function (messageID) {
            console.log("Received delivery confirmation for message ID: %s",
                messageID);
        });
    }

    console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback 
    // button for Structured Messages. 
    var payload = event.postback.payload;

    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to 
    // let them know it was successful
    sendTextMessage(senderID, "Postback called");
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    var watermark = event.read.watermark;
    var sequenceNumber = event.read.seq;

    console.log("Received message read event for watermark %d and sequence " +
        "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    var status = event.account_linking.status;
    var authCode = event.account_linking.authorization_code;

    console.log("Received account link event with for user %d with status %s " +
        "and auth code %s ", senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: SERVER_URL + "/assets/rift.png"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: SERVER_URL + "/assets/instagram_logo.gif"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "audio",
                payload: {
                    url: SERVER_URL + "/assets/sample.mp3"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "video",
                payload: {
                    url: SERVER_URL + "/assets/allofus480.mov"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "file",
                payload: {
                    url: SERVER_URL + "/assets/test.txt"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "This is test text",
                    buttons: [{
                        type: "web_url",
                        url: "https://www.oculus.com/en-us/rift/",
                        title: "Open Web URL"
                    }, {
                        type: "postback",
                        title: "Trigger Postback",
                        payload: "DEVELOPER_DEFINED_PAYLOAD"
                    }, {
                        type: "phone_number",
                        title: "Call Phone Number",
                        payload: "+16505551234"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "rift",
                        subtitle: "Next-generation virtual reality",
                        item_url: "https://www.oculus.com/en-us/rift/",
                        image_url: SERVER_URL + "/assets/rift.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/rift/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for first bubble",
                        }],
                    }, {
                        title: "touch",
                        subtitle: "Your Hands, Now in VR",
                        item_url: "https://www.oculus.com/en-us/touch/",
                        image_url: SERVER_URL + "/assets/touch.png",
                        buttons: [{
                            type: "web_url",
                            url: "https://www.oculus.com/en-us/touch/",
                            title: "Open Web URL"
                        }, {
                            type: "postback",
                            title: "Call Postback",
                            payload: "Payload for second bubble",
                        }]
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
    // Generate a random receipt ID as the API requires a unique ID
    var receiptId = "order" + Math.floor(Math.random() * 1000);

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "receipt",
                    recipient_name: "Peter Chang",
                    order_number: receiptId,
                    currency: "USD",
                    payment_method: "Visa 1234",
                    timestamp: "1428444852",
                    elements: [{
                        title: "Oculus Rift",
                        subtitle: "Includes: headset, sensor, remote",
                        quantity: 1,
                        price: 599.00,
                        currency: "USD",
                        image_url: SERVER_URL + "/assets/riftsq.png"
                    }, {
                        title: "Samsung Gear VR",
                        subtitle: "Frost White",
                        quantity: 1,
                        price: 99.99,
                        currency: "USD",
                        image_url: SERVER_URL + "/assets/gearvrsq.png"
                    }],
                    address: {
                        street_1: "1 Hacker Way",
                        street_2: "",
                        city: "Menlo Park",
                        postal_code: "94025",
                        state: "CA",
                        country: "US"
                    },
                    summary: {
                        subtotal: 698.99,
                        shipping_cost: 20.00,
                        total_tax: 57.67,
                        total_cost: 626.66
                    },
                    adjustments: [{
                        name: "New Customer Discount",
                        amount: -50
                    }, {
                        name: "$100 Off Coupon",
                        amount: -100
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "What's your favorite movie genre?",
            quick_replies: [
                {
                    "content_type": "text",
                    "title": "Action",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
                },
                {
                    "content_type": "text",
                    "title": "Comedy",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
                },
                {
                    "content_type": "text",
                    "title": "Drama",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
                }
            ]
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
    console.log("Sending a read receipt to mark message as seen");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "mark_seen"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
    console.log("Turning typing indicator on");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_on"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
    console.log("Turning typing indicator off");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_off"
    };

    callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome. Link your account.",
                    buttons: [{
                        type: "account_link",
                        url: SERVER_URL + "/authorize"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v11.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}

function resultsscanHTlottoo(senderId, msg_user) {
    FB.setAccessToken('EAAcfesqguzMBAF4uzrIdc79Lc8tLn0NGAX3CoNiZAQeBZBKYgpPRi2z7NMt6roI3Ka5JuP1uBP8ymoClHR224uvo3SqH3MdRKSEaZCbf7ytpiRsM2xIMVnIalmReLKg79YNOYLLQaPYptMzCdgHOvNr4GXRJKRQAh5h8wULs5xTtmJZBjmra');
    var usermsgnum = msg_user.split("S");
    var lengthNumber = usermsgnum[1].length;
    if (lengthNumber < 6) {
        FB.api('497783551468004/products?fields=id,retailer_id&limit=1000', function (res) {
            if (!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
            }
            res.data.forEach(function (product) {
                var retailer_id = product.retailer_id;
                let regex1 = new RegExp(usermsgnum[1]);
                let array1 = regex1.exec(retailer_id);
                if (array1 !== null) {
                    var idnum = array1.input;
                    var url = "https://www.facebook.com/commerce/products/" + product.id + "?ref=mini_shop_product_details&referral_code=mini_shop_page_card_cta";
                    var ReNum = idnum.replace(/1/gi, "1️⃣").replace(/2/gi, "2️⃣").replace(/3/gi, "3️⃣").replace(/4/gi, "4️⃣").replace(/5/gi, "5️⃣").replace(/6/gi, "6️⃣").replace(/7/gi, "7️⃣").replace(/8/gi, "8️⃣").replace(/9/gi, "9️⃣").replace(/0/gi, "0️⃣");
                    var text_msg = "🔎 ค้นหาพบเลข\n🥇 " + ReNum + " 🎉\nค้นหาจาก " + usermsgnum[1] + " | " + lengthNumber + " หลัก";
                    console.log(text_msg);
                    sendHT(senderId, text_msg, idnum, url);
                }
            });
        });
    } else {
        var text_msg_er = "🔎 ผลการค้นหาเลข " + usermsgnum[1] + " จำนวน " + lengthNumber + " หลัก\n🔅 คุณ  หวยที่ไหน เขาเล่น 7 ตัวครับ ตลกป่ะ 555";
        const response = messenger.sendTextMessage({ id: senderId, text: text_msg_er, notificationType: 'REGULAR' })
    }
}
function sendHT(recipientID, text_msg, idnum, Url) {
    var formData = {
        recipient: JSON.stringify({
            id: recipientID
        }),
        message: JSON.stringify({
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'button',
                    text: '' + text_msg,
                    buttons: [
                        {
                            type: 'web_url',
                            url: Url,
                            title: '✅ ใช่เลย! ' + idnum,
                        }
                    ]
                }
            }
        }),
    }
    CallSendAPI(true, formData);
}
function CallSendAPI(messageData, formData) {
    request({
        url: 'https://graph.facebook.com/v11.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData,
        formData: formData,
    }, function (error, response, body) {
        if (error) {
            console.log(error);
        } else if (response.body.error) {
            console.log(response.body.error);
        }
    })
}
// listen for requests :)
var listener = app.listen(process.env.PORT || 5000, function () {
    console.log('🚀 𝙎𝙚𝙧𝙫𝙚𝙧 𝙒𝙚𝙗𝙝𝙤𝙤𝙠 𝙎𝙩𝙖𝙧𝙩 ~~~~ ' + listener.address().port);
});