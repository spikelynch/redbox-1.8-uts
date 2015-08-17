#!/bin/bash
#
# this script sets the environment for other fascinator scripts
#

export SERVER_URL="http://redboxvm/"
export LOCAL_PORT="9000"
export PROJECT_HOME="/opt/redbox"
export AMQ_PORT="9101"
export AMQ_STOMP_PORT="9102"
export SMTP_HOST="localhost"
export ADMIN_EMAIL="admin@localhost"
export MINT_SERVER="http://redboxvm:9001"
export MINT_AMQ="http://redboxvm:9201"
export NON_PROXY_HOSTS="localhost"

# set fascinator home directory
if [ -z "$TF_HOME" ]; then
	export TF_HOME="$PROJECT_HOME/home"
fi
export REDBOX_VERSION="1.9-UTS"
export FASCINATOR_HOME="$TF_HOME"

# java class path
export CLASSPATH="plugins/*:lib/*"

# jvm memory settings
# all config start from -Xdebug is only used by developers for debugging.
#JVM_OPTS="-XX:MaxPermSize=512m -Xmx512m -Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=4000,suspend=n"

JVM_OPTS="-XX:MaxPermSize=512m -Xmx512m"

# logging directories
export SOLR_LOGS=$TF_HOME/logs/solr
export JETTY_LOGS=$TF_HOME/logs/jetty
export ARCHIVES=$TF_HOME/logs/archives
if [ ! -d $ARCHIVES ]
then
    mkdir -p $ARCHIVES
fi
if [ ! -d $JETTY_LOGS ]
then
    mkdir -p $JETTY_LOGS
fi
if [ ! -d $SOLR_LOGS ]
then
    mkdir -p $SOLR_LOGS
fi

# use http_proxy if defined
if [ -n "$http_proxy" ]; then
	_TMP=${http_proxy#*//}
	PROXY_HOST=${_TMP%:*}
	_TMP=${http_proxy##*:}
	PROXY_PORT=${_TMP%/}
	echo " * Detected HTTP proxy host:'$PROXY_HOST' port:'$PROXY_PORT'"
	PROXY_OPTS="-Dhttp.proxyHost=$PROXY_HOST -Dhttp.proxyPort=$PROXY_PORT -Dhttp.nonProxyHosts=$NON_PROXY_HOSTS"
else
	echo " * No HTTP proxy detected"
fi

# jetty settings
JETTY_OPTS="-Djetty.port=$LOCAL_PORT -Djetty.logs=$JETTY_LOGS -Djetty.home=$PROJECT_HOME/server/jetty"

# solr settings
SOLR_OPTS="-Dsolr.solr.home=$PROJECT_HOME/solr"

# directories
CONFIG_DIRS="-Dfascinator.home=$TF_HOME -Dportal.home=$PROJECT_HOME/portal -Dstorage.home=$PROJECT_HOME/storage"

# mint integration
MINT_OPTS="-Dmint.proxy.server=$MINT_SERVER -Dmint.proxy.url=$MINT_SERVER/mint -Dmint.amq.broker=$MINT_AMQ"

# additional settings
EXTRA_OPTS="-Dserver.url.base=$SERVER_URL -Damq.port=$AMQ_PORT -Damq.stomp.port=$AMQ_STOMP_PORT -Dsmtp.host=$SMTP_HOST -Dadmin.email=$ADMIN_EMAIL -Dredbox.version=$REDBOX_VERSION"

# Logging fix. Axis 1.4 (for Fedora) needs to know about the SLF4J Implementation
COMMONS_LOGGING="-Dorg.apache.commons.logging.LogFactory=org.apache.commons.logging.impl.SLF4JLogFactory"

# set options for maven to use
export JAVA_OPTS="$COMMONS_LOGGING $JVM_OPTS $JETTY_OPTS $SOLR_OPTS $PROXY_OPTS $CONFIG_DIRS $EXTRA_OPTS $MINT_OPTS"
