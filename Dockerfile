# syntax=docker/dockerfile:1
FROM ubuntu:22.04
RUN apt-get update

RUN apt-get -y install vim

RUN apt-get -y install dovecot-core
RUN apt-get -y install dovecot-pop3d
RUN apt-get -y install dovecot-imapd
RUN apt-get -y install dovecot-lmtpd
RUN apt-get -y install dovecot-mysql

RUN apt-get -y install postfix
RUN apt-get -y install postfix-mysql

RUN apt-get -y install mysql-server

RUN apt-get -y install opendkim opendkim-tools

RUN apt-get -y install nodejs
RUN apt-get -y install git
COPY postfix_config/ /etc/postfix/
COPY dovecot_config/ /etc/dovecot/
COPY mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf

RUN postconf -n
#DKIM
#RUN usermod -G opendkim postfix
#RUN mkdir -p /etc/opendkim/keys 
#RUN chown -R opendkim:opendkim /etc/opendkim
#RUN chmod  744 /etc/opendkim/keys 
#RUN mkdir /etc/opendkim/keys/cheapbusiness.email 
#RUN opendkim-genkey -b 2048 -d cheapbusiness.email -D /etc/opendkim/keys/cheapbusiness.email -s default -v 
#RUN chown opendkim:opendkim /etc/opendkim/keys/cheapbusiness.email/default.private
COPY s.sh /s.sh
#ENTRYPOINT ["bash", "start-mailserver.sh" ]
