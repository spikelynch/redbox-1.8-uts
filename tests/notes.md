# Outline of tests

## Functionality

* basic smoke tests - visit site, click links
* authenticate - log in and log out as a normal and a privileged user
* DMPs - log in as normal user, add a DMP, search for it
* DMP ownership:
  - change ownership of a DMP
  - see if the new owner can modify it
  - see if the old owner can modify it
  - same tests with a privileged user
* datasets: workflow - progress a dataset from draft to published
* datasets: OAI-PMH - check that the published dataset is in the feed
* DMP creation and retrieval
  
## Migration

This requires two servers: the existing live one and the test migration server. Poll the old live site via one of the harvest URLs and look up the
records in the new server.

# Authentication

fascinator.home = /opt/redbox/home

Basic internal authentication is set up in /opt/redbox/home/security:

users.properties - list of users and encrypted passwords
admin=03e65e6041a3855fc5bb738ab4cd96fb ...

roles.properties - list of users and their roles
admin=admin,reviewer,librarian,researcher,guest

## default passwords

admin - rbadmin
researcher - researcher
researcher2 - researcher2
others - ?

AAF plugin - trying to get it working on test box

- the old Shibboleth plugin doesn't look like it's compatible with 1.8
and is giving a template library error.

- plan for now: write the authentication tests around local users and
  then port that to AAF when I have time to sort out the FastAAF plugin
