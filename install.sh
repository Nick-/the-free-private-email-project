

checkMSQL() {
      if systemctl is-active --quiet mysql; then
            echo -e "\e[32mMySQL service is running.\e[0m"
      else
            echo "MySQL service is NOT running."
      fi
}

checkApache() {
      if systemctl is-active --quiet apache2; then
            echo "Apache2 is running."
      else
            echo "Apache2 is NOT running."
      fi
}

checkCertbot() {
      if command -v certbot >/dev/null 2>&1; then
            echo "Certbot is installed."
      else
            echo "Certbot is NOT installed."
      fi
}

checkRequirements() {
      echo "Checking Requirements"
      checkMSQL
      checkApache
      checkCertbot
}

getDomain() {
      read -p "Enter Email Domain (example.com): " domain

      if [ -z "$domain" ]
      then
            getDomain
      else
            echo $domain
      fi
}

checkForDomainCert() {
      if [ -f "/etc/letsencrypt/live/$1/fullchain.pem" ]; then
            echo "The Domain Cert exists"
      else
            echo "The Domain Cert does NOT exist."
      fi
}
#### Start Process ####
checkRequirements

getDomain

domain = $(getDomain)
echo "Replacing strings from example.com to $domain"

checkForDomainCert $domain

#echo "Setting Up Dockerfile for $domain"
#find . -name '*' -type f -exec sed -i -e "s/cms/$domain/g" {} \;
#cd cms
#npm install --save
#touch install_flag
