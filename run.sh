sudo bash kac.sh
sudo docker run -v /etc/letsencrypt/:/etc/letsencrypt/ \
 -v /home/root/email/cheapbusiness.email/:/cheapbusiness.email/ \
 -v /etc/mysql/:/etc/mysql/ \
 -v mailsql:/var/lib/mysql \
 -v /home/root/email/mailbox/:/var/mail/ \
 -it --name email-server \
 -p 3306:3306 -p 8080:8080 -p 25:25 -p 587:587 \
 -p 143:143 -p 465:465 -p 993:993 -p 995:995 \
 ncc15c/email 
