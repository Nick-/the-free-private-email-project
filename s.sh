groupadd -g 5000 vmail
useradd -g vmail -u 5000 vmail -d /var/mail
chown -R vmail:vmail /var/mail

usermod -d /var/lib/mysql/ mysql
/etc/init.d/mysql start
#mysql < mailDB.sql
postfix start
dovecot
cd cheapbusiness.email
nohup node WebServer.js 2> /dev/null &
#tail -f /var/log/mail.log
