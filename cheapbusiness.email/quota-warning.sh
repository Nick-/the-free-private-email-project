#!/bin/sh
PERCENT=$1
USER=$2
SUBJECT="Test Subject"
MESSAGE="
From: Cheap Business Email <noreply@cheapbusiness.email>
Subject: Your mailbox is almost full!

Your Mailbox is currently $PERCENT % Full!
"

echo $MESSAGE | msmtp -d $USER