import {Bot, InlineKeyboard, InputFile} from './deps.deno.ts'

import {EmojiData, emojis} from './emojis.ts'

const API = "https://www.gstatic.com/android/keyboard/emojikitchen/";

const createURL = (emoji1: EmojiData, emoji2: EmojiData) => {
  const u1 = emoji1[0].map(c => "u" + c.toString(16)).join("-");
  const u2 = emoji2[0].map(c => "u" + c.toString(16)).join("-");
  return `${API}${emoji1[2]}/${u1}/${u1}_${u2}.png`;
};

export const bot = new Bot(Deno.env.get('TOKEN') || '')
bot.command('start', (ctx) => {
  return ctx.reply(`😊 I mix emojis using Google Emoji Kitchen API.
Use me via inline mode or send me a message.

The bot might not work on desktop clients, try it on mobile.

Inspired by https://tikolu.net/emojimix
Author: @Loskir (my channel: @Loskirs)
Source: https://github.com/Loskir/EmojiMixBot`, {
    parse_mode: 'HTML',
    reply_markup: new InlineKeyboard().switchInline('Try it out', '😳🤔'),
  })
})
bot.on('message:text', (ctx) => {
  const text = ctx.msg.text
  let foundEmojis: EmojiData[] = []
  for (const emojiData of emojis) {
    const match = text.match(new RegExp(String.fromCodePoint(...emojiData[0] as number[]), 'g'))
    if (match) {
      foundEmojis = [...foundEmojis, ...match.map(() => emojiData)]
    }
  }

  if (foundEmojis.length < 2) {
    return ctx.reply('Type two compatible emojis')
  }

  const emoji1 = foundEmojis[0]
  const emoji2 = foundEmojis[1]

  try {
    return ctx.replyWithPhoto(
      new InputFile({url: createURL(emoji1, emoji2)}),
      {reply_to_message_id: ctx.msg.message_id},
    )
  } catch (_error) {
    return ctx.replyWithPhoto(
      'Unable to process emojis :(\nTry using different ones',
      {reply_to_message_id: ctx.msg.message_id},
    )
  }
})
bot.on('inline_query', (ctx) => {
  const text = ctx.inlineQuery.query
  let foundEmojis: EmojiData[] = []
  for (const emojiData of emojis) {
    const match = text.match(new RegExp(String.fromCodePoint(...emojiData[0] as number[]), 'g'))
    if (match) {
      foundEmojis = [...foundEmojis, ...match.map(() => emojiData)]
    }
  }

  if (foundEmojis.length < 2) {
    return ctx.answerInlineQuery([], {switch_pm_text: 'Type two compatible emojis', switch_pm_parameter: 'help'})
  }

  const emoji1 = foundEmojis[0]
  const emoji2 = foundEmojis[1]

  try {
    return ctx.answerInlineQuery([{
      type: 'photo',
      id: emoji1[1] + '_' + emoji2[1],
      thumb_url: createURL(emoji1, emoji2),
      photo_url: createURL(emoji1, emoji2),
    }, ])
  } catch (_error) {
    return ctx.answerInlineQuery([], {switch_pm_text: 'Unable to process emojis :(', switch_pm_parameter: 'error'})
  }
})

bot.catch(console.error)
