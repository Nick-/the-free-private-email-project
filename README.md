ABOUT

This is an email content management system that can be manage domains and user accounts.

Last Tested: 2/9/24 (Ubuntu 23.10)

GETTING STARTED

Software Pre-requisites:

DOCKER
https://docs.docker.com/engine/install/ubuntu/
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```
```
# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
```
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

NODE
```
sudo apt install nodejs
sudo apt install npm
```

CERTBOT

Setup Certbot SSL outside of container (mounted for container use).

Network Pre-requisites:

1. Point domain DNS A Record to IP Address.
2. Ensure ports 587 (SMTP), 995 (POP3) & 993 (IMAP) are pinholed by provider
3. MX Record:
	Name: @
	Value: @
4. SPF TXT Record:
	Name: @
	Value: v=spf1 mx -all

INSTALL & RUN

1. `sudo bash setup.sh` will prompt for the hosting domain (cheapbusiness.email).

7. `sudo bash b.sh` will build the local docker file.

8. `sudo bash run.sh` will start the docker container. You will be taken inside the container.

9. `bash s.sh` will start the required services inside the container.

10. You can now detatch from the Docker Container With `Ctrl+P` and `Ctrl+Q`.

TODO
   
- DMARC TXT Record:
	
- DKIM (installed during build)
https://tecadmin.net/setup-dkim-with-postfix-on-ubuntu-debian/
	- Add TXT Record:
		Name: default._domainkey
		Value: v=DKIM... (cat /etc/opendkim/keys/radd.tech/default.txt)

DELIVERABILITY

Please regularly check email deliverability using the following service:
https://www.experte.com/spam-checker

Outgoing SMTP on port 25 is restricted on AWS servers. Request Unblock Here:
https://aws-portal.amazon.com/gp/aws/html-forms-controller/contactus/ec2-email-limit-rdns-request

