class Formatter {
    constructor(){

    }

    autolink (_$el, _target='_blank') {

        let $link, $node, findLinkNode, k, lastIndex, len, linkNodes, match, re, replaceEls, subStr, text, uri


        if (_$el == null) {
          throw Error('Need Element')
        }
        
        let $el = $('<div class"_pre_format_ele">'+  (_$el.val() || _$el.html()) +'</div>' )
        

        linkNodes = []

        findLinkNode = function($parentNode) {
          return $parentNode.contents().each(function(i, node) {
            var $node, text;
            $node = $(node);
            if ($node.is('a') || $node.closest('a, pre', $el).length) {
              return;
            }
            if (!$node.is('iframe') && $node.contents().length) {
              return findLinkNode($node);
            } else if ((text = $node.text()) && /https?:\/\/|www\./ig.test(text)) {
              return linkNodes.push($node);
            }
          });
        }

        findLinkNode($el)

        re = /(https?:\/\/|www\.)[\w\-\.\?&=\/#%:,@\!\+]+/ig;
        for (k = 0, len = linkNodes.length; k < len; k++) {
          $node = linkNodes[k];
          text = $node.text();
          replaceEls = [];
          match = null;
          lastIndex = 0;
          while ((match = re.exec(text)) !== null) {
            subStr = text.substring(lastIndex, match.index);
            replaceEls.push(document.createTextNode(subStr));
            lastIndex = re.lastIndex;
            uri = /^(http(s)?:\/\/|\/)/.test(match[0]) ? match[0] : 'http://' + match[0];
            $link = $("<a target=\""+_target+"\" href=\"" + uri + "\" rel=\"nofollow\"></a>").text(match[0]);
            replaceEls.push($link[0]);
          }
          replaceEls.push(document.createTextNode(text.substring(lastIndex)));

          $node.replaceWith($(replaceEls));
        }

        return $el
    }

}


let _formatter = new Formatter()

export default _formatter