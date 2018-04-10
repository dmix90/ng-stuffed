https://medium.freecodecamp.org/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec

https://success.outsystems.com/Support/Enterprise_Customers/Installation/Install_a_trusted_root_CA__or_self-signed_certificate




for firefox : openssl pkcs12 -export -in server.crt -inkey server.key -out server.p12


In Firefox, navigate to about:config and set the security.enterprise_roots.enabled parameter to true.