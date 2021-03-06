# cpm-camera

The following instructions were tested on [Raspberry OS ARM64](https://www.raspberrypi.com/software/operating-systems/#raspberry-pi-os-64-bit) (Debian 11 Bullseye)

## Install web/process service

1. Install Docker and Docker Compose plugin using the [official instructions for Debian](https://docs.docker.com/engine/install/debian)

2. Enable and start docker service:
```sh
sudo systemctl enable --now docker
```
3. Create `docker-compose.yml`
```yml
version: "3.3"
services:
  cpm-camera:
    container_name: cpm-camera
    image: ghcr.io/ametis70/cpm-camera:latest
    ports:
      - "4000:4000"
    volumes:
      - ./storage:/app/storage
    restart: always
```
4. Create and start container:
```sh
sudo docker compose up -d
```

### Update

To update to a new image, run:
```sh
sudo docker compose pull
sudo docker compose up -d
```

### Test running service
1. Clone repo
2. After bringing service up, from the root of the repository run:
```sh
curl -F photo=@process/test_single.jpg http://$SERVER_IP/photo
```
## SDL client (Bullseye)

1. Enable console autologin on `raspi-config`
2. Install LÖVE with:
```sh
sudo apt update && sudo apt install love
```
3. (Optional) Rotate console by 90 degrees clockwise adding `fbcon=rotate:1` at the end of `/boot/cmdline.txt`
4. Add the following to the bottom of `.bashrc`:
```sh
echo "Waiting 5 seconds"
sleep 5

SERVER_ADDRESS="http://localhost:4000" IMAGE_DURATION=5 WIDTH=1920 HEIGHT=1080 love cpm-display
```

## Web client (Legacy)

> Warning: don't use this, as it's painfully slow

### Setup Kiosk
1. Enable console autologin on `raspi-config`
2. Add the following to the bottom of `.bashrc`:
```sh
echo "Waiting 5 seconds"
sleep 5
startx
```
3. Add specific driver settings:

#### Full KMS (slow)
5. Select driver on `raspi-config` (`Advanced -> GL Driver -> GL (Full KMS)`)
6. Create `$HOME/.xinitrc` with the following content:
```sh
xset s off
xset -dpms
xset s noblank

xrandr --output $X_OUTPUT --auto --rotate right

exec chromium-browser --window-size=1080,1920 --window-position=0,0 --kiosk --incognito http://localhost:4000
```

#### Legacy

5. Select driver on `raspi-config` (`Advanced -> GL Driver -> Legacy`)
6. Create `$HOME/.xinitrc` with the following content:
```sh
xset s off
xset -dpms
xset s noblank

exec chromium-browser --window-size=1080,1920 --window-position=0,0 --kiosk --incognito http://localhost:4000
```
7. Rotate screen adding `display_hdmi_rotate=1` (90 deegrees) to `/boot/config.txt`:
