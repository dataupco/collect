///////////////
// composite (mashup)
//
//  Usage: GET /api/{name}/*
//  Resources:
//    access: params, api(name,options,callback), query(params,callback), ingest(data,callback)
//    options: method, uri
///////////////

module.exports = function(idValue, secretValue) {
  var config = {};
  config.name='Book Mashup';
  config.enabled=true;
  config.type = 'composite';
  config.buildComposite = function(access, options, done) {
    // access: params, api(name,options,callback), query(params,callback), ingest(data,callback)
    // options: method, uri 

    console.log('execute mashup1 with uri: ' + options.uri);

    var body = {};
    body.reader = 'me';
    body.books = [];

    var queryParams = { 
      '_meta.api~in' : 'pearson~mashup1', 
      'books.title~rei' : '('+ access.params.book1 +'|'+ access.params.book2 +')' 
    };

    access.query(queryParams,function(data) {

      // check to see if these books are already in storage
      if(Array.isArray(data) && data.length>0) {
        body.books = data;
        if(data.length>=2) {
          done(null,body);
          return;
        }
      }

      access.api('pearson',{ method : 'GET', uri : '/penguin/classics/v1/books?title=' + access.params.book1 },function(book1) {
        if(book1 && book1.books && book1.books.length>0) {
          body.books.push(book1);
        }

        access.api('pearson',{ method : 'GET', uri : '/penguin/classics/v1/books?title=' + access.params.book2 },function(book2) {
          if(book2 && book2.books && book2.books.length>0) {
            body.books.push(book2);
          }

          if(body.books.length > 0) {
            access.ingest(body.books, function(data) {
              // error, body
              done(null,body);
            });
          }
          else {
            done(null,body);
          }
        });
      });
    });
  };

  return config;
};
