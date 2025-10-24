NEEDED
```
setup send message function 
WAHA_API/api/sendText
{
  "chatId": "33780835115@c.us",
  "reply_to": null,
  "text": "Hi there!",
  "linkPreview": true,
  "linkPreviewHighQuality": false,
  "session": process.env.SESSION_NAME
}

Response 

{
  "_data": {
    "id": {
      "fromMe": true,
      "remote": "237620124019@c.us",
      "id": "3EB02B7F3ADEB1A8F8E4A1",
      "self": "out",
      "_serialized": "true_237620124019@c.us_3EB02B7F3ADEB1A8F8E4A1_out"
    },
    "viewed": false,
    "body": "His there!",
    "type": "chat",
    "t": 1760022498,
    "from": {
      "server": "c.us",
      "user": "237620124019",
      "_serialized": "237620124019@c.us"
    },
    "to": {
      "server": "c.us",
      "user": "237620124019",
      "_serialized": "237620124019@c.us"
    },
    "ack": 0,
    "isNewMsg": true,
    "star": false,
    "kicNotified": false,
    "isFromTemplate": false,
    "pollInvalidated": false,
    "isSentCagPollCreation": false,
    "latestEditMsgKey": null,
    "latestEditSenderTimestampMs": null,
    "mentionedJidList": [],
    "groupMentions": [],
    "isEventCanceled": false,
    "eventInvalidated": false,
    "isVcardOverMmsDocument": false,
    "isForwarded": false,
    "isQuestion": false,
    "questionReplyQuotedMessage": null,
    "questionResponsesCount": 0,
    "readQuestionResponsesCount": 0,
    "hasReaction": false,
    "disappearingModeInitiator": "chat",
    "disappearingModeTrigger": "chat_settings",
    "productHeaderImageRejected": false,
    "lastPlaybackProgress": 0,
    "isDynamicReplyButtonsMsg": false,
    "isCarouselCard": false,
    "parentMsgId": null,
    "callSilenceReason": null,
    "isVideoCall": false,
    "callDuration": null,
    "callCreator": null,
    "callParticipants": null,
    "isCallLink": null,
    "callLinkToken": null,
    "isMdHistoryMsg": false,
    "stickerSentTs": 0,
    "isAvatar": false,
    "lastUpdateFromServerTs": 0,
    "invokedBotWid": null,
    "bizBotType": null,
    "botResponseTargetId": null,
    "botPluginType": null,
    "botPluginReferenceIndex": null,
    "botPluginSearchProvider": null,
    "botPluginSearchUrl": null,
    "botPluginSearchQuery": null,
    "botPluginMaybeParent": false,
    "botReelPluginThumbnailCdnUrl": null,
    "botMessageDisclaimerText": null,
    "botMsgBodyType": null,
    "requiresDirectConnection": false,
    "bizContentPlaceholderType": null,
    "hostedBizEncStateMismatch": false,
    "senderOrRecipientAccountTypeHosted": false,
    "placeholderCreatedWhenAccountIsHosted": false,
    "galaxyFlowDisabled": false,
    "groupHistoryBundleMessageKey": null,
    "groupHistoryBundleMetadata": null,
    "links": []
  },
  "id": {
    "fromMe": true,
    "remote": "237620124019@c.us",
    "id": "3EB02B7F3ADEB1A8F8E4A1",
    "self": "out",
    "_serialized": "true_237620124019@c.us_3EB02B7F3ADEB1A8F8E4A1_out"
  },
  "ack": 0,
  "hasMedia": false,
  "body": "His there!",
  "type": "chat",
  "timestamp": 1760022498,
  "from": "237620124019@c.us",
  "to": "237620124019@c.us",
  "deviceType": "android",
  "isForwarded": false,
  "forwardingScore": 0,
  "isStatus": false,
  "isStarred": false,
  "fromMe": true,
  "hasQuotedMsg": false,
  "hasReaction": false,
  "vCards": [],
  "mentionedIds": [],
  "groupMentions": [],
  "isGif": false,
  "links": []
}
save this in db 
```
  "id": {
    "fromMe": true,
    "remote": "237620124019@c.us",
    "id": "3EB02B7F3ADEB1A8F8E4A1",=
    "self": "out",
    "_serialized": "true_237620124019@c.us_3EB02B7F3ADEB1A8F8E4A1_out"
  },
  ```
  with message     "body": "His there!",


setup reply to ENDPOINT

POST PROCESS.ENV.WAHA_API/api/sendText
{
  "chatId": "237620124019@c.us",
  "reply_to": "true_237620124019@c.us_3EB00C423C36CAB0B43CEA_out", // _serialized key of message you want to reply 
  "text": "Hi there!",
  "linkPreview": true,
  "linkPreviewHighQuality": false,
  "session": "default"
}


setup sendMessagesToGroup follow references
setup get all groups

/api/process.env.SESSION_NAME/groups
Get all groups.
```

