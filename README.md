# Compatibility
- ARM system architecture
- ROS1 Noetic
- must install dependencies via `sudo ./install_dependencies.sh`

# Installation
- install dependencies `sudo ./install_dependencies.sh`
- make .AppImage executable: `chmod +x lib/Zadar_Run-aarch64.AppImage`

# Accessing jetson
Jetson is set up with username and password 'radar'.
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

# Things to document
## Steps to get `master.launch` to run:
- Permission to access ttyUSB0 and ttyUSB1 must be manually set using: `sudo chmod 666 /dev/ttyUSB0 /dev/ttyUSB1`
- Launch command: `roslaunch zadarlabs_arm_ros1 master.launch`
