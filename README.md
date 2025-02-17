# Compatibility
- ARM system architecture
- ROS1 Noetic
- must install dependencies via `sudo ./install_dependencies.sh`

# Installation
- install dependencies `sudo ./install_dependencies.sh`
- make .AppImage executable: `chmod +x lib/Zadar_Run-aarch64.AppImage`

# How to record data using the test setup
The test setup proposed, includes a self hosted website
which can be used to start and stop ros-recordings.
This has not been tested extensively, so use with caution.

Website can be found at `http://<ip_of_jetson>:5000`.
Website should be self explanatory.
Last I checked, the IP of the jetson in the ____ network was ____.
Find your own IP by running `hostname -I`.

The source code for the web-app can be found on the jetson in 
the `~/Documents/radar_web_app_control` directory or at: 
[Radar Test Rig Web Application Control](https://github.com/Maexerich/radar_web_app_control).


# Things to document
## Steps to get `master.launch` to run:
- Permission to access ttyUSB0 and ttyUSB1 must be manually set using: `sudo chmod 666 /dev/ttyUSB0 /dev/ttyUSB1`
- Launch command: `roslaunch zadarlabs_arm_ros1 master.launch`