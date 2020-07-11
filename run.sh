#!/bin/bash

node --require ts-node/register "src/best-config.ts" 2>&1 | tee -a command_output.txt
