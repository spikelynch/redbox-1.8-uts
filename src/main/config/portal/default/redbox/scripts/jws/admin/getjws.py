import re
from com.nimbusds.jose import JWSObject
from com.nimbusds.jose import JWSHeader
from com.nimbusds.jose import JWSAlgorithm
from com.nimbusds.jose import Payload
from com.nimbusds.jose.crypto import MACSigner
from com.nimbusds.jose.crypto import MACVerifier 
from java.util import Date, HashMap
from java.lang import String, Integer, Long
from java.security import SecureRandom
from java.net import URLDecoder, URLEncoder
# A 'producer' of JWS. 
#
# Author: Shilo Banihit
#
# This serves as a simple way of verifying the user is authenticated and authorized in ReDBox.
# TODO: This is admin-specific. Create a base class for generic elements.
#
# Required configuration:
#     - A config file, e.g. "getjws.json" that has the "authserver" parent key.
#        - Must have child keys:
#            - name : Name of the application
#            - sharedKey : The shared key that must be shared with the consumer's server side components
#            - aud : The URL of the consumer where the JWS will be 'POST'ed. 
#            - iss : The URL of the producer application.
#            - expiry : The number of seconds when this token is valid.
#     - Configuration in the "applicationContext-security.xml" to protect this resource, specifying the roles. 
#        E.g. <intercept-url pattern="/**/jws/admin/**" access="hasRole('admin')" />
# Optional configuration:
#    - Support only HTTPS

class GetjwsData():
    def __init__(self):
        pass
    
    def __activate__(self, context):
        self.velocityContext = context
        self.log = self.vc("log")
        self.systemConfig = self.vc("systemConfig")
        self.session = self.vc("sessionState")
        self.response = self.vc("response")
        self.request = self.vc("request")
        self.msg = ""
        self.appId = None
        
        uri = URLDecoder.decode(self.request.getAttribute("RequestURI"))
        matches = re.match("^(.*?)/(.*?)/(.*?)/(.*?)/(.*?)$", uri)
        if matches and matches.group(5):    
            self.appId = matches.group(5)
            
        if not self.appId:
            self.msg = "No appId specified"
            self.log.error(self.msg)
            return
        self.log.debug("Getting configuration for: " + self.appId)
        self.consumerName = self.systemConfig.getString(None, "authserver", self.appId, "name")
        self.sharedKey = self.systemConfig.getString(None, "authserver", self.appId, "sharedKey")
        self.aud = self.systemConfig.getString(None, "authserver", self.appId, "aud")
        self.iss = self.systemConfig.getString(None, "authserver", self.appId, "iss")
        self.expiry = self.systemConfig.getInteger(None, "authserver", self.appId, "expiry")
        if not self.consumerName:
            self.msg = "Invalid configuration, no app name"
            self.log.error(self.msg)
            return
        if not self.sharedKey:
            self.msg = "Invalid shared Key"
            self.log.error(self.msg)
            return
        if not self.aud:
            self.msg = "Invalid aud"
            self.log.error(self.msg)
            return
        if not self.iss:
            self.msg = "Invalid iss"
            self.log.error(self.msg)
            return
        if not self.expiry:
            self.msg = "Invalid expiry"
            self.log.error(self.msg)
            return
                            
        # Because we don't trust the configuration
        current_user = self.vc("page").authentication.get_username()
        isAdmin = self.vc("page").authentication.is_admin()
        # Admin only... 
        if not isAdmin:
            self.msg = "Attempted to sign to an admin-only page"
            self.log.error(self.msg)
            return
        # Get the roles...
        typ = "[\"" + "\",\"".join(self.vc("page").authentication.get_roles_list()) + "\"]"
        # Generating signature...
        dtNow = Date().getTime()
        now = dtNow / 1000
        iat = now
        nbf = now - 1
        exp = now + self.expiry
        secRandom = SecureRandom()
        jti = Long.toString(dtNow) + "_" + Integer.toString(secRandom.nextInt())
        payload = Payload('{"iss":"%s",  "sub":"%s", "aud":"%s", "iat":"%s", "nbf":"%s", "exp":"%s", "jti":"%s", "typ":%s}' % (self.iss, current_user, self.aud, iat, nbf, exp, jti, typ))
        jwsHeader = JWSHeader(JWSAlgorithm.HS256)
        macSigner = MACSigner(self.sharedKey)
        jwsObject = JWSObject(jwsHeader, payload)
        jwsObject.sign(macSigner)
        self.jws = jwsObject.serialize()
        
    def getMsg(self):
        return self.msg
    
    def vc(self, index):
        if self.velocityContext[index] is not None:
            return self.velocityContext[index]
        else:
            print "ERROR: Requested context entry '" + index + "' doesn't exist"
            return None