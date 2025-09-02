#!/bin/sh
PERCENT=$1
USER=$2
MESSAGE="$(<quota-warning-template.html)"
echo "${MESSAGE//pct/$PERCENT}" | msmtp -a default $USER
