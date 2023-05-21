HPW=`doveadm pw -s SHA512-CRYPT -p $2 | cut -c 15-`
#echo $HPW
mysql -e "INSERT INTO mailserver.virtual_users (domain_id, password , email) VALUES ('$3', '$HPW', '$1')"

