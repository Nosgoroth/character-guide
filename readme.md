# Readme

## Installation

1. Copy the contents of `public` to a public-facing directory being served.
2. Copy `composer.json`, `composer.lock`, `config.yaml` and `data.yaml` somewhere not accessible.
3. Run `composer install` in that directory to install Composer dependencies.
3. Edit `_common.php` to make `$CONFIGPATH` point to the path where `config.yaml` is. Can be relative or absolute.
4. Edit `config.yaml` and `data.yaml` to your liking.

## Editing

Just edit your `data.yaml` file to add or modify characters.
