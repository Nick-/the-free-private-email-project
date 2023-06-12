#!/bin/sh
PERCENT=$1
USER=$2
MESSAGE="From: Cheap Business Email <noreply@cheapbusiness.email>\nSubject: Your mailbox is $PERCENT% Full!\n\nYour Mailbox is currently $PERCENT% Full!"
echo $MESSAGE | msmtp -d $USER