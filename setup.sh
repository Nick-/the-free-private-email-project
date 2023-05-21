read -p "Enter Email Domain: " domain
echo "Setting Up Dockerfile for nicholas@$domain"

find . -name '*' -exec sed -i -e "s/cheapbusiness.email/$domain/g" {} \;


