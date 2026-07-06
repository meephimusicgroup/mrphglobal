# MRPH Global — обозреватель (Фаза 2)

Self-hosted [ping-pub/explorer](https://github.com/ping-pub/explorer) на том же Hetzner-сервере.

## URL

**http://167.233.230.221:8080/**

Порт **8080** — на том же сервере порт 80 занят Caddy (VPN/remnawave). Позже можно повесить explorer за домен через Caddy reverse proxy.

В интерфейсе выберите сеть **mrphglobal** (chain `mrphglobal-1`).

## Эндпоинты в конфиге

| Тип | URL |
|---|---|
| LCD | `http://167.233.230.221:1317` |
| RPC | `http://167.233.230.221:26657` |

Конфиг цепочки: `scripts/prod/explorer/mrphglobal.json`

## Обновление после смены IP / домена

1. Отредактируйте `scripts/prod/explorer/mrphglobal.json` (поля `api` / `rpc`).
2. На сервере:

```bash
cd /opt/mrphglobal
git pull   # или scp обновлённых файлов
MRPH_PUBLIC_IP=<новый_IP> bash scripts/prod/deploy-phase2.sh
```

## Пересборка explorer

```bash
bash /opt/mrphglobal/scripts/prod/deploy-phase2.sh
```

Исходники explorer: `/opt/ping-explorer`  
Статика nginx: `/opt/ping-explorer/dist`

## Домен (позже)

1. DNS A-запись → `167.233.230.221`
2. Обновить `server_name` в `/etc/nginx/sites-available/mrph-explorer`
3. Certbot + TLS: `certbot --nginx -d explorer.example.com`
4. Обновить URL в `mrphglobal.json` при переходе RPC/LCD за nginx

## Проверка

- Дашборд показывает растущую высоту блоков
- Поиск treasury: `mrph1r3720pxx58qapagmrtldpey4c6hzqrqqvravx8`
- Баланс ~1 000 000 000 MRPH
