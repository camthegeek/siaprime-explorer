# siaprime-explorer

Okay, here we go.

## Focus.
We have put a better focus on this explorer to ensure details are accurate.

## Speed. I am speed.
This explorer can fully synchronize on any system much faster than others. Additionally, we implemented measures into this explorer to ensure page load speeds are quick and not bogged down due to massive amounts of data being fetched repetitively (cache). 

## Versatile.
Any system can run this explorer.

## Usage
There are multiple components to this explorer. 

Be sure to have your Sia/SCP daemon running and fully sychronized. 

Prior to starting up the explorer, be sure to make your choice of database. By default, we are using PostgreSQL. However, MySQL/MariaDB and other databases are supported. 

Once database is setup with a user, you may run the explorer.

In the main directory, simply do the following:
* `npm install`
* `node init --module core`

After core has started, it should start sychronizing from 0 to current height and saving all data to your SQL table. 

To run the API: `node init --module api`

If you ran into errors and need to reset your SQL database: `node init --module reset`

To run the website
* `cd web`
* `npm install`
* `npm run start` (runs dev-mode on port :3000);

More details to come.

### Powered by
On the backend, we use the following technologies.
* NodeJS
* ExpressJS
* KnexJS
* PostgreSQL

For the front end.
* React
* React-Bootstrap (icons included)
* Axios 
* and many other packages.