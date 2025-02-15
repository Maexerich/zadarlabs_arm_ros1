#!/usr/bin/env python3

import argparse
from argparse import RawTextHelpFormatter
import os
from os import path
import sys
from termcolor import colored
from signal import signal, SIGINT
import time
import re
import paramiko
from paramiko import SSHClient
from scp import SCPClient
from ftplib import FTP
import pathlib
import configparser
import subprocess
import threading
import shutil
from zeroconf import ServiceBrowser, Zeroconf
import re

help_ex = 'Tool for controlling zPrime\n' 

parser = argparse.ArgumentParser(description=help_ex, formatter_class=RawTextHelpFormatter)
parser.add_argument('--sn', type=str, help='Serial number of zPrime to connect to', default='?')
parser.add_argument('--ipv6-intf', type=str, help='Interface to use for IPv6')
parser.add_argument('--set-static-ip', type=str, help='Set the static IP address of zPrime', default=None)
parser.add_argument('--set-dhcp', help='Set the IP address of zPrime to DHCP', action='store_true')
parser.add_argument('--set-startup-mode', type=str, help='Set which mode zPrime should run on startup - 0 for no startup mode')
parser.add_argument('--upload-image', type=str, help='Upload zimg file to zPrime')
parser.add_argument('--upload-modes', type=str, help='Upload zmodes file to zPrime')
parser.add_argument('--list-modes', help='List all modes on zPrime', action='store_true')
parser.add_argument('--run-mode', type=str, help='Run a specific mode on zPrime')
parser.add_argument('--run-viewer', help='Run the pointcloud viewer', action='store_true')
parser.add_argument('--verbose', help='Print verbose output', action='store_true')
args = parser.parse_args()

uname = 'radar'
password = ''
zi_capture_command = ''

# ----------------
# METHODS
# ----------------
# Upload a file to the radar over SSH, and print error message in case of an exception
def put_scp_except(scp, source, dest):
    print(f'Uploading {source}... ', end='')
    if (not path.exists(source)):
        print(colored('source file does not exist!', 'red'))
        exit(-1)
    try:
        scp.put(source, dest)
    except Exception:
        print(colored('upload failure!', 'red'))
        print()
        exit(-1)
    print(colored('success!', 'green'))

def upload_image(filename):
        
    if (pathlib.Path(filename).suffix != '.zimg'):
        print(colored(f'Image file must have .zimg extension', 'red'))
        exit(1)
        
    print(colored("Performing image upload...",'blue'))
    put_scp_except(scp, filename, '~/image.zimg')
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command('zi-update --image-update', get_pty=True)
    while not ssh_stdout.channel.exit_status_ready():
        if ssh_stdout.channel.recv_ready():
            print(ssh_stdout.channel.recv(1).decode('utf-8'), end='')
    if ssh_stdout.channel.recv_exit_status() == 0:
        print(colored('Installed new image', 'green'))
    else:
        print(colored('Could not install new image', 'red'))
        print(ssh_stdout.read().decode('utf-8'))
        print(ssh_stderr.read().decode('utf-8'))
        
def upload_modes(filename):
        
    if (pathlib.Path(filename).suffix != '.zmodes'):
        print(colored(f'Modes file must have .zmodes extension', 'red'))
        exit(1)
    
    print(colored("Performing mode upload...",'blue'))
    put_scp_except(scp, filename, '~/modes.zmodes')
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command('zi-update --mode-update', get_pty=True)
    while not ssh_stdout.channel.exit_status_ready():
        if ssh_stdout.channel.recv_ready():
            print(ssh_stdout.channel.recv(1).decode('utf-8'), end='')
    if ssh_stdout.channel.recv_exit_status() == 0:
        print(colored('Installed new modes', 'green'))
    else:
        print(colored('Could not install new modes', 'red'))
        print(ssh_stdout.read().decode('utf-8'))
        print(ssh_stderr.read().decode('utf-8'))
    
def handler(signal_received, frame):
    take2 = True
    # Handle any cleanup here
    print('SIGINT or CTRL-C detected. Exiting gracefully')
    if (ssh_stdin is not None):
        ssh_stdin.channel.send(chr(3))
        time.sleep(0.1)
        ssh_stdin.close()
    # ssh.exec_command('killall -SIGINT zi-capture')
    # time.sleep(0.1)
    # ssh.exec_command('killall -SIGINT zi-dev')
    # time.sleep(0.1)
    # ssh.exec_command('killall -SIGINT awr-test')
    time.sleep(0.1)
    ssh.close()
    exit(0)

signal(SIGINT, handler)

