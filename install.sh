
checkMSQLUser() {
      #Check if user exists, if not then create one with a random password
NEW_USER="fpepu"

# Check if user exists
USER_EXISTS=$(mysql -u "root" -sse \
    "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user='$NEW_USER');")

if [ "$USER_EXISTS" -eq 1 ]; then
    echo "MySQL user '$NEW_USER' already exists."
else
    # Generate a random password
    PASSWORD=$(openssl rand -base64 16)

    # Create the user and grant privileges
    mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" -e \
    "CREATE USER '$NEW_USER'@'localhost' IDENTIFIED BY '$PASSWORD';
     GRANT ALL PRIVILEGES ON *.* TO '$NEW_USER'@'localhost';
     FLUSH PRIVILEGES;"

    echo "MySQL user '$NEW_USER' created with password: $PASSWORD"
fi
}
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
      local domain
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
