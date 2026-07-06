# MRPH Global — продакшн-нода (Фаза 1)

Сеть **mrphglobal-1** на Hetzner, 24/7 через systemd.

## Эндпоинты (публичные)

| Сервис | URL |
|---|---|
| RPC | `http://167.233.230.221:26657` |
| LCD (REST) | `http://167.233.230.221:1317` |
| Status | `http://167.233.230.221:26657/status` |
| p2p | `167.233.230.221:26656` |

Проверка с любого устройства:

```bash
curl -s http://167.233.230.221:26657/status | jq .result.sync_info.latest_block_height
```

## Адреса genesis (публичные)

| Роль | Адрес |
|---|---|
| Treasury | `mrph1r3720pxx58qapagmrtldpey4c6hzqrqqvravx8` |
| Validator | `mrph1gfdg4pgf7djwzt90hpu47ng0rujstw7z3ykp0p` |
| Valoper | `mrphvaloper1gfdg4pgf7djwzt90hpu47ng0rujstw7z2h3ct4` |

> Это **новые** продакшн-ключи (`keyring-backend: file`). Dev-мнемоники из `ignite chain serve` к этой сети не относятся.

## Секреты (только оффлайн у владельца)

На сервере после деплоя (скопировать **один раз**, затем удалить с сервера):

```bash
ssh root@167.233.230.221
ls -la /root/.mrphglobal-secrets/
# treasury-key.json, validator-key.json — содержат mnemonic
# keyring.pass — пароль keyring
# Также: /root/.mrphglobal/config/priv_validator_key.json
```

**Никогда** не коммитьте эти файлы и не вставляйте мнемоники в чаты.

## Управление нодой

```bash
systemctl status mrphglobald
systemctl restart mrphglobald
journalctl -u mrphglobald -f
```

После `reboot` нода поднимается автоматически (`systemctl enable`).

## Повторный деплой / новый сервер

```bash
# На сервере, из /opt/mrphglobal:
bash scripts/prod/deploy-phase1.sh
```

Исходники: `/opt/mrphglobal`. Бинарник: `/usr/local/bin/mrphglobald`. Данные: `/root/.mrphglobal`.

## Отправка MRPH с treasury (прод)

```bash
export MRPH_PASS="$(cat /root/.mrphglobal-secrets/keyring.pass)"
echo "$MRPH_PASS" | mrphglobald keys list --home /root/.mrphglobal --keyring-backend file

# Пример send (пароль keyring через stdin):
{ echo "$MRPH_PASS"; } | mrphglobald tx bank send treasury <АДРЕС> 1000000umrph \
  --chain-id mrphglobal-1 \
  --home /root/.mrphglobal \
  --keyring-backend file \
  --fees 200umrph -y
```

## Безопасность (TODO)

- [ ] RPC/LCD за **nginx + TLS** (сейчас порты открыты напрямую — MVP)
- [ ] Rate-limit на публичных API
- [ ] Бэкап `priv_validator_key.json` оффлайн

## Firewall

Открыты: `22`, `26656` (p2p), `26657` (RPC), `1317` (LCD).
