> **Warning:** The ZadarLabs sensor gets extremely warm when in use for a prolonged time (>20min). Be careful when handling and do not leave unattended!

# ZadarLabs ARM ROS1
This package makes use of the ZadarLabs zPrime sensor driver and ROS forwarding already provided by ZadarLabs themselves.

[This](https://drive.google.com/drive/folders/1bJ4ibK7RHQM8SHc3ZKR3BKbj1RCiZthW?usp=drive_link) points to a shared google drive folder where documentation and drivers directly from ZadarLabs can be found.

# Compatibility
- ARM system architecture (jetson or similar)
- ROS1 Noetic

# Installation
- Install dependencies via `sudo ./radar_driver/install_dependencies.sh` and fix subnet (described in the [Zadar Labs software guide](./Zadar%20Labs%20Software%20Guide%20-%20v%203.1.0-1.pdf))
- Make .AppImage executable: `chmod +x lib/Zadar_Run-aarch64.AppImage`
