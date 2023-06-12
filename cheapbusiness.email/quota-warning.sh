#!/bin/sh
PERCENT=$1
USER=$2
SUBJECT="Test Subject"
TO="webmaster@cheapbusiness.email"
MESSAGE="Hey There! This is a test mail"

echo $MESSAGE | sudo ssmtp -vvv $TO