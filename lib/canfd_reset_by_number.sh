#!/bin/bash -e

DATARATE_MBPS=5

# This utility script allows the user to bring down and up again 
# existing PCAN devices to reset the communication link with Zadar sensors.
# We assume 2 CAN ports are closed and opened per device.
#
# usage:
#   ./can_if_reset.sh [OPTIONAL: N] -- N is number of devices to reset

# Bring down PCAN devices
if [[ ! -z "$1" ]]; then
  CAN_DEV=$1
else
  CAN_DEV=1
fi


sudo ip link set "can$CAN_DEV" down


# Bring up PCAN devices
if [[ ! -z "$1" ]]; then
  CAN_DEV=$1
else
  CAN_DEV=1
fi

if [[ ! -z "$2" ]]; then
  DATARATE_MBPS=$2
fi

if [[ DATARATE_MBPS -eq '5' ]]; then
    sudo ip link set "can$CAN_DEV" up \
      type can fd on fd-non-iso off \
      bitrate 1000000 \
      prop-seg 8 \
      phase-seg1 6 \
      phase-seg2 5 \
      sjw 1 \
      dbitrate 5000000 \
      dprop-seg 2 \
      dphase-seg1 2 \
      dphase-seg2 3 \
      dsjw 1
elif [[ DATARATE_MBPS -eq '8' ]]; then
    sudo ip link set "can$CAN_DEV" up \
    type can fd on fd-non-iso off \
    bitrate 1000000 \
    prop-seg 8 \
    phase-seg1 6 \
    phase-seg2 5 \
    sjw 1 \
    dbitrate 8000000 \
    dprop-seg 1 \
    dphase-seg1 2 \
    dphase-seg2 1 \
    dsjw 1
else
  echo "Data rate ($1 Mbps) is not supported."
fi