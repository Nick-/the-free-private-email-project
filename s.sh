groupadd -g 5000 vmail
useradd -g vmail -u 5000 vmail -d /var/mail
chown -R vmail:vmail /var/mail
chown -R vmail:dovecot /etc/dovecot
chmod -R o-rwx /etc/dovecot

usermod -d /var/lib/mysql/ mysql
/etc/init.d/mysql start
#mysql < mailDB.sql
postfix start
dovecot
opendkim
cd cheapbusiness.email
nohup node WebServer.js 2> /dev/null &

#This keeps the container running in -d mode.
tail -f /var/log/mail.log
