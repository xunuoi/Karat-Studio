/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.auto();
 * return res.auto(data);
 * return res.auto('auth/login', data);
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function autoRenderView (options, data) {

  // Get access to `req`, `res`, & `sails`
  let req = this.req;
  let res = this.res;
  // let sails = req._sails;

  // sails.log.silly('res.auto() :: Auto Render View response')
  

  /**
   * @bug: wantsJSON错误
   * CustomResponse中，wantsJSON判断的第一条：if this looks like an AJAX request，
   * 通过X-Requested-With:XMLHttpRequest，
   * 导致第一条符合，结果使wantsJSON为true.
   * 这个结果，护士了Accetp和Content-Type等的内容，导致返回错误
   * 
   
   * 文档： https://github.com/balderdashy/sails-docs/blob/master/reference/req/req.wantsJSON.md
   * Details

      Here is the specific order in which req.wantsJSON inspects the request. If any of the following match, subsequent checks are ignored.

      A request "wantsJSON" if:

      if this looks like an AJAX request
      if this is a virtual request from a socket
      if this request DOESN'T explicitly want HTML
      if this request has a "json" content-type AND ALSO has its "Accept" header set
      if req.options.wantsJSON is truthy
   */
  if(req.headers['accept'] && req.headers['accept'].search('text/html') != -1 ||
    req.headers['content-Type'] && req.headers['content-Type'].search('text/html') != -1 ) req.wantsJSON = false
  

  //inspect mobile
  let ua = req.headers['user-agent']
  if(ua.search('Mobile') == -1){ 
    //pc , go on
    
  }else {
    //mobile
    data ? 
      data['_is_mobile'] = true : 
      data = {'_is_mobile': true}
  }

  // Set status code
  res.status(200);
  // If appropriate, serve data as JSON(P)
  if (req.wantsJSON) {
    return res.jsonx(data);
  }

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? { view: options } : options || {};

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.render(options.view, data)
    /**
     * @debug 
     * if use res.view, the is_mobile in data, will lost!!??
     */
    // return res.view(options.view, { data: data });
  }

  // If no second argument provided, try to serve the implied view,
  // but fall back to sending JSON(P) if no view can be inferred.
  else return res.guessView({ data: data }, function couldNotGuessView () {
    return res.jsonx(data);
  });

};
