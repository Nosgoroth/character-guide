<?php

////////////////
//// CONFIG ////
////////////////

$CONFIGPATH = "../";
$CONFIGFILE = "config.yaml";

////////////////
// END CONFIG //
////////////////

if (!file_exists($CONFIGPATH."vendor/autoload.php")) {
	die("Couldn't find Composer autoload. Make sure that you have configured \$CONFIGPATH in _common.php properly.");
}
require_once($CONFIGPATH."vendor/autoload.php");




if (!file_exists($CONFIGPATH.$CONFIGFILE)) {
	die("Couldn't read config.yaml.");
}
$yamlraw = file_get_contents($CONFIGPATH.$CONFIGFILE);

try {
	$config = Symfony\Component\Yaml\Yaml::parse($yamlraw, true);
} catch (Symfony\Component\Yaml\Exception\ParseException $e) {
	die("Error parsing config.yaml.");	
}


$datafile = ( isset($config["datafile"]) ? $config["datafile"] : "data.yaml" );

if (!file_exists($CONFIGPATH.$datafile)) {
	die("Couldn't read data.yaml.");
}
$yamlraw = file_get_contents($CONFIGPATH.$datafile);

try {
	$characterData = Symfony\Component\Yaml\Yaml::parse($yamlraw, true);
} catch (Symfony\Component\Yaml\Exception\ParseException $e) {
	die("Error parsing data.yaml.");	
}
