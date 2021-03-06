#!/usr/bin/python

import sys
import os
import subprocess
import shlex as shlex
import re

from termcolor import colored
from typing import List


if len(sys.argv) != 2:
    print("script <osm_filename>")

osm_file = sys.argv[1]
(osm_filename, osm_ext) = os.path.splitext(osm_file)
net_xml_file = f"{osm_filename}.net.xml"
poly_file = f"{osm_filename}.poly.xml"
sumo_config_file = f"{osm_filename}.sumocfg"

if osm_ext != ".osm":
    print("Extension is not .osm")
    exit(1)


def executeCommand(command: List[str], detach=False):
    proc = subprocess.Popen(command)
    print(colored(f"\nExecuting '{shlex.join(proc.args)}'", 'cyan') +
          (colored(" Detached", 'magenta') if detach else ""))
    if not detach:
        outs, errs = proc.communicate()
        if proc.returncode != 0:
            print(colored("Execution not succesfull", 'red'))
            exit(1)


# Creates network file
executeCommand([
    "netconvert",
    "--type-files", "osmNetconvert.typ.xml,osmNetconvertPedestrians.typ.xml",
    "--osm-files", osm_file,
    "--output-file", net_xml_file,
    "--geometry.remove",
    "--roundabouts.guess",
    "--ramps.guess",
    "--junctions.join",
    "--tls.guess-signals",
    "--tls.discard-simple",
    "--tls.join",
    "--no-turnarounds.except-deadend",
    "--osm.all-attributes",
    "--sidewalks.guess",
    # "--crossings.guess",
])

# Creates poly file
executeCommand([
    "polyconvert",
    "--net-file", net_xml_file,
    "--osm-files", osm_file,
    "--type-file", "osmPolyconvert.typ.xml",
    "-o", poly_file,
])

user_input = input(colored("\nWould you like to execute SUMO? y/n ", 'yellow'))

if re.match("y", user_input, re.I):
    # Executes sumo with config file
    executeCommand([
        "sumo-gui",
        "-c", sumo_config_file,
    ], detach=True)
