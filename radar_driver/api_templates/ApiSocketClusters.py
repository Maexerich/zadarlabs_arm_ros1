import ZadarFrame_pb2 as zadar
import zmq
import time
from pathlib import Path

class ZadarReciever_Clusters():
    def __init__(self, radar_id: int):
        radar_id = str(radar_id)
        endpoint_address = "tcp://localhost:555" + radar_id
        self.topic = "/zadar/proto/clusters" + radar_id
        context = zmq.Context()
        self.socket = context.socket(zmq.SUB)
        self.socket.connect(endpoint_address)
        self.socket.setsockopt_string(zmq.SUBSCRIBE, self.topic)
        print("Done setting socket to path: " + endpoint_address + " and topic " + self.topic)
    def fetch(self):
        message = self.socket.recv(flags=zmq.NOBLOCK)
        topic_length = len(self.topic)
        protobuf_data = message[topic_length:]
        obj = zadar.ZadarClusters()
        obj.ParseFromString(protobuf_data)
        return obj

R = ZadarReciever_Clusters(0)
while True:
    try:
        # Receive msg        
        scan = R.fetch()
        print(scan)
    except zmq.ZMQError as e:
        time.sleep(0.005)
    time.sleep(0.1)
    print("Finished frame")