# Simple Webhook Server

A minimal Docker containerized webhook endpoint that receives JSON payloads and saves them to files on the host system. Perfect for simple webhook handling on home networks.

## Features

- ✅ Simple HTTP webhook endpoint (`POST /webhook`)
- ✅ Bearer token authentication
- ✅ Saves JSON payloads to timestamped files
- ✅ Docker containerized for easy deployment
- ✅ Health check endpoint
- ✅ Persistent data storage on host filesystem
- ✅ Non-root container user for security

## Requirements

- Docker and Docker Compose installed on your Linux server
- Port 3000 available (or modify as needed)

## Quick Setup

1. **Clone or copy these files to your server:**
   ```bash
   # Create directory
   mkdir webhook-server && cd webhook-server
   
   # Copy the files: server.js, package.json, Dockerfile, docker-compose.yml
   ```

2. **Configure your bearer token:**
   Edit [`docker-compose.yml`](docker-compose.yml:11) and change the default token:
   ```yaml
   environment:
     - BEARER_TOKEN=your-secret-token-here  # Change this!
   ```

3. **Prepare the data directory (if using /srv/share):**
   ```bash
   # Create the directory if it doesn't exist
   sudo mkdir -p /srv/share
   
   # Set proper permissions for the Docker container user (UID 1001)
   sudo chown -R 1001:1001 /srv/share
   
   # Or make it writable by all (less secure but simpler)
   sudo chmod 777 /srv/share
   ```

4. **Start the service:**
   ```bash
   docker-compose up -d
   ```

5. **Verify it's running:**
   ```bash
   # Check container status
   docker-compose ps
   
   # Check logs
   docker-compose logs
   
   # Test health endpoint
   curl http://localhost:3000/health
   ```

## Usage

### Send a webhook

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Authorization: Bearer your-secret-token-here" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello webhook!", "data": {"key": "value"}}'
```

### Successful response
```json
{
  "success": true,
  "message": "Webhook received and saved",
  "filename": "webhook-1692614400000-abcd1234.json",
  "timestamp": "2023-08-21T12:00:00.000Z"
}
```

### Data storage

Webhook data is saved to `/srv/share/` directory on your host system. Each file contains:

```json
{
  "timestamp": "2023-08-21T12:00:00.000Z",
  "headers": {
    "authorization": "Bearer your-secret-token-here",
    "content-type": "application/json",
    "user-agent": "curl/7.68.0"
  },
  "payload": {
    "message": "Hello webhook!",
    "data": {
      "key": "value"
    }
  }
}
```

## Configuration

### Environment Variables

- `BEARER_TOKEN`: Authentication token (default: `your-secret-token`)
- `PORT`: Server port (default: `3000`)

### Port Mapping

To use a different port, modify [`docker-compose.yml`](docker-compose.yml:8):
```yaml
ports:
  - "8080:3000"  # External port 8080, internal port 3000
```

### Data Directory

To change where webhook files are saved, modify the volume mapping in [`docker-compose.yml`](docker-compose.yml:15):
```yaml
volumes:
  - /your/custom/path:/app/data  # Change /your/custom/path to your desired directory
```

**Important:** Ensure the directory exists and has proper permissions:
```bash
sudo mkdir -p /your/custom/path
sudo chown -R 1001:1001 /your/custom/path  # Container runs as user 1001
```

## Management Commands

```bash
# Start the service
docker-compose up -d

# Stop the service
docker-compose down

# View logs
docker-compose logs -f

# Restart the service
docker-compose restart

# Rebuild after code changes
docker-compose up --build -d

# Check webhook files
ls -la /srv/share/
```

## Security Notes

- The bearer token provides basic authentication
- The container runs as a non-root user
- Only the webhook data directory is mounted to the host
- Suitable for home network use, not production internet-facing deployments

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker-compose logs webhook-server

# Ensure port 3000 is available
sudo netstat -tlnp | grep :3000
```

### Permission issues with data directory
```bash
# Fix permissions for data directory (adjust path as needed)
sudo chown -R 1001:1001 /srv/share/
# Or check current ownership
ls -la /srv/share/
```

### File not being saved
```bash
# Verify the directory exists and has correct permissions
ls -la /srv/share/
sudo chown -R 1001:1001 /srv/share/

# Check container logs for permission errors
docker-compose logs webhook-server
```

### Authentication errors
- Verify the bearer token matches between [`docker-compose.yml`](docker-compose.yml:11) and your requests
- Check the `Authorization: Bearer <token>` header format

### Network connectivity
```bash
# Test from another machine on your network
curl http://YOUR-SERVER-IP:3000/health
```

## API Reference

### POST /webhook
Receives JSON payload and saves to file.

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json` (required)

**Response:** JSON with success status and file details

### GET /health
Health check endpoint.

**Response:** JSON with status and timestamp

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Transparency Disclaimer

[ai.collaboratedwith.me](https://ai.collaboratedwith.me) in creating this project.