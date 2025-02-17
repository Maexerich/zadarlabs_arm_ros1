import sys
import zmq
import struct
import time
from pathlib import Path

# Define params
cur_path = Path.cwd()
root_dir = str(cur_path)
socket_file = "zadar_data_radar"
radar_id = "0"

# Initialize the socket
endpoint_address = "tcp://localhost:555" + radar_id
topic_imu = "/zadar/imu" + radar_id
context = zmq.Context()
socket = context.socket(zmq.SUB)
socket.connect(endpoint_address)
socket.setsockopt_string(zmq.SUBSCRIBE, topic_imu)
print("Done setting socket to path: "+endpoint_address+" and topic "+topic_imu)

# Formats
zadar_imu_info_format = "=ddddddd"
zadar_imu_info_size = struct.calcsize(zadar_imu_info_format)

while True:
    try:
        # Receive msg
        message = socket.recv()
        
        # Deserialize imu info
        topic_size = len(topic_imu)
        recv_topic = message[:topic_size].decode('utf-8')
        imu_info = struct.unpack(zadar_imu_info_format, message[topic_size:])
        imu = {
            "linear_acceleration_x": imu_info[0],
            "linear_acceleration_y": imu_info[1],
            "linear_acceleration_z": imu_info[2],
            "gyro_acceleration_x": imu_info[3],
            "gyro_acceleration_y": imu_info[4],
            "gyro_acceleration_z": imu_info[5],
            "temperature_celsius": imu_info[6]
        }
        # Log
        print("---- Topic:", recv_topic)
        print("IMU: ", imu)
        # Your application here
        # ...
    except zmq.ZMQError as e:
        print("wait message")
        time.sleep(0.05)
