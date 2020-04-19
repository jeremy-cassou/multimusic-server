# MultiMusic Server (multimusic-server)

A SnapServer server interface for use multimusic-controller

Create a MultiRoom server for Spotify Conenct
Each group of SnapCast client create dynamically a Spotify Connect speaker.
The server make an API for control groups (add and remove speaker from a group) and volume (by speaker)

An application (multimusic-controller) is also available for control SnapCast Server and its SnapCast clients

## Install MultiMusic Server on Raspberry PI
We need to install Raspbian with SnapCast Server and LibreSpot.  
The current tutorial is based on [this one](https://mondedie.fr/d/10750-tuto-multiroom-audio-avec-snapcast-sur-un-rpi) for install SnapCast Server and LibreSpot
#### Raspbian

Flash SD Card with the latest version of Raspbian

##### Enable Wifi (Optionnal)
Create a file named **wpa_supplicant.conf** in the root of SD Card.

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=FR

network={
     ssid="YOUR_NETWORK_SSID"
     psk="YOUR_NETWORK_PASSWORD"
     key_mgmt=WPA-PSK
}
```

##### Enable SSH (Optionnal)

Create an empty file named **ssh** in the root of SD Card

#### Install SnapServer
The current version of SnapCast used is v0.19.0

```bash
wget https://github.com/badaix/snapcast/releases/download/v0.19.0/snapserver_0.19.0-1_armhf.deb -O /tmp/snapserver.deb
sudo dpkg -i /tmp/snapserver.deb
sudo apt install -f
```

#### Install LibreSpot
Actually, the latest version available on Cargo doesn't compile on Raspbian. So, we build our own version.

```bash
curl https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env
git clone https://github.com/librespot-org/librespot /tmp/librespot
sudo apt install build-essential libasound2-dev pkg-config portaudio19-dev
cd /tmp/librespot
cargo build --release
sudo cp /tmp/librespot/target/release/librespot /usr/bin/librespot
```

#### Install NodeJs
Use the latest version of NodeJs (currently v12.16.2)
```bash
cd /tmp
wget https://nodejs.org/dist/v12.16.2/node-v12.16.2-linux-armv7l.tar.xz
sudo tar -xvf node-v12.16.2-linux-armv7l.tar.xz -C /usr/local/
```
Check if NodeJs and npm is correctly installed with **npm -v** and **node -v**

#### Install MultiMusic Server
```bash
cd ~
git clone -b develop https://github.com/jeremy-cassou/multimusic-server.git
cd multimusic-server
npm install
```

#### Install PM2
PM2 allows us to run MultiMusic Server on background and starts automatically on boot.
```bash
sudo npm install -g pm2
```

#### Run MultiMusic Server with PM2
We need to run pm2 start command on sudo to use port 80.  
If you don't want run the server with sudo, you need to use allowed port for simple user (above 1024) with create .env file and set **SERVER_PORT** variable.
```bash
cd ~
sudo pm2 start multimusic-server/index.js
```

#### Start PM2 and MultiMusic Server on boot
Be sure that MultiMusic Server is already started (see previous section)
```bash
sudo pm2 startup systemd
sudo pm2 save
```

#### Serve MultiMusic Controller
If we create a static folder on /multimusic-server/, it will be automatically server on / url.   
So, for server MultiMusic Controller, we only need to place the builded version in this folder.  

## Create a new Speaker
For create a new Speaker with a Raspberry, we only need to mount a Raspbian and install SnapCast Client.  
For raspbian, follow the same steps as MultiMusic Server.  
The Speaker must to be on the same network as the MultiMusic Server.

The current version on SnapCast Client used is the same as the SnapCast Server (v0.19.0)

```bash
wget https://github.com/badaix/snapcast/releases/download/v0.19.0/snapclient_0.19.0-1_armhf.deb -O /tmp/snapclient.deb
sudo dpkg -i /tmp/snapclient.deb
sudo apt install -f
```

After install, the new Speaker it's automatically detect by the server.  

#### Configure raspbian with JustBoom AMP
In my case, my clients run on Raspberry Zero W with JustBoom AMP Zero Hat.  
So, I need to change the default audio output.

I need to edit /boot/config.txt
```bash
sudo nano /boot/config.txt
```
And I remplace the line **dtparam=audio=on** with the next lines :
```
#dtparam=audio=on
dtparam=audio=off
dtoverlay=i2s-mmap
dtoverlay=justboom-dac
```
