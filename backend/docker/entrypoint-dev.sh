#!/bin/bash

wait_for() {
    local _host=$1
    local _port=$2
    echo "*** $(date +"%F %T (%Z)") [Entrypoint] start wait for $_host:$_port";
    while ! nc -w 10 -zv $_host $_port;
    do
        echo "$_host:$_port unavailable, waiting";
        sleep 3s;
    done
}

wait_for $POSTGRES_HOST $POSTGRES_PORT

npm run knex:migrate && npm run start:dev