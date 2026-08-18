import asyncio
import logging
import os

from aiogram.client.session.aiohttp import AiohttpSession
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

# --- Настройки ---
# Токен получаем у @BotFather в Telegram (команда /newbot)
BOT_TOKEN = os.getenv("BOT_TOKEN", "")

# HTTPS-адрес твоего задеплоенного webapp
WEBAPP_URL = os.getenv("WEBAPP_URL", "")
PROXY_URL = os.getenv("PROXY_URL", "")

logging.basicConfig(level=logging.INFO)

session = AiohttpSession(proxy=PROXY_URL)

bot = Bot(token=BOT_TOKEN, session=session)
dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🧮 Открыть калькулятор",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )
    await message.answer(
        "Привет! Это твой первый Mini App.\n"
        "Нажми на кнопку ниже, чтобы открыть калькулятор.",
        reply_markup=keyboard,
    )


async def main() -> None:
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())