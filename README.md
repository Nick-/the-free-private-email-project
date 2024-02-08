Deliverability:

Please regularly check email deliverability using the following service:
https://www.experte.com/spam-checker

The purpose of this container is to quickly deploy a mail server for a given domain.

Pre-requisites:

DOCKER
https://docs.docker.com/engine/install/ubuntu/

NODE
```
sudo apt install nodejs
sudo apt install npm
```

Installation:

1. Point domain DNS A Record to IP Address
2. Setup Certbot SSL outside of container - Required to mount
- mysql in container mounts to mailsql/ in current directory

3. Ensure ports 587 (SMTP), 995 (POP3) & 993 (IMAP) are pinholed by provider
4. MX Record:
	Name: @
	Value: @
5. SPF TXT Record:
	Name: @
	Value: v=spf1 mx -all
6. `sudo bash setup.sh`
	- TODO: DKIM - https://tecadmin.net/setup-dkim-with-postfix-on-ubuntu-debian/
	- Will Prompt for domain(s) / users

7. `sudo bash b.sh` to build local docker file.

8. `sudo bash run.sh` to start the docker container.
   
9. DMARC TXT Record:
	
8. DKIM is installed during build
	- Add TXT Record:
		Name: default._domainkey
		Value: v=DKIM... (cat /etc/opendkim/keys/radd.tech/default.txt)

NOTE: Outgoing SMTP is restricted on AWS servers.. you must request to have the
restriction lifted here:
https://aws-portal.amazon.com/gp/aws/html-forms-controller/contactus/ec2-email-limit-rdns-request

