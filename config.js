exports.db = {
   driver: "couchdb",
   server: "127.0.0.1",
   name  : "logs"
};

exports.files = [
   {
      path    : "/tmp/web.log",
      type    : "combined_session",
      parser  : "apache_combined_session",
      filters : {
           pre: [],
          post: []
      }
   }
];
