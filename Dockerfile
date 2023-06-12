# syntax=docker/dockerfile:1
FROM ubuntu:22.04
RUN apt-get update

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
RUN apt-get -y install ssmtp
RUN apt-get -y install vim

COPY postfix_config/ /etc/postfix/
COPY dovecot_config/ /etc/dovecot/
COPY mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf

COPY ssmtp.conf /etc/ssmtp/ssmtp.conf

COPY opendkim /etc/default/opendkim
COPY opendkim.conf /etc/opendkim.conf

COPY dkim.key /etc/postfix/dkim.key
RUN chmod 660 /etc/postfix/dkim.key
RUN chown root:opendkim /etc/postfix/dkim.key

RUN postconf -n

COPY s.sh /s.sh
#ENTRYPOINT ["bash", "start-mailserver.sh" ]
