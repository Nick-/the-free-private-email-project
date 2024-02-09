# syntax=docker/dockerfile:1
FROM ubuntu:22.04

RUN apt-get update
RUN apt-get -y upgrade

RUN apt install tzdata -y
ENV TZ="America/New_York"

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
RUN apt-get -y install npm
RUN npm install -g n
RUN apt-get -y install curl
RUN n lts

RUN DEBIAN_FRONTEND=noninteractive apt-get -y install msmtp mailutils

RUN apt-get -y install vim

COPY postfix_config/ /etc/postfix/
COPY dovecot_config/ /etc/dovecot/
COPY mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf

COPY msmtprc /etc/msmtprc

COPY opendkim /etc/default/opendkim
COPY opendkim.conf /etc/opendkim.conf

COPY dkim.key /etc/postfix/dkim.key
RUN chmod 660 /etc/postfix/dkim.key
RUN chown root:opendkim /etc/postfix/dkim.key

RUN postconf -n

## Used to be in s.sh

RUN groupadd -g 5000 vmail
RUN useradd -g vmail -u 5000 vmail -d /var/mail
RUN chown -R vmail:vmail /var/mail
RUN chown -R vmail:dovecot /etc/dovecot
RUN chmod -R o-rwx /etc/dovecot

RUN usermod -d /var/lib/mysql/ mysql

COPY cheapbusiness.email/mailserver.sql /cheapbusiness.email/mailserver.sql

RUN /etc/init.d/mysql start && echo 'CREATE DATABASE mailserver;' | mysql -u root
RUN /etc/init.d/mysql start && mysql -u root mailserver < cheapbusiness.email/mailserver.sql

COPY s.sh /s.sh
#ENTRYPOINT ["bash", "s.sh" ]
