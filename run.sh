

sudo bash scripts/kac.sh
sudo docker run -v /etc/letsencrypt/:/etc/letsencrypt/ \
 -v ~/email/example.com/:/example.com/ \
 -v ~/email/mailbox/:/var/mail/ \
 -it --name email-server \
 -p 8080:8080 -p 25:25 -p 587:587 \
 -p 143:143 -p 465:465 -p 993:993 -p 995:995 \
 -e DB_HOST=localhost \
 -e DB_USER=fpepu \
 -e DB_PASSWORD=replace_this_mysql_password \
 -e DB_NAME=fpep \
 ncc15c/email 
