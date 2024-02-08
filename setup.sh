read -p "Enter Email Domain: " domain
echo "Setting Up Dockerfile for nicholas@$domain"

find . -name '*' -type f -exec sed -i -e "s/cheapbusiness.email/$domain/g" {} \;


