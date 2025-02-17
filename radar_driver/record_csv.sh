#!/bin/bash -e

# --------
# READ CMD ARGS
# --------
if [ $# -lt 6 ]; then
    echo "[ERROR] Pass all the parameters like: $0 <radar_number> <enable_raw_scan> <enable_scan> <enable_odometry> <enable_clusters> <enable_tracks>"
    exit 1
fi
radar_number="$1"
enable_raw_scan="$2"
enable_scan="$3"
enable_odometry="$4"
enable_clusters="$5"
enable_tracks="$6"
arch_type="x86_64" # x86_64 aarch64

# --------
# START RECORDING
# --------
echo "=== START RECORDING CSV==="
command="lib/Zadar_Record_csv-$arch_type.AppImage --radar_number $radar_number --scan $enable_scan --raw_scan $enable_raw_scan --odometry $enable_odometry --clusters $enable_clusters --tracks $enable_tracks"
echo "$command"
eval "$command"
