makejs
======

Command line utility for "building" a javascript heavy html5 app.  

Requires:

  * yui-compressor
  * php5-cli
  * libyaml extension php

Optionally:

  * inotify extension for php

If you are using debian/ubuntu:

    sudo apt-get install yui-compressor

	sudo apt-get install libyaml-dev
    sudo pecl install yaml-beta
    sudo sh -c "echo 'extension=yaml.so' > /etc/php5/conf.d/libyaml.ini"
	
	sudo pecl install inotify-beta
    sudo sh -c "echo 'extension=inotify.so' > /etc/php5/conf.d/inotify.ini"
	

Usage
-----
See makejs.conf for an example build conf.  This example includes two projects, and shows how one project can depend on another.

To see the examples, build them:

    makejs glamrock build/glamrock
    makejs example build/example

You can also make makejs watch the files and rebuild when they are modified by using the --watch switch:

    makejs example build/example


