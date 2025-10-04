# yfi.moe Backend

Backend for [yfi.moe](https://yfi.moe), built with Hono and Drizzle.

## Development local setup

### setup env

Refer to [.env.example](.env.example) and create a `.env` file.

### setup local email service

Use [Mailhog](https://github.com/mailhog/MailHog) to send and receive emails locally, as a "fake" email service.

```shell
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

The email environment variables in `.env.example` is configured to use Mailhog.

### setup local database

Since we are using SQLite, no need to manually create a database file.

Once the server is running, it will automatically create the database file and run migrations.

The local database file is located by `DATABASE_URL` in `.env`, which is `file:./local.db` by default.
