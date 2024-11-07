#!/bin/sh

awk "/$1:/"' {print $2,$10}' /proc/net/dev
