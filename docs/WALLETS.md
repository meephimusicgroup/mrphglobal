# MRPH Global — кошельки (self-custody)

## Самостоятельное хранение seed-фразы

**Рекомендуемый путь:** Keplr, Leap, Tangem или другой Cosmos-кошелёк — мнемоника **только у вас**.

### Telegram-бот

| Команда | Описание |
|---|---|
| `/createwallet` | Создаёт кошелёк и **один раз** показывает 24 слова — запишите оффлайн |
| `/export` | Повторный экспорт seed (только в личные сообщения, с подтверждением) |
| `/import <слова>` | Импорт существующей мнемоники (12/24 слова) |

> ⚠️ Никому не отправляйте seed-фразу. MRPH Global team **никогда** не просит её в чате.

---

## Keplr / Leap (Cosmos)

1. Установите [Keplr](https://www.keplr.app/) или [Leap](https://www.leapwallet.io/)
2. **Add chain manually** / Custom network:

| Поле | Значение |
|---|---|
| Chain ID | `mrphglobal-1` |
| Chain name | MRPH Global |
| RPC | `http://167.233.230.221:26657` |
| REST | `http://167.233.230.221:1317` |
| BIP44 coin type | `118` |
| Bech32 prefix | `mrph` |
| Staking denom | `umrph` |
| Decimals | `6` |
| Min gas price | `0.2` |

3. Импортируйте свою seed-фразу или создайте новую в приложении

Метаданные для реестров: [`chain-registry/mrphglobal/`](../chain-registry/mrphglobal/)

---

## Tangem

Tangem App поддерживает Cosmos-сети через добавление custom network (Cosmos Hub template):

1. Tangem App → **Settings** → **Blockchains** → **Add custom**
2. Введите параметры из таблицы выше (Chain ID `mrphglobal-1`, prefix `mrph`)
3. Импортируйте seed на Tangem-карту или создайте новый кошелёк в приложении

> Tangem хранит ключи на чипе карты — seed не покидает устройство. Это **лучший** вариант для self-custody.

---

## Аппаратная безопасность vs Telegram

| | Telegram bot | Keplr/Tangem |
|---|---|---|
| Seed у пользователя | опционально (`/export`) | да |
| Seed на сервере | зашифрован (AES-256) | нет |
| Удобство | высокое | среднее |
| Self-custody | после экспорта | по умолчанию |

Для крупных сумм — **Tangem / Keplr**, не Telegram.
