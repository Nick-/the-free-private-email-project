read -p "Enter Email Domain (cheapbusiness.email): " domain

if [ -z "$domain" ]
then
      echo "Using default domain (cheapbusiness.email)"
      domain='cheapbusiness.email'
fi

echo "Setting Up Dockerfile for $domain"
find . -name '*' -type f -exec sed -i -e "s/cheapbusiness.email/$domain/g" {} \;
cd cheapbusiness.email
npm install --save
