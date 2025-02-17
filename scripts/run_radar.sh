#!/bin/bash -e

# --------
# GLOBAL VARS (TUNE THESE !)
# --------
arch_type="aarch64" # x86_64 aarch64
record_always="false"
runtime_mode_zprime="live-edge" # live-edge or live
# For tracking deliverable remember adding _T to the json bin path if zprime-host and zsignal

# --------
# INIT
# --------
remove_file_by_path() {
    local filepath="$1"
    if [ -e "$filepath" ]; then
        {
            rm "$filepath"
            echo "Removed $filepath"
        } || { 
            echo "[Exception] While removing file $filepath"
        }
    fi
}

parallel_pids=()

# --------
# CHECK READ WRITE PERMISSION
# --------
if [ -r "$(pwd)" ] && [ -w "$(pwd)" ]; then
    echo "Current directory has read and write permissions."
else
    echo "Current directory does not have sufficient permissions. Adjusting permissions..."
    sudo chmod 777 -R "$(pwd)"
    echo "Permissions adjusted successfully."
fi

# --------
# READ CMD ARGS
# --------
if [ $# -lt 6 ]; then
    echo "[ERROR] Pass all the parameters like: $0 <radar_num> <radar_types> <radar_serial_numbers> <mode_ids> <enable_viewer> <enable_log> <override_timestamp>"
    exit 1
fi
numArgs=$#
temp=1
radar_num="$1"
radar_types=()
radar_sns=()
mode_ids=()
connection_can_fd=false
connection_ethernet=false
zprime_sns=()
zprime_modes=()
enable_viewer=false
enable_log=false
override_timestamp=false
index=2
for ((i = 0; i < radar_num; i++)); do
    arg="${!index}"
    radar_types+=("$arg")
    index=$(expr $index + 1)
done
for ((i = 0; i < radar_num; i++)); do
    arg="${!index}"
    radar_sns+=("$arg")
    index=$(expr $index + 1)
done
for ((i = 0; i < radar_num; i++)); do
    arg="${!index}"
    mode_ids+=("$arg")
    index=$(expr $index + 1)
done



# Assign optional parameters if they exist
if [ $index -le $numArgs ]; then
    enable_viewer="${!index}"
    index=$((index + 1))
fi

if [ $index -le $numArgs ]; then
    enable_log="${!index}"
    index=$((index + 1))
fi

if [ $index -le $numArgs ]; then
    override_timestamp="${!index}"
    index=$((index + 1))
fi

# --------
# FOLDER LOGS
# --------
log_dir="$(rospack find zadarlabs_arm_ros1)/radar_driver/logs"
mkdir -p "$log_dir"
log_file="$log_dir/$(date +'%Y-%m-%d_%H-%M-%S').txt"

# --------
# GET CONFIGURATION FILES
# --------
jsons=()
bins=()
for ((i = 0; i < radar_num; i++)); do
    radar_type="${radar_types[ i ]}"
    mode_id="${mode_ids[ i ]}"
    radar_sn="${radar_sns[ i ]}"
    # ----- ZSIGNAL
    if [ "$radar_type" == "zsignal" ]; then
        connection_can_fd=true
        json_param=""
        bin_param=""
        # Choose the mode
        if [ "$mode_id" == "1" ]; then
            echo "You selected mode 1."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/w_config_M0.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/r_config_M0.bin"
        elif [ "$mode_id" == "2" ]; then
            echo "You selected mode 2."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/w_config_M1.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/r_config_M1.bin"
        elif [ "$mode_id" == "3" ]; then
            echo "You selected mode 3."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/w_config_M2.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/r_config_M2.bin"
        elif [ "$mode_id" == "4" ]; then
            echo "You selected mode 4."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/w_config_M3.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zsignal/r_config_M3.bin"
        else
            echo "[ERROR] Invalid option: $mode_id"
            exit 1
        fi
        jsons+=("$json_param")
        bins+=("$bin_param")
    # ----- ZPROX
    elif [ "$radar_type" == "zprox" ]; then
        connection_can_fd=true
        json_param=""
        bin_param=""
        # Choose the mode
        if [ "$mode_id" == "1" ]; then
            echo "You selected mode 1."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/w_config0.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/r_config0.bin"
        elif [ "$mode_id" == "2" ]; then
            echo "You selected mode 2."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/w_config1.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/r_config1.bin"
        elif [ "$mode_id" == "3" ]; then
            echo "You selected mode 3."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/w_config2.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/r_config2.bin"
        elif [ "$mode_id" == "4" ]; then
            echo "You selected mode 4."
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/w_config3.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprox/r_config3.bin"
        else
            echo "[ERROR] Invalid option for mode_id: $mode_id"
            exit 1
        fi
        jsons+=("$json_param")
        bins+=("$bin_param")
    # ----- ZPRIME
    elif [ "$radar_type" == "zprime" ]; then
        connection_ethernet=true
        zprime_sns+=("$radar_sn")
        zprime_modes+=("$mode_id")
        if [ "$runtime_mode_zprime" == "live-edge" ]; then # ----- ZPRIME EDGE
            json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprime/viewer.json"
            bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/"
            jsons+=("$json_param")
            bins+=("$bin_param")
        elif [ "$runtime_mode_zprime" == "live" ]; then # ----- ZPRIME HOST
            json_param=""
            bin_param=""
            # Choose the mode
            if [ "$mode_id" == "1" ]; then
                echo "You selected mode 1."
                json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprime/w_85m_512_config.json"
                bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprime/r_85m_512_config.bin"
            elif [ "$mode_id" == "2" ]; then
                echo "You selected mode 2."
                json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprime/w_250m_512_config.json"
                bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprime/r_250m_512_config.bin"
            elif [ "$mode_id" == "3" ]; then
                echo "You selected mode 3."
                json_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprime/w_400m_512_config.json"
                bin_param="$(rospack find zadarlabs_arm_ros1)/radar_driver/zadar_config/zprime/r_400m_512_config.bin"
            else
                echo "[ERROR] Invalid option for mode_id: $mode_id"
                exit 1
            fi
            jsons+=("$json_param")
            bins+=("$bin_param")
        fi
    # ----- INVALID
    else
        echo "[ERROR] Invalid option for radar_type: $radar_type"
        exit 1
    fi
done

# If single-radar then create a user-generated entry for the file
if [ "$radar_num" -eq 1 ]; then
	default_path="$jsons"
	user_gen_path="${jsons/zadar_config/zadar_config\/user_generated}"
	if [ ! -f  "$user_gen_path" ]; then
		mkdir -p $(dirname "$user_gen_path")
		cp "$default_path" "$user_gen_path"
	fi
	jsons="$user_gen_path"
	
fi

# --------
# CONNECTION SETUP
# --------
if [ $connection_can_fd == true ]; then
    echo "=== SET CAN-FD CONNECTION ==="
    for ((i=0; i<=$radar_num; i++)); do
        {
            $(rospack find zadarlabs_arm_ros1)/radar_driver/lib/canfd_reset_by_number.sh "$i"
        } || {  
            echo ""
        }
    done
fi
if [ "$connection_ethernet" == true ]; then
    echo "=== SET ETHERNET CONNECTION ==="
    for idx in "${!zprime_sns[@]}"; do
        python3 $(rospack find zadarlabs_arm_ros1)/radar_driver/lib/zprime.py --sn "${zprime_sns[$idx]}" --run-mode "${zprime_modes[$idx]}" &
        parallel_pids+=("$!")
    done
fi
sleep 2

# --------
# LAUNCH RECORD
# --------
if [ "$record_always" == "true" ]; then
    echo "=== START RECORDING CSV==="
    command_record="$(rospack find zadarlabs_arm_ros1)/radar_driver/lib/Zadar_Record_csv-$arch_type.AppImage --radar_number $radar_num --scan off --raw_scan off --odometry off --clusters off --tracks on &"
    echo "$command_record"
    eval "$command_record"
    record_process_pid=$!
fi

# --------
# LAUNCH RADAR
# --------
echo "=== LAUNCH SENSOR ==="
radar_sn="${radar_sns[*]}"
json_param="${jsons[*]}"
bin_param="${bins[*]}"

override_timestamp_cmd=""

if [ "$override_timestamp" == "on" ]; then
    override_timestamp_cmd=" --recieve_time_timestamp on"
fi
command="$(rospack find zadarlabs_arm_ros1)/radar_driver/lib/Zadar_Run-$arch_type.AppImage --radar_num $radar_num --radar_sn $radar_sn --json $json_param --bin $bin_param --enable_viewer $enable_viewer --enable_log $enable_log --runtime_mode_zprime $runtime_mode_zprime $override_timestamp_cmd"
echo "$command"
{
    if [ "$enable_log" == "on" ]; then
        eval "$command" 2>&1 | tee -a "$log_file"
    else
        eval "$command"
    fi
} || { 
    echo "[Exception] "
}
sleep 1

# --------
# KILL FIRST PROCESS IF PRESENT
# --------
for pid in "${parallel_pids[@]}"; do
    # Check if PID exists and process is running
    if kill -0 "$pid" 2>/dev/null; then
        echo "Killing process with PID $pid for zprime edge connection"
        kill -SIGINT "$pid"
    fi
done
# --------
# KILL RECORD PROCESS
# --------
if [ "$record_always" == "true" ]; then
    if kill -0 "$record_process_pid" 2>/dev/null; then
        echo "Kill process RECORD"
        kill -SIGINT "$record_process_pid"
    fi
fi

# --------
# REMOVE VIEWER FILES IF PRESENT
# --------
echo "=== REMOVE TEMPORARY FILES ==="
remove_file_by_path "$(rospack find zadarlabs_arm_ros1)/radar_driver/.qglviewer.xml"
remove_file_by_path "$(rospack find zadarlabs_arm_ros1)/radar_driver/imgui.ini"
sleep 1

# --------
# EXIT
# --------
echo "=== EXIT ==="
exit 0
