#makejs#

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
	

##Usage##
See makejs.conf for an example build conf.  This example includes two projects, and shows how one project can depend on another.

General usage:

    makejs BUILD_TARGET BUILD_PATH {--watch}

To see the examples, build them:

    makejs glamrock build/glamrock
    makejs example build/example

You can also make makejs watch the files and rebuild when they are modified by using the --watch switch:

    makejs example build/example




##Configuration Layout##
The configuration is laid out in the following fashion:

- Build Target
	- Version number in Major.Minor.Build
	- Prerequisite Build Targets
	- Build Phases:
		- Copy
			- Files
				- Source File: Destination Directory
		- Compress
			- Settings
			- Files
				 - Destination File
					- List of files
		- Alter
			- Files
				- Source File: Destination Directory
		- Manifest
			- Name of manifest
			- Cache
				- List of files to cache

###Build Targets###
A conf con contain any number of build targets, which might also reference other build targets.  

###Versioning###
makejs uses a Major.Minor.Build versioning scheme and will auto-increment the version with each attempted build.  You can specify that any file generated can have the version number inserted into it's name by using {VERSION} in the file names for targets in the conf.  See the include sample configuration file for more details.

###Pre-Requisites###
You can specify a list of other build targets that will be included in the build of your main target (the one you specified on the command line).

###Copy Build Phase###
The copy build phase simply copies the source file to destination directory.  You can use wildcards, but note that copies are not recursive, so you must specify
any sub-directories to be copied as well.  

###Compress Build Phase###
The build phase will take a list of files, concatenate them together and then run it through yui-compressor.  You can specify different settings for this:

| Setting | Description |
| ------- | ----------- |
| skip    | Skip compression |
| nomunge | Don't munge/obfuscate the output |
| preserve-semi | Preserve semi-colons |
| optimize | Allow yui-compressor to make micro optimizations |
| line-break | Break the output at x # of characters per line |

Following the settings, a list of destinations will be specified, beneath the destination the list of files that are built into the destination.  For example:

    files:
      js/glam.rock.min.{VERSION}.js:
        - projects/glamrock/js/iscroll.js
        - projects/glamrock/js/sprintf.js
        - projects/glamrock/js/jquery.hashchange.js
        - projects/glamrock/js/date.format.1.2.3.js
        - projects/glamrock/js/glam.rock.js
        - projects/glamrock/js/glam.rock.helpers.js
        - projects/glamrock/js/controls/*.js

The above would produce a file named glam.rock.min.X.X.X.js that consists of all the files listed beneath it.  Wildcards are allowed.

###Alter Phase###
The alter phase takes an input file, or any number of them, and modifies them by replacing script/css blocks with the filenames of the newly generated files.

For this to happen, you need to surround your script and link tags with BEGIN/END html comments like this:

    <!-- BEGIN glamrock -->
    <script type="text/javascript" src="../glamrock/js/jquery-1.4.3.min.js"></script>
    <script type="text/javascript" src="../glamrock/js/jquery.tmpl.min.js"></script>

    <script type="text/javascript" src="../glamrock/js/date.format.1.2.3.js"></script>
    <script type="text/javascript" src="../glamrock/js/iscroll.js"></script>
    <script type="text/javascript" src="../glamrock/js/jquery.hashchange.js"></script>
    <script type="text/javascript" src="../glamrock/js/sprintf.js"></script>

    <script type="text/javascript" src="../glamrock/js/glam.rock.js"></script>
    <script type="text/javascript" src="../glamrock/js/glam.rock.helpers.js"></script>

    <link rel="stylesheet" type="text/css" href="../glamrock/css/reset.css" />
    <link rel="stylesheet" type="text/css" href="../glamrock/css/glam.rock.css" />
    <!-- END glamrock -->

The BEGIN/END blocks are marked with the build target's name, in this case 'glamrock'.

When the alter phase is executed, that block will be replaced with:

    <script type='text/javascript' src='js/jquery-1.4.3.min.js'></script>
    <script type='text/javascript' src='js/jquery.tmpl.min.js'></script>
    <script type='text/javascript' src='js/glam.rock.min.0.0.81.js'></script>
    <link rel='stylesheet' type='text/css' href='css/glam.rock.min.0.0.81.css' />

###Manifest Phase###
This phase generates an HTML5 Cache Manifest for your application.  Take note that it will only generate a manifest if a name for the manifest is specified.  For
some build targets, it doesn't make sense to build this manifest because it's not an app, but it does make sense to specify which files should be included
in the manifest for any child projects.  See the example configuration for details.


## About ##

I wrote this in a day because I couldn't find something, other than Apache Ant, that did everything I needed.  YMMV.

Yes, it's written in PHP.

For further info see:  http://interfacelab.com/introducing-makejs