REFERENCES :
```
📤 Send messages
We assume that you’ve already run the Docker container and authenticated the session with a QR code.

If you haven’t yet - please follow the steps from ⚡ Quick Start.

WhatsApp Messages
Features
Here’s the list of features that are available by 🏭 Engines:

📤 Messages - API
Fields
There are common fields that you can find in almost all requests:


{
  "session": "default",
  "chatId": "12132132130@c.us",
  "file": "..."
}
session
session - a session name from which account you’re sending the message. We use default in the examples.

Core version supports only default session.
Plus allows you to run multiple sessions inside one container to save your memory and CPU resources!
Read more about multiple sessions →

chatId
chatId - this is a phone number or Group identifier where you’re sending the message.

123123123@c.us - user accounts - international phone number without + at the start and add @c.us at the end. For phone number 12132132131 the chatId is 12132132131@c.us
123123123@s.whatsapp.net can also appear in internal _data field for GOWS, NOWEB. Convert it to @c.us to work with that properly. Kindly don’t use it in chatId when sending messages
123123123@lid - is a hidden user ID, each user has a regular ID along with a hidden one. WhatsApp added that type of ID along with community functionality.
12312312123133@g.us - for 👥 Groups
12312312123133@newsletter - for 📢 Channels
status@broadcast - for 🟢 Status
👉 To get the actual chatId for 🇧🇷 Brazilian phone number - use chatId field from Check phone number exists response.

Read more about error sending text to half of Brazilian numbers (every number registered before 2012) ->

file
When sending media (images, voice, files) you can either use:

file.data field with base64 encoded file
file.url field with public available URL for that file
See the list of engines that support the feature ->.

reply_to
You can add the reply_to field in order to reply to a specific message.


{
  "chatId": "11111111111@c.us",
  ...
  "reply_to": "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA"
}
reply_to is available in all messages

Send Seen
If you get a new message via 🔄 Events and want to reply to that message, you need to first send that you’ve seen the message (double green tick) - read ⚠️ How to Avoid Blocking

Read all unread messages in the chat

Check 💬 Chats - Read messages API to read messages without providing message id.


POST /api/sendSeen
Send seen (read a message) for all unread messages older than 7 days (30 max for DM, 100 max for groups)

Body

{
  "session": "default",
  "chatId": "11111111111@c.us"
}
In NOWEB and GOWS 🏭 Engines you can control what messages to read by using messagesIds (or deprecated messageId) field:

Send seen for direct message:

Body

{
  "session": "default",
  "chatId": "11111111111@c.us",
  "messageIds": [
    "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA"
  ]
}
Send seen for Group Message you need to provide participant field:

Body

{
  "session": "default",
  "chatId": "11111111111@g.us",
  "messageIds": [
    "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA_33333333333@c.us"
  ],
  "participant": "33333333333@c.us"
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendSeen' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us"
}'
Send Text
Use the API to send text messages to the chat.


POST /api/sendText
Body

{
  "session": "default",
  "chatId": "12132132130@c.us",
  "text": "Hi there!"
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendText' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "text": "Hi there!"
}'
Here’s some additional options:

reply_to: false_1111@c.us_AAA - to reply on a message
mentions - to mention a contact in a group
linkPreview: false - to disable preview generation for links in the message
Link preview

POST /api/sendText
Body

{
  "session": "default",
  "chatId": "12132132130@c.us",
  "text": "Hi there!",
  "linkPreview": true,
  "linkPreviewHighQuality": true
}
If the text has a link - it generates a preview for that link. You adjust the behavior by setting

linkPreview: true - to enable link preview
linkPreviewHighQuality: true - to enable high-quality link preview (requires additional upload to WA servers)
🖼️ Link Preview Screenshot
Custom Link Preview

If link preview generation process fails or site protects it with captcha - you can generate your own preview and Send Custom Link Preview

Reply on message
To reply on a message - add reply_to field:

Body

{
  "session": "default",
  "chatId": "11111111111@c.us",
  "reply_to": "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA",
  "text": "Reply text"
}
Mention contact
If you send a message in a group and want to mention a participant in the message - use mentions field for that in POST /api/sendText request.

Please note that you MUST mention a number in the text as well in the format @2132132130 and also mention it in mentions in format 2132132130@c.us

Body

{
  "session": "default",
  "chatId": "12132132130@c.us",
  "text": "Hi there! @2132132130",
  "mentions": [
    "2132132130@c.us"
  ]
}
Send Image
Use API to send images to the chat.


POST /api/sendImage
You can send images in two ways:

Provide a URL for the image.
Encode the whole file content into BASE64 and send it in the request body.
URL
BASE64
Body

{
  "session": "default",
  "chatId": "11111111111@c.us",
  "file": {
    "mimetype": "image/jpeg",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/dev.likeapro.jpg",
    "filename": "filename.jpeg"
  },
  "caption": "string"
}
Image File Format

WhatsApp works best when images are sent in JPEG format.

There is no convert flag for images in WAHA (unlike Voice/Video). You must convert to JPEG before sending.
In your request, set file.mimetype to image/jpeg and use a .jpg/.jpeg filename.
Convert with ffmpeg:


# Convert PNG/WebP/etc. to JPEG
ffmpeg -i input.png -q:v 2 output.jpg
Tip: If the source image has transparency (alpha), JPEG will drop it. Consider adding a background before converting (e.g., in your image editor) if needed.

Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendImage' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "file": {
    "mimetype": "image/jpeg",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/dev.likeapro.jpg",
    "filename": "filename.jpeg"
  },
  "caption": "Check out this image!"
}'
Send Voice
Use API to send voice messages to the chat.


POST /api/sendVoice
You can send voice messages in two ways:

Provide a URL for the voice.
Encode the whole file content into BASE64 and send it in the request body.
URL
BASE64
Body

{
  "session": "default",
  "chatId": "11111111111@c.us",
  "file": {
    "mimetype": "audio/ogg; codecs=opus",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/dev.likeapro.opus"
  },
  "convert": false
}
Fields:

file - provide one of the fields:
url - URL to the file
data - Base 64 encoded binary content of the file
convert: false - convert the file to the right format. Default: false
Set convert: true if you don’t have the right format, check the format note below.
Voice File Format

WhatsApp accept only file with OPUS encoding and packed in OGG container.

If you have a file in a different format (like mp3) you can use one of the options:

Set convert: true in the body when calling API:
Body

{
  ...,
  "convert": true
}
Convert file before sending by calling 🖼️ Media - Convert Voice

Run ffmpeg:


ffmpeg -i input.mp3 -c:a libopus -b:a 32k -ar 48000 -ac 1 output.opus
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendVoice' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "file": {
    "mimetype": "audio/ogg; codecs=opus",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/dev.likeapro.opus"
  },
  "convert": false
}'
Media - Convert Voice

POST /api/{SESSION}/media/convert/voice
WhatsApp supports only the special format for voice (audio) messages.

You can convert any file to the right format using this API if you need to send voice to many chats (so it doesn’t get converted every time with convert: true flag in /api/sendVoice)

URL
BASE64
Body

{
  "url": "https://github.com/devlikeapro/waha/raw/core/examples/voice.mp3"
}
Response depends on your Accept HTTP header you’re using in request:

Accept: application/json (Request)

curl -X 'POST' \
  'http://localhost:3000/api/default/media/convert/voice' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "url": "https://github.com/devlikeapro/waha/raw/core/examples/voice.mp3",
  "data": null
}'
Accept: application/json (Response)

{
  "mimetype": "audio/ogg; codecs=opus",
  "data": "base64-encoded-content-here"
}
Accept: audio/ogg; codecs=opus (Request)

curl -X POST \
  'http://localhost:3000/api/default/media/convert/voice' \
  -H 'Accept: audio/ogg; codecs=opus' \
  -H 'Content-Type: application/json' \
  -d '{
  "url": "https://github.com/devlikeapro/waha/raw/core/examples/voice.mp3",
  "data": null
}' \
  --output output.ogg
Accept: audio/ogg; codecs=opus (Response)

# Check file after curl above.
open output.ogg
Send Video

POST /api/sendVideo
Use API to send a video to a chat.

You can send video messages in two ways:

Provide a URL for the file and the API will download and send it in the request body.
Provide the file as a BASE64 string in the request body.
URL
BASE64
Body

{
  "session": "default",
  "chatId": "11111111111@c.us",
  "caption": "Watch this video!",
  "asNote": false,
  // aka video note, rounded video
  "file": {
    "mimetype": "video/mp4",
    "filename": "video.mp4",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/video.mp4"
  },
  "convert": false
}
Fields:

file - provide one of the fields:
url - URL to the file
data - Base 64 encoded binary content of the file
convert: false - convert the file to the right format. Default: false
Set convert: true if you don’t have the right format, check the format note below.
Video File Format

WhatsApp accepts only a file in mp4 using libx264 format.

If you have a file in a different format (like avi) you can use one of the options:

Set convert: true in the body when calling API:
Body

{
  ...,
  "convert": true
}
Convert file before sending by calling 🖼️ Media - Convert Video

Run ffmpeg:


ffmpeg -i input_video.mp4 -c:v libx264 -map 0 -movflags +faststart output_video.mp4
-map 0 -movflags +faststart options required for thumbnail generation.

WEBJS - use :chrome image

If you’re using WEBJS (default engine) - make sure to use devlikeapro/waha-plus:chrome docker image.

Read more about Docker images and engines →.

Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendVideo' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "caption": "Watch this video!",
  "asNote": false,
  "file": {
    "mimetype": "video/mp4",
    "filename": "video.mp4",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/video.mp4"
  },
  "convert": false
}'
Media - Convert Video

POST /api/{SESSION}/media/convert/video
WhatsApp supports only the special format for video messages.

You can convert any file to the right format using this API if you need to send video to many chats (so it doesn’t get converted every time with convert: true flag in /api/sendVideo)

URL
BASE64
Body

{
  "url": "https://github.com/devlikeapro/waha/raw/core/examples/video.avi"
}
Response depends on your Accept HTTP header you’re using in request:

Accept: application/json (Request)

curl -X 'POST' \
  'http://localhost:3000/api/default/media/convert/video' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "url": "https://github.com/devlikeapro/waha/raw/core/examples/video.avi",
  "data": null
}'
Accept: application/json (Response)

{
  "mimetype": "video/mp4",
  "data": "base64-encoded-content-here"
}
Accept: video/mp4 (Request)

curl -X POST \
  'http://localhost:3000/api/default/media/convert/video' \
  -H 'Accept: video/mp4' \
  -H 'Content-Type: application/json' \
  -d '{
  "url": "https://github.com/devlikeapro/waha/raw/core/examples/video.avi",
  "data": null
}' \
  --output output.mp4
Accept: video/mp4 (Response)

# Check file after curl above.
open output.mp4
Send File
Use API to send a file (as a document/attachment) to a chat.


POST /api/sendFile
You can send files in two ways:

Provide a URL for the file.
Encode the whole file content into BASE64 and send it in the request body.
URL
BASE64
Body

{
  "session": "default",
  "caption": "Check this out!",
  "chatId": "11111111111@c.us",
  "file": {
    "mimetype": "image/jpeg",
    "filename": "filename.jpeg",
    "url": "https://raw.githubusercontent.com/devlikeapro/waha/core/examples/video.mp4"
  }
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendFile' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "caption": "Check this out!",
  "file": {
    "mimetype": "application/pdf",
    "filename": "document.pdf",
    "url": "https://raw.githubusercontent.com/devlikeapro/waha/core/examples/document.pdf"
  }
}'
Send Poll
We have a dedicated page about 📶 Polls!

alt


POST /api/sendPoll
The request body is pretty simple:

Body

{
  "session": "default",
  "chatId": "123123123@c.us",
  "poll": {
    "name": "How are you?",
    "options": [
      "Awesome!",
      "Good!",
      "Not bad!"
    ],
    "multipleAnswers": false
  }
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendPoll' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "poll": {
    "name": "How are you?",
    "options": [
      "Awesome!",
      "Good!",
      "Not bad!"
    ],
    "multipleAnswers": false
  }
}'
Send Poll Vote
We have a dedicated page about 📶 Polls!


POST /api/sendPollVote
Send List
List Messages May Stop Working Anytime

List Messages are fragile creatures and may stop working at any time.

We recommend adding fallback logic using Send Text or 📶 Polls.

Only Direct Message Chats

List Messages can only be sent to direct chats (1:1).

The chatId must be one of the following formats: phone, phone@c.us, {number}@lid.

WhatsApp List Message

Send a list message using API:


POST /api/sendList
Body

{
  "session": "default",
  "chatId": "11111111111@c.us",
  "reply_to": null,
  "message": {
    "title": "Simple Menu",
    "description": "Please choose an option",
    "footer": "Thank you!",
    "button": "Choose",
    "sections": [
      {
        "title": "Main",
        "rows": [
          {
            "title": "Option 1",
            "rowId": "option1",
            "description": null
          },
          {
            "title": "Option 2",
            "rowId": "option2",
            "description": null
          },
          {
            "title": "Option 3",
            "rowId": "option3",
            "description": null
          }
        ]
      }
    ]
  }
}
Send Event
You can send Event Message using API


POST /api/{SESSION}/events
👉 Read more about how to send 📅 Event Message and receive responses.

Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/default/events' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "chatId": "12132132130@c.us",
  "event": {
    "title": "Team Meeting",
    "description": "Monthly team sync-up",
    "location": "Conference Room A",
    "startTime": "2023-12-15T10:00:00Z",
    "endTime": "2023-12-15T11:00:00Z"
  }
}'
WhatsApp Event Message
Send Link Custom Preview
Available in ➕ WAHA Plus version.

Using /api/sendText you can send auto-generated link previews.

If you want to send a custom link preview in case of any errors or captcha during the link preview generation (like for Amazon: #596 , #880 ), you can use the following API.


POST /api/send/link-custom-preview
URL
BASE64
Body

{
  "session": "default",
  "chatId": "11111111111@c.us",
  "text": "Check this out! https://github.com/",
  "linkPreviewHighQuality": true,
  "preview": {
    "url": "https://github.com/",
    "title": "Your Title",
    "description": "Check this out, this is a custom link preview!",
    "image": {
      "url": "https://github.com/devlikeapro/waha/raw/core/examples/waha.jpg"
    }
  }
}
🖼️ Link Preview Screenshot
Fields:

text - must contain preview.url somewhere in the text
preview.url - must be a valid URL
preview.title - title of the link preview
preview.description - description of the link preview
preview.image - one of:
preview.image.url - URL of the image to be used in the link preview
preview.image.data - base64 encoded image data to be used in the link preview
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/send/link-custom-preview' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "text": "Check this out! https://github.com/",
  "linkPreviewHighQuality": true,
  "preview": {
    "url": "https://github.com/",
    "title": "Your Title",
    "description": "Check this out, this is a custom link preview!",
    "image": {
      "url": "https://github.com/devlikeapro/waha/raw/core/examples/waha.jpg"
    }
  }
}'
Forward Message
You can forward a message to another chat (that you chatted before, otherwise it may fail):


POST /api/forwardMessage
Body

{
  "chatId": "11111111111@c.us",
  "messageId": "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA",
  "session": "default"
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/forwardMessage' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "messageId": "false_12132132130@c.us_AAAAAAAAAAAAAAAAAAAA"
}'
Edit message
You can edit text messages or “caption” in media messages.


PUT /api/{session}/chats/{chatId}/messages/{messageId}
👉 Remember to escape @ in chatId and messageId with %40.

So if you want to edit true_123@c.us_AAA message in 123@c.us chat you need to send request to:


PUT /api/{session}/chats/123%40c.us/messages/true_123%40c.us_AAA
Body

{
  "text": "Hello, world!",
  "linkPreview": true
}
linkPreview: false - to disable preview generation for links in the message
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'PUT' \
  'http://localhost:3000/api/default/chats/12132132130%40c.us/messages/true_12132132130%40c.us_AAAAAAAAAAAAAAAAAAAA' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "text": "Hello, world! (edited)",
  "linkPreview": true
}'
Delete message
You can delete messages from the chat.


DELETE /api/{session}/chats/{chatId}/messages/{messageId}
👉 Remember to escape @ in chatId and messageId with %40.

So if you want to delete true_123@c.us_AAA message in 123@c.us chat you need to send request to:


DELETE /api/{session}/chats/123%40c.us/messages/true_123%40c.us_AAA
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'DELETE' \
  'http://localhost:3000/api/default/chats/12132132130%40c.us/messages/true_12132132130%40c.us_AAAAAAAAAAAAAAAAAAAA' \
  -H 'accept: application/json' \
  -H 'X-Api-Key: yoursecretkey'
Add a reaction
Use API to add a reaction to a message.


PUT /api/reaction
Use PUT method

Reaction API uses PUT, not POST request! Please make sure you send right request.

Body

{
  "messageId": "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA",
  "reaction": "👍",
  "session": "default"
}
To remove reaction from a message - send empty string in the reaction request:

Body

{
  "messageId": "false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA",
  "reaction": "",
  "session": "default"
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'PUT' \
  'http://localhost:3000/api/reaction' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "messageId": "false_12132132130@c.us_AAAAAAAAAAAAAAAAAAAA",
  "reaction": "👍"
}'
Star and unstar message
Use API to star or unstar a message.


PUT /api/star
Use PUT method

Star API uses PUT, not POST request! Please make sure you send right request.

Star:

Body

{
  "messageId": "false_71111111111@c.us_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "chatId": "71111111111@c.us",
  "star": true,
  "session": "default"
}
Unstar:

Body

{
  "messageId": "false_71111111111@c.us_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "chatId": "71111111111@c.us",
  "star": false,
  "session": "default"
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'PUT' \
  'http://localhost:3000/api/star' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "messageId": "false_12132132130@c.us_AAAAAAAAAAAAAAAAAAAA",
  "chatId": "12132132130@c.us",
  "star": true
}'
Send contact (vcard)
Use the API to send contact (vcard)


POST /api/sendContactVcard
You can send contacts in multiple ways:

Fields
vCard
Combined
Body

{
  "session": "default",
  "chatId": "79111111@c.us",
  "contacts": [
    {
      "fullName": "John Doe",
      "organization": "Company Name",
      "phoneNumber": "+91 11111 11111",
      "whatsappId": "911111111111"
    }
  ]
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendContactVcard' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "contacts": [
    {
      "fullName": "John Doe",
      "organization": "Company Name",
      "phoneNumber": "+91 11111 11111",
      "whatsappId": "911111111111"
    }
  ]
}'
Send location

POST /api/sendLocation

{
  "chatId": "11111111111@c.us",
  "latitude": 38.8937255,
  "longitude": -77.0969763,
  "title": "Our office",
  "session": "default"
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendLocation' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "latitude": 38.8937255,
  "longitude": -77.0969763,
  "title": "Our office"
}'
Send Status (aka stories)
You can send statuses (aka stories)!

Check out 🟢 Status page.

Send messages to Channels
You can send messages to channels!

Check out 📢 Channels page.

Send Buttons Reply
If you’re using Official Business API to send buttons and wanna “click” on the buttons (for testing or other purposes) you can do it using the API


POST /api/send/buttons/reply
Body

{
  "chatId": "11111111111@c.us",
  "replyTo": "false_11111111111@c.us_AAAAAAAAAAAAAAAAA",
  "selectedDisplayText": "No",
  "selectedButtonID": "button:id",
  "session": "default"
}
Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/send/buttons/reply' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "replyTo": "false_12132132130@c.us_AAAAAAAAAAAAAAAAA",
  "selectedDisplayText": "No",
  "selectedButtonID": "button:id"
}'
How to get fields for the Body
Send Buttons
DEPRECATED - Buttons do not work at the moment!

Buttons are fragile creatures and may not work as expected.

We recommend adding fallback logic using Send Text or 📶 Polls.

alt

You can send interactive message (aka buttons) using


POST /api/sendButtons

{
  "chatId": "11111111111@c.us",
  "header": "How are you?",
  "headerImage": {
    "mimetype": "image/jpeg",
    "filename": "filename.jpg",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/waha.jpg"
  },
  "body": "Tell us how are you please 🙏",
  "footer": "If you have any questions, please send it in the chat",
  "buttons": [
    {
      "type": "reply",
      "text": "I am good!"
    },
    {
      "type": "call",
      "text": "Call us",
      "phoneNumber": "+1234567890"
    },
    {
      "type": "copy",
      "text": "Copy code",
      "copyCode": "4321"
    },
    {
      "type": "url",
      "text": "How did you do that?",
      "url": "https://waha.devlike.pro"
    }
  ],
  "session": "default"
}
👉 headerImage is available only in ➕ WAHA Plus

Here’s how you can call it from various languages:

cURL
Python
JavaScript
PHP

curl -X 'POST' \
  'http://localhost:3000/api/sendButtons' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Api-Key: yoursecretkey' \
  -d '{
  "session": "default",
  "chatId": "12132132130@c.us",
  "header": "How are you?",
  "headerImage": {
    "mimetype": "image/jpeg",
    "filename": "filename.jpg",
    "url": "https://github.com/devlikeapro/waha/raw/core/examples/waha.jpg"
  },
  "body": "Tell us how are you please 🙏",
  "footer": "If you have any questions, please send it in the chat",
  "buttons": [
    {
      "type": "reply",
      "text": "I am good!"
    },
    {
      "type": "call",
      "text": "Call us",
      "phoneNumber": "+1234567890"
    },
    {
      "type": "copy",
      "text": "Copy code",
      "copyCode": "4321"
    },
    {
      "type": "url",
      "text": "How did you do that?",
      "url": "https://waha.devlike.pro"
    }
  ]
}'
Here’s available buttons you can use in buttons:

Quick Reply
URL
Call
Copy

{
  // Optional id
  // "id": "123",
  "type": "reply",
  "text": "I am good!"
}
  ```