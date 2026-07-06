# MRPH Global — кроссчейн и мосты (roadmap)

## Что уже есть

- **IBC Transfer module** включён в `mrphglobald` (Cosmos SDK)
- Переводы **MRPH** на любой `mrph...` адрес — мгновенно, 24/7, без границ
- Telegram-бот и explorer для мониторинга

## Что нужно для USDT / TON / других сетей

Кроссчейн в **USDT (Tether)**, **TON (Gram)** и Ethereum — это **мосты**, не одна строчка кода:

| Направление | Технология | Статус |
|---|---|---|
| MRPH ↔ Cosmos Hub / Osmosis | IBC + **relayer** (Hermes/Go) | 🔜 Phase 4 |
| MRPH ↔ USDT | IBC from **Noble** (USDC/USDT) или CEX/DEX bridge | 📋 Planned |
| MRPH ↔ TON | Custom bridge (wrapped MRPH) или централизованный шлюз | 📋 Research |
| MRPH ↔ ETH/BSC | IBC via Axelar / Wormhole / custom peg | 📋 Research |

### Phase 4 — IBC relayer (следующий инженерный шаг)

1. Поднять Hermes relayer на Hetzner
2. Создать IBC connection: `mrphglobal-1` ↔ test counterparty (or Cosmos Hub test)
3. Открыть channel `channel-0` для transfer
4. Бот: UI «🚇 Bridge» → выбор сети назначения

### USDT

Нативный USDT живёт в Tron/ETH/Noble (Cosmos). Реалистичный путь:

- **IBC USDC/USDT** с Noble после подключения relayer к mainnet Cosmos
- или **CEX** (deposit MRPH / withdraw USDT) — вне блокчейна

### TON (Gram)

TON и Cosmos — разные VM. Нужен:

- **Wrapped token** контракт на TON + custodian на MRPH side, или
- партнёрский bridge (TON Bridge, etc.)

---

## Для инвесторов / GitHub

Мы публикуем **рабочий Layer-1** с IBC-ready stack. Мосты — стандартный этап после mainnet (как у Osmosis, Injective на старте).

Следите за issues с label `bridge` в репозитории.
