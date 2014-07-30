///////////////
// webhook - for use by 3rd parties to push data
// 
//  Security: Basic Auth
//  Auth Test: GET  /hook/{name}/{id}  
//  Execution: POST /hook/{name}/{id}  
//  Resources: 
//    access: params, body, api(name,options,callback), query(params,callback), ingest(data,callback)
//    options: method, uri 
///////////////

module.exports = function() {
  var config = {};
  config.name='Skeleton Webhook';
  config.enabled=true;
  config.type = 'webhook';
  config.buildWebhook = function(access, options, done) {

    console.log('execute webhook1 with uri: ' + options.uri);

    var book1Param = access.body.book1 ? access.body.book1 : access.params.book1;
    var book2Param = access.body.book2 ? access.body.book2 : access.params.book2;

    var body = {};
    body.reader = 'me';
    body.books = [];

    var queryParams = { 
      '_meta.api~in' : 'pearson~webhook1', 
      'books.title~rei' : '('+ book1Param +'|'+ book2Param +')' 
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

      access.api('pearson',{ method : 'GET', uri : '/penguin/classics/v1/books?title=' + book1Param },function(book1) {
        if(book1 && book1.books && book1.books.length>0) {
          body.books.push(book1);
        }

        access.api('pearson',{ method : 'GET', uri : '/penguin/classics/v1/books?title=' + book2Param },function(book2) {
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
