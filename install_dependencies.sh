#!/bin/bash -e

echo "=== INSTALL DEPENDENCIES ==="
# Update
sudo add-apt-repository universe
sudo apt-get update
# Global
sudo apt-get update && sudo apt-get install -y \
    libzmq3-dev \
    libgoogle-glog-dev \
    libqglviewer-dev-qt5 \
    libserial-dev \
    libfuse2 \
    python3-pip
# QT
sudo apt install -y qtcreator qtbase5-dev qt5-qmake cmake
# Python
pip3 install -r lib/requirements.txt