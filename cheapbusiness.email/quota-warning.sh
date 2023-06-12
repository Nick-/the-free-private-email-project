#!/bin/sh
PERCENT=$1
USER=$2
MESSAGE=`cat quota-warning-template.html`
echo $MESSAGE | mail -s "Your mailbox is $PERCENT% Full!" $USER