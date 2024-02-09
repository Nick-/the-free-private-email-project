sudo bash kac.sh
sudo docker run -v /etc/letsencrypt/:/etc/letsencrypt/ \
 -v ~/email/cheapbusiness.email/:/cheapbusiness.email/ \
 -v ~/email/mailbox/:/var/mail/ \
 -d --name email-server \
 -p 8080:8080 -p 25:25 -p 587:587 \
 -p 143:143 -p 465:465 -p 993:993 -p 995:995 \
 ncc15c/email 