def run_subprocess(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in process.stdout:
        print(line.strip())
    process.communicate()
    
# Callback function for handling discovered services
class MyListener:
    def remove_service(self, zeroconf, service_type, name):
        pass
    def add_service(self, zeroconf: Zeroconf, service_type, name):
        # print(f"Discovered service type: {service_type}, zeroconf: {zeroconf}, name: {name}")
        if hostname_pattern.match(name):
            info = zeroconf.get_service_info(service_type, name)
            if info:
                addresses = info.parsed_addresses()
                if addresses:
                    ip_address = addresses[0]  # Taking the first address in the list
                    hostname = name.split(".")[0]  # Extracting hostname from the service name
                    print(f'    Discovered {hostname}')
                    print(f'        IP Address {ip_address}')
                    print()        
    def update_service(self, zeroconf, service_type, name):
        pass  # Empty method required by the ServiceBrowser


# ----------------
# MAIN
# ----------------
# SN check
if args.sn == '?':
    print(colored('Searching for zPrime on network...', 'blue'))    
    hostname_pattern = re.compile(r'^zPrime-(\w+) ')
    zeroconf = Zeroconf()
    listener = MyListener()
    browser = ServiceBrowser(zeroconf, "_workstation._tcp.local.", listener)
    time.sleep(2)
    zeroconf.close()
    exit(0)

# ipv6
hostname = f'zPrime-{args.sn}.local'
ipv6_address = None
if (args.ipv6_intf is not None):
    with subprocess.Popen(["avahi-resolve-host-name",'-6','--name',hostname], stdout=subprocess.PIPE) as proc:
        while proc.poll() is None:            
            procout = proc.stdout.read()
            if(len(procout) > 0):
                line = procout.decode("utf-8")
                tokens = line.split()
                ipv6_address = tokens[1]
                # print(procout.decode("utf-8") )
            time.sleep(0.01)
    if (ipv6_address is None):
        print(colored(f'Could not detect ipv6 address for {hostname}', 'red'))
        exit(1)
    else:
        print(colored(f'ipv6 address of {hostname} is {ipv6_address}', 'blue'))
        hostname = f'{ipv6_address}%{args.ipv6_intf}'

# Connect ssh
print(f'Connecting to {hostname}...')
ssh = SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
retry_attempts = 0
while (retry_attempts < 3):
    try:
        ssh.connect(hostname, username=uname, password=password)
        break
    except Exception:
        print(colored(f'Attempt {retry_attempts} Connection failed!', 'red'))
        retry_attempts = retry_attempts + 1
        time.sleep(1)
scp = SCPClient(ssh.get_transport())

# Upload modes
if (args.upload_modes is not None):
    upload_modes(args.upload_modes)
    args.list_modes = True
    
# List modes
if (args.list_modes):
    print(colored('Listing modes...', 'blue'))
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command('zi-capture -m?', get_pty=True)
    if ssh_stdout.channel.recv_exit_status() == 0:
        print(colored('Listed modes:', 'green'))
        print(ssh_stdout.read().decode('utf-8'))
    else:
        print(colored('Could not list modes', 'red'))
        print(ssh_stdout.read().decode('utf-8'))
        print(ssh_stderr.read().decode('utf-8'))
    exit(0)    
    
# Set the static IP
should_reboot = False
if (args.set_static_ip is not None):
    print(colored(f'Setting static IP to {args.set_static_ip}...', 'blue'))
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(f'zi-update --ip-update {args.set_static_ip}', get_pty=True)
    if ssh_stdout.channel.recv_exit_status() == 0:
        print(colored('Set static IP', 'green'))
        should_reboot = True
    else:
        print(colored('Could not set static IP', 'red'))
        print(ssh_stderr.read().decode('utf-8'))

# Set the IP mode to DHCP
elif (args.set_dhcp):
    print(colored(f'Setting IP to DHCP...', 'blue'))
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(f'zi-update --ip-update {args.set_static_ip}', get_pty=True)
    if ssh_stdout.channel.recv_exit_status() == 0:
        print(colored('Set IP to DHCP', 'green'))
        should_reboot = True
    else:
        print(colored('Could not set IP to DHCP', 'red'))
        print(ssh_stderr.read().decode('utf-8'))
        
if (args.set_startup_mode is not None):
    print(colored(f'Setting startup mode to {args.set_startup_mode}...', 'blue'))
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(f'zi-update --startup-mode-update {args.set_startup_mode}', get_pty=True)
    if ssh_stdout.channel.recv_exit_status() == 0:
        print(colored('Set startup mode', 'green'))
        should_reboot = True
    else:
        print(colored('Could not set startup mode', 'red'))
        print(ssh_stderr.read().decode('utf-8'))

# Upload image        
if (args.upload_image is not None):
    upload_image(args.upload_image)
    should_reboot = True

# Reboot if necessary
if should_reboot:
    print (colored('Please reboot for changes to take effect!', 'yellow'))
    # print(colored('Rebooting', 'blue'))
    # ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command('/sbin/reboot')
    # if ssh_stdout.channel.recv_exit_status() == 0:
    #     print(colored('Started reboot', 'green'))
    # else:
    #     print(colored('Could not reboot', 'yellow'))
    #     print(ssh_stdout.read().decode('utf-8'))
    #     print(ssh_stderr.read().decode('utf-8'))
    #     exit(1)
    exit(0)

# Run radar
if (args.run_mode is not None):    
    print(colored("Starting Pointcloud Stream...",'blue'))
    if (args.verbose):
        zi_capture_command = f'zi-capture -v1 -m{args.run_mode} -oT -c'
    else:
        zi_capture_command = f'zi-capture -v0 -m{args.run_mode} -oT -c'
    ssh_stdin, ssh_stdout, ssh_stderr = ssh.exec_command(zi_capture_command, get_pty = True)
    if (args.run_viewer):
        time.sleep(2)
        print(colored("Starting Pointcloud Viewer...",'blue'))
        commands = [['./Zadar_Run-x86_64.AppImage','--json','zprime.json'], './Zadar_Viewer-x86_64.AppImage']
        threads = []
        for cmd in commands:
            thread = threading.Thread(target=run_subprocess, args=(cmd,))
            threads.append(thread)
            thread.start()
    while 1:
        for line in ssh_stdout:
            print(line, end='')
        time.sleep(0.01)

ssh.close()
