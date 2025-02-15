#!/bin/bash -e

# Check if there is all command-line argument
if [ $# -lt 2 ]; then
    echo "Pass all the parameters like: $0 <radar_sn> <cmd_name> <cmd_value (optional)> <ipv6 (optional)>"
    exit 1
fi

# Assign the first command-line argument to a variable
radar_sn="$1"
cmd_name="$2"

echo "=== CONTROL ZPRIME ==="
if [ "$cmd_name" == "set-static-ip" ]; then
    cmd_value="$3"
    lib/zprime.py --sn "$radar_sn" --set-static-ip "$cmd_value"

elif [ "$cmd_name" == "set-dhcp" ]; then
    lib/zprime.py --sn "$radar_sn" --set-dhcp

elif [ "$cmd_name" == "upload-image" ]; then
    cmd_value="$3"
    lib/zprime.py --sn "$radar_sn" --upload-image "$cmd_value"

elif [ "$cmd_name" == "upload-modes" ]; then
    cmd_value="$3"
    lib/zprime.py --sn "$radar_sn" --upload-modes "$cmd_value"

elif [ "$cmd_name" == "list-modes" ]; then
    lib/zprime.py --sn "$radar_sn" --list-modes

else
    echo "Invalid cmd_name $cmd_name"
fi

exit 0

# Possible commands:
# ./zprime.py
# ./zprime.py --sn <serial_num> --set-static-ip <ip_address>
# ./zprime.py --sn <serial_num> --set-dhcp
# ./zprime.py --sn <serial_num> --upload-image <image_filename>
# ./zprime.py --sn <serial_num> --upload-modes <modes_filename>
# ./zprime.py --sn <serial_num> --list-modes
# ./zprime.py --sn <serial_num> --run-mode <mode_number>
# ./zprime.py --sn <serial_num> --run-mode <mode_number> --run_viewer
# (Depending on your script you may not need the run_viewer argument)
# any command might have --ipv6-intf <ipv6_interface> as an argument