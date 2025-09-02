/etc/init.d/mysql start
#mysql < mailDB.sql
postfix start
dovecot
opendkim
cd example.com
nohup node WebServer.js 2> /dev/null &

#This keeps the container running in -d mode.
#tail -f /var/log/mail.log
