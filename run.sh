sudo bash kac.sh
sudo docker run -v /etc/letsencrypt/:/etc/letsencrypt/ -v /home/ubuntu/email/cheapbusiness.email/:/cheapbusiness.email/ -v mailsql:/var/lib/mysql -v /home/ubuntu/email/mailbox/:/var/mail/ -it --name email-server -p 8080:8080 -p 25:25 -p 587:587 -p 143:143 -p 465:465 -p 993:993 -p 995:995 ncc15c/email 
