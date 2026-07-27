# MongoDB Manual Installation Notes (macOS arm64)

## System Info
- Architecture: aarch64 (Apple Silicon)
- macOS Version: 26.4
- MongoDB Version: 7.0.21

## Installation Steps Performed

### 1. Download MongoDB
```bash
curl -L "https://fastdl.mongodb.org/osx/mongodb-macos-arm64-7.0.21.tgz" -o /tmp/mongodb.tgz
```
> Note: The extracted folder name is `mongodb-macos-aarch64-7.0.21` (not arm64)

### 2. Extract
```bash
tar -xzf /tmp/mongodb.tgz -C /tmp
```

### 3. Create system directories
```bash
sudo mkdir -p /usr/local/bin
sudo mkdir -p /usr/local/var/mongodb
sudo mkdir -p /usr/local/var/log/mongodb
```

### 4. Copy binaries
```bash
sudo cp /tmp/mongodb-macos-aarch64-7.0.21/bin/mongod /usr/local/bin/
sudo cp /tmp/mongodb-macos-aarch64-7.0.21/bin/mongos /usr/local/bin/
```

### 5. Set ownership of data/log directories
```bash
sudo chown -R $(whoami) /usr/local/var/mongodb
sudo chown -R $(whoami) /usr/local/var/log/mongodb
```

### 6. Verify installation
```bash
mongod --version
# db version v7.0.21
```

---

## How to Start MongoDB

### Start manually (foreground)
```bash
mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongod.log --fork
```

### Stop MongoDB
```bash
mongod --dbpath /usr/local/var/mongodb --shutdown
```

### Check if MongoDB is running
```bash
pgrep mongod
```

---

## Auto-start on Login (launchd)

A launchd plist is configured at:
```
~/Library/LaunchAgents/org.mongodb.mongod.plist
```

### Load (start now + auto-start on login)
```bash
launchctl load ~/Library/LaunchAgents/org.mongodb.mongod.plist
```

### Unload (stop now + disable auto-start)
```bash
launchctl unload ~/Library/LaunchAgents/org.mongodb.mongod.plist
```

---

## Connection Details
- URI: `mongodb://localhost:27017/rsp_news`
- Database: `rsp_news`
- Port: `27017`
