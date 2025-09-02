HPW=`doveadm pw -s SHA512-CRYPT -p $2 | cut -c 15-`
#echo $HPW
mysql -e "UPDATE mailserver.virtual_users SET password = '$HPW' WHERE email = '$1'"

