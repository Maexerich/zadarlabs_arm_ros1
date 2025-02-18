# Attention
> **Bugs:** When booting up jetson, remove ethernet cable from jetson's ethernet port. For some reason the jetson will not boot properly with this connected!


> **Warnings:** The ZadarLabs sensor gets extremely warm when in use for prolonged time (>20min). Be careful when handling and do not leave unattended!!!

# Compatibility
- ARM system architecture
- ROS1 Noetic
- must install dependencies via `sudo ./install_dependencies.sh` _(described in more detail below)_

# Installation
- install dependencies `sudo ./install_dependencies.sh` _(described in more detail below)_
- make .AppImage executable: `chmod +x lib/Zadar_Run-aarch64.AppImage`

# Accessing jetson / recording data
Jetson is set up with username and password 'radar'.

To record data, we use the `zadarlabs_arm_ros1` package with the `master.launch` file.
There are different ways available to start and stop the recording;
- via the web-interface (experimental)
- via ssh & using the terminal (robust, but more advanced)
Details on the `master.launch` can be found below.

## Web-interface: to record data
The test setup proposed, includes a self hosted website
which can be used to start and stop ros-recordings.
This has not been tested extensively, use with caution.

For the jetson with MAC: 70:66:55:b1:3b:d1 in flynet-an network with IP 10.10.10.241:
http://10.10.10.241:5000
_(IP should be static inside the flynet-an network)_

The source code for the web-app can be found on the jetson in 
the `~/Documents/radar_web_app_control` directory or at: 
[Radar Test Rig Web Application Control](https://github.com/Maexerich/radar_web_app_control).

## SSH
Open-ssh is installed, so accessing via SSH at the IP address should work too.
```bash
ssh radar@10.10.10.241:22 # Assuming the ip from above
ssh radar@radar  # Might work too
ssh radar@<ip_address> # General approach
```

# `master.launch`: Details
This master-launch file is used to record data using the radar test bench.
The sensors supported are:
- a TI-AWR1843 radar sensor, connected via USB
- a ZadarLabs zPrime sensor, connected via Ethernet.
- a IMU sensor connected via SPI

## TI-AWR1843 configuration
_TODO_
- ensure it shows up at `/dev/ttyUSB0` and `/dev/ttyUSB1` via micro-USB cable
- coordinate frame

## ZadarLabs configuration
_TODO_
- fix ethernet subnet
- use their docs.

## IMU configuration
- connected via SPI
- how to configure SPI on jetson:
```bash
cd /opt/nvidia/jetson-io
sudo ./jetson-io.py
```
Then enable SPI and reboot.
To ensure SPI is loaded, use the following command:
```bash
sudo modprobe spidev
```
To automate this;
```bash
sudo nano /etc/modules-load.d/spidev.conf # Create this file
# Add the following line to the file
spidev
```

# Things to document
## Steps to get `master.launch` to run:
- Permission to access ttyUSB0 and ttyUSB1 must be manually set using: `sudo chmod 666 /dev/ttyUSB0 /dev/ttyUSB1`
- Launch command: `roslaunch zadarlabs_arm_ros1 master.launch`
