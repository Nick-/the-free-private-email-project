#!/bin/sh
PERCENT=$1
USER=$2
mail -s "$(echo -e "You are running low on storage..\nContent-Type: text/html")"  webmaster@cheapbusiness.email  <  quota-warning-template.html