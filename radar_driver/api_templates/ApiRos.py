#!/usr/bin/env python
import rospy
from sensor_msgs.msg import PointCloud2
import sensor_msgs.point_cloud2 as pc2

def callback(data):
    pc_data = pc2.read_points(data, field_names=("x", "y", "z"), skip_nans=True)
    point_count = sum(1 for _ in pc_data)
    rospy.loginfo(f"Received PointCloud with {point_count} points.")

def listener():
    rospy.init_node('pointcloud_listener', anonymous=True)
    rospy.Subscriber('/zadar/scan0', PointCloud2, callback)
    rospy.spin()

if __name__ == '__main__':
    try:
        listener()
    except rospy.ROSInterruptException:
        pass
