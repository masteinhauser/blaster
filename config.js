global.debug = false;

exports.writers = [
   couchdb: {
      driver: "couchdb",
      server: "127.0.0.1",
      name  : "logs"
   }
   pgsql: {
      driver: "pgsql",
      server: "127.0.0.1",
      name  : "logs"
   }
];

exports.files = [
   {
      path    : "/tmp/web.log",
      parser  : "apache_combined_session",
      filters : {
           pre: [],
          post: []
      },
      writer  : "couchdb"
   }
];
