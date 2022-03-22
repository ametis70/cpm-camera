# cpm-camera

The following instructions were tested on [Raspberry OS ARM64](https://www.raspberrypi.com/software/operating-systems/#raspberry-pi-os-64-bit) (Debian 11 Bullseye)

## Install web/process service

1. Install Docker using [convenience script](https://docs.docker.com/engine/install/debian/#install-using-the-convenience-script)
2. Enable and start docker service:
```sh
sudo systemctl enable --now docker
```
3. Install Docker Compose:
```sh
sudo apt update
sudo apt install docker-compose
```
4. Create `docker-compose.yml`
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
5. Create and start container:
```sh
sudo docker-compose up -d
```

### Update

To update to a new image, run:
```sh
sudo docker-compose pull
sudo docker-compose up -d
```

### Test running service
1. Clone repo
2. After bringing service up, from the root of the repository run:
```sh
curl -F photo=@process/test_single.jpg http://$SERVER_IP/photo
```

## Setup Kiosk
1. Enable console autologin on `raspi-config`
2. Create `$HOME/.xinitrc` with the following content:
```sh
xset s off
xset -dpms
xset s noblank

xrandr --output $X_OUTPUT --auto --rotate right

chromium-browser --window-size=1080,1920 --kiosk --incognito http://localhost:4000
```
3. Add the following to the bottom of `.bashrc`:
```sh
echo "Waiting 5 seconds"
sleep 5
startx
```
