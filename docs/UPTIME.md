# Uptime Monitoring

This project uses a standard health check system for integration with external monitoring tools like UptimeRobot, Datadog, or Pingdom.

## Endpoints

- **`/api/health`** (GET)
  - Returns: `200 OK`
  - Body: `{"status": "ok", "timestamp": "..."}`
  - Used for basic application server health checks without touching the database.

- **`/ping`** or **`/api/ping`** (GET)
  - Returns: `200 OK` if the database and server are healthy.
  - Body: `{"status": "ok", "db_time": "...", "timestamp": "..."}`
  - Used for comprehensive system checks (Server + Database).

## UptimeRobot Setup Instructions

1. Log in to [UptimeRobot](https://uptimerobot.com/).
2. Click **Add New Monitor**.
3. **Monitor Type:** HTTP(s)
4. **Friendly Name:** BuildWithLami - API
5. **URL (or IP):** `https://buildwithlami.onrender.com/api/ping` (Replace with your actual production URL)
6. **Monitoring Interval:** 5 minutes
7. **Select Alert Contacts:** Choose your email/SMS.
8. Click **Create Monitor**.

## Troubleshooting Downtime

If you receive an alert:
1. Check the Render dashboard for server crashes or out-of-memory errors.
2. Check the Supabase dashboard to see if the database reached connection limits or paused.
3. Review logs under the `/admin/logs` dashboard or your cloud provider's log viewer.
