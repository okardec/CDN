
// 2021 - MadInfinite 


//#region sliceCore
function sliceCode(content) {
    /// <summary>Possui métodos para converter GVCode em HTML ou removê-los de um texto.</summary>
    /// <param name="content" type="String">O texto contendo GVCode.</param>
    //#region propriedades privadas
    this._basicTags = new Array();
    this._specialTags = new Array();
    this._newLineChar = 'LnLn';
    this._maxImageWidth = null;
    this._maxImageHeight = null;
    this._maxFlashWidth = null;
    this._maxFlashHeight = null;
    this._content = '';
    this._forceMediaToUrl = false;
    this._allowSmileys = false;
    this._smileysLimit = 0;
    this._allowSize = false;

    this._noLoged = false;

    this.setNoLoged = function (i) {
        this._noLoged = i;
        return this; 
    };
    this._isNoLoged = function () {
        return this._noLoged;
    };

    this.setAllowSize = function (i) {
        this._allowSize = i;
        return this;
    };
    this._isAllowSize = function () {
        return this._allowSize;
    };
    this._isForceMediaToUrl = function () {
        return this._forceMediaToUrl;
    };
    this._getSmileysLimit = function () {
        return this._smileysLimit;
    };
    this._isAllowSmileys = function () {
        return this._allowSmileys;
    };
    this._setSpecialTags = function (specialTags) {
        this._specialTags = specialTags;
    };
    this._getSpecialTags = function () {
        return this._specialTags;
    };
    this._setBasicTags = function (basicTags) {
        this._basicTags = basicTags;
    };
    this._getBasicTags = function () {
        return this._basicTags;
    };
    this._getNewLineChar = function () {
        return this._newLineChar;
    };
    this._setContent = function (content) {
        this._content = content;
    };
    this._getContent = function () {
        return this._content;
    };
    this._getMaxImageWidth = function () {
        return this._maxImageWidth;
    };
    this._getMaxImageHeight = function () {
        return this._maxImageHeight;
    };
    this._getMaxFlashWidth = function () {
        return this._maxFlashWidth;
    };
    this._getMaxFlashHeight = function () {
        return this._maxFlashHeight;
    };
   
    this._fillAllTags = function () {
        var b;
        var a;
        //basic
        b = slice.list.code.tag.basic;
        a = new Array(b.B, b.I, b.S, b.U);
        this._setBasicTags(a);
        //special
        b = slice.list.code.tag.special;
        a = new Array(
            b.Code, b.User,
            b.Table, b.Email, b.Img,
            b.Url, b.Iurl, b.List,
            b.Youtube, b.Vimeo, b.Center, b.Quote,
            b.Flash, b.Color, b.T2, b.Video, b.Twitch, b.Twitter, b.Facebook, b.Instagram, b.Slide,
            b.T1, b.Spoiler, b.Left, b.Right, b.VideoFonte, b.ImageFonte, b.Tag 
        );
        this._setSpecialTags(a);

    };
    
    this._replaceSpecialTagColor = function (a) {
        var s = '';
        s += '<span style="color:' + a.attribute + '">' + a.element + '</span>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagCode = function (a) {
        //falta implementar
        var s = '';
        s = a.element;
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagT1 = function (a) {
        var s = '';
        s += '<div class="tag_t1">' + a.element + '</div>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagT2 = function (a) {
        var s = '';
        s += '<div class="tag_t2">' + a.element + '</div>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagList = function (a) {
        var type;
        switch (a.attribute) {
            case 'A':
                type = 'upper-alpha';
                break;
            case 'a':
                type = 'lower-alpha';
                break;
            case '1':
                type = 'decimal';
                break;
            default:
                type = 'square';
                break;
        }
        var items = a.element.split(this._getNewLineChar());
        var itemsA = new Array();
        var s = '';
        s += '<ol class="tag_list" style="list-style-type: ' + type + '">';
        var total = items.length;
        for (var n = 0; n != total; n++) {
            if (items[n].length < 1) {
                continue;
            }
            itemsA.push('<li>' + items[n] + '</li>');
        }
        s += itemsA.join('');
        s += '</ol>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagTable = function (a) {
        //driblar protocolos
        a.element = a.element.replace(new RegExp('://', "g"), ';,;,');

        var items = a.element.split(this._getNewLineChar());
        var itemsArray = new Array();
        var total = items.length;
        var s = '';
        for (var n = 0; n != total; n++) {
            if (items[n].length < 1) {
                continue;
            }
            var cols = items[n].split("//");
            s = '<tr>';
            for (var i = 0; i != cols.length; i++) {
                s += n == 0 ? '<th>' + cols[i] + '</th>' : '<td>' + cols[i] + '</td>';
            }
            s += '</tr>';
            itemsArray.push(s);
        }
        s = '<table class="tag_table">';
        s += itemsArray.join('');
        s += '</table>';
        //recolocar protocolos        
        s = s.replace(new RegExp(';,;,', "g"), '://');

        this._replacePiece(s, a.start, a.end);
    };
   
    this._replaceSpecialTagEmail = function (a) {
        a.attribute = a.attribute == false ? a.element : a.attribute;
        var s = '';
        s = '<a href="mailto:' + a.attribute + '">' + a.element + '</a>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagSpoiler = function (a) {
        a.attribute = a.attribute == false ? 'Spoiler' : a.attribute;
        var num = new String(Math.random()).substring(2);
        var s = '';

        s += '<div class="quote">';
        s += '<div class="quote-icon spoiler-icon"><i class="material-icons">error_outline</i></div>';

            s += '<div class="quote-content" id="spoiler_button_' + num + '" onclick="new sliceContainer(\'spoiler_body_' + num + '\').show();new sliceContainer(\'spoiler_button_' + num + '\').hide();">';
            s += 'Esta parte do texto foi marcado como <strong>Spoiler</strong>. Clique aqui para ver o contéudo.';
            s += '</div>';

            s += '<div class="quote-content" id="spoiler_body_' + num + '" style="display:none">';
            s += '<div>'+a.element+'</div>';
            s += '<div class="spoiler-bt-hide"><a href="javascript:void(0)" onclick="new sliceContainer(\'spoiler_body_' + num + '\').hide();new sliceContainer(\'spoiler_button_' + num + '\').show();" >« Ocultar spoiler</a></div>';
            s += '</div>';
             
        s += '</div>'; 
                 
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagFlash = function (a) {
        a.attribute = a.attribute == false ? '200,200' : a.attribute;
        var b = a.attribute.split(',');
        b[0] = b[0] > 0 ? b[0] : 200;
        b[1] = b[1] ? (b[1] > 0 ? b[1] : 200) : 200;

        var flash = new sliceFlash().setWidth(b[0]).setHeight(b[1]).setUrl(a.element);

        var s = '';
        s += flash.isInstalled() ? flash.getEmbed() : '<a href="javascript:void(0)" title="O plugin Adobe Flash não foi encontrado em seu navegador">[Conteúdo Flash]</a>';
        this._replacePiece(s, a.start, a.end);
    };

    this._replaceSpecialTagImg = function (a) {

        var id = 'div_image_' + new String(Math.random()).substring(2);

        this._replacePiece('<div id="' + id + '" class="article-media"><span style="color:red;">&laquo; Você deve estar logado para ver esta imagem &raquo;</span></div>', a.start, a.end);

        var url = a.element;
        var isHide = false;
        if (url.indexOf('hide:') >= 0) {
            url = url.replace('hide:', '');
            //console.log(url);
            url = window.atob(url);
            isHide = true;
        }


        //console.log(isHide);
        //console.log(url);

        if (new sliceContentHide().isProtect() == true && isHide) {
            ///metodo protegido
            //faz o prÃ©-carregamento, Ã© preciso das dimensÃµes antes
            if (!new sliceUser().isLogged() == false && new sliceContentHide().isHideByLogin() == true) {
                var image = new sliceImage();
                image.setUrl(url);
                if (this._getMaxImageWidth()) {
                    image.setMaxWidth(this._getMaxImageWidth());
                }
                if (this._getMaxImageHeight()) {
                    image.setMaxHeight(this._getMaxImageHeight());
                }
                image.onReady = function () {
                    if (!this.isValidResponse()) {
                        if (new sliceContentHide().isHideByLogin()) {
                            var s1 = '<span style="color:red;">&laquo; Você deve estar logado para ver esta imagem &raquo;</span>';
                            new sliceContainer(id).write(s1);
                        } else {
                            new sliceContainer(id).write('<a href="' + this.getUrl() + '" target="_blank">' + this.getUrl() + '</a>');
                        }
                    } else {

                        var user = new sliceUser();
                        if (user.isLogged()) {
                            var resized = this.needResize();
                            var a = this.getResizedDimension();
                            new sliceContainer(id).write(resized ? '<a href="javascript:void(0)" title="Clique para ver a imagem em tamanho original"><img src="' + this.getUrl() + '" ' + (this.allowSize ? 'width="' + a[0] + '" height="' + a[1] + '"' : '') + ' class="media-shadow"/></a>' : '<img src="' + this.getUrl() + '" ' + (this.allowSize ? 'width="' + a[0] + '" height="' + a[1] + '"' : '') + ' class="media-shadow" />');
                            //new sliceContainer(id).write(resized ? '<img src="' + this.getUrl() + '" width="' + a[0] + '" height="' + a[1] + '" />' : '<img src="' + this.getUrl() + '" width="' + a[0] + '" height="' + a[1] + '" />');

                            var d = document.getElement(id);
                            if (d) {
                                d.image = this;
                                d.onclick = function () {
                                    new sliceBox().setWidth(this.image._getWidth() > 1000 ? a[0] : this.image._getWidth()).setHeight(this.image._getHeight() > 900 ? a[1] : this.image._getHeight()).setContent(this.image.getUrl()).showImage();
                                }
                            }

                        } else {
                            //new sliceContainer(id).write('<a href="' + this.getUrl() + '" target="_blank">' + this.getUrl() + '</a>');
                            if (new sliceContentHide().isHideByLogin()) {
                                var s1 = '<span style="color:red;">&laquo; Você deve estar logado para ver esta imagem &raquo;</span>';
                                new sliceContainer(id).write(s1);
                            } else {
                                new sliceContainer(id).write('<a href="' + this.getUrl() + '" target="_blank">' + this.getUrl() + '</a>');
                            }
                        }
                    }
                }
                image.load();
            }   

            //////metodo normal
        } else {
            ////*******
            //faz o prÃ©-carregamento, Ã© preciso das dimensÃµes antes
            var image = new sliceImage();
            image.setUrl(url);
            if (this._getMaxImageWidth()) {
                image.setMaxWidth(this._getMaxImageWidth());
            }
            if (this._getMaxImageHeight()) {
                image.setMaxHeight(this._getMaxImageHeight());
            }
            image.onReady = function () {
                if (!this.isValidResponse()) {
                    new sliceContainer(id).write('<a href="' + this.getUrl() + '" target="_blank">' + this.getUrl() + '</a>');
                } else {
                    var resized = this.needResize();
                    var a = this.getResizedDimension();
                    new sliceContainer(id).write(resized ? '<a href="javascript:void(0)" title="Clique para ver a imagem em tamanho original"><img src="' + this.getUrl() + '" ' + (this.allowSize ? 'width="' + a[0] + '" height="' + a[1] + '"' : '') + ' class="media-shadow" /></a>' : '<img src="' + this.getUrl() + '" ' + (this.allowSize ? 'width="' + a[0] + '" height="' + a[1] + '"' : '') + ' class="media-shadow" />');
                    //new sliceContainer(id).write(resized ? '<img src="' + this.getUrl() + '" width="' + a[0] + '" height="' + a[1] + '" />' : '<img src="' + this.getUrl() + '" width="' + a[0] + '" height="' + a[1] + '" />');

                    var d = document.getElement(id);
                    if (d) {
                        d.image = this;
                        d.onclick = function () {
                            new sliceBox().setWidth(this.image._getWidth() > 1000 ? a[0] : this.image._getWidth()).setHeight(this.image._getHeight() > 900 ? a[1] : this.image._getHeight()).setContent(this.image.getUrl()).showImage();
                        }
                    }
                }
            }
            image.load();

            ////********
        }
    };
     
    this._replaceSpecialTagUrl = function (a) {
        a.attribute = a.attribute == false ? a.element : a.attribute;

        var isHide = false;
        var url = a.attribute;
        if (url.indexOf('hide:') >= 0) {
            //correÃ§Ã£o do bug, vejo se tem algum html dentro do bixo e tento recortar
            if (url.indexOf('>') >= 0 || url.indexOf('<') >= 0) {
                var s = url;
                s = s.slice((s.indexOf('hide:') + 5), s.indexOf(']', s.indexOf('hide:')));
                url = url.replace('hide:' + s, window.atob(s));
            } else {
                url = url.replace('hide:', '');
                url = window.atob(url);
            }
            isHide = true;
        }
        a.attribute = url;


        url = a.element;
        if (url.indexOf('hide:') >= 0) {
            //correÃ§Ã£o do bug, vejo se tem algum html dentro do bixo e tento recortar
            if (url.indexOf('>') >= 0 || url.indexOf('<') >= 0) {
                var s = url;
                s = s.slice((s.indexOf('hide:') + 5), s.indexOf(']', s.indexOf('hide:')));
                url = url.replace('hide:' + s, window.atob(s));
            } else {
                url = url.replace('hide:', '');
                url = window.atob(url);
            }
            isHide = true;
        }
        a.element = url;

        //hadicionar protocolo http se nÃ£o houver nenhum declarado
        if (a.attribute.indexOf('://') == -1) {
            a.attribute = 'http://' + a.attribute;
        }
        var s = '';
        s = '<a href="' + a.attribute + '" target="_blank">' + a.element + '</a>';

        if (new sliceContentHide().isProtect() == true) {
            if (new sliceContentHide().isHideByLogin() && isHide) {
                var user = new sliceUser();
                if (!user.isLogged()) {
                    s = '<span style="color:red;">&laquo; Você deve estar logado para ver este link &raquo;</span>';
                }
            }
        }

        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagIurl = function (a) {
        a.attribute = a.attribute == false ? a.element : a.attribute;

        var isHide = false;
        var url = a.attribute;
        if (url.indexOf('hide:') >= 0) {
            //correÃ§Ã£o do bug, vejo se tem algum html dentro do bixo e tento recortar
            if (url.indexOf('>') >= 0 || url.indexOf('<') >= 0) {
                var s = url;
                s = s.slice((s.indexOf('hide:') + 5), s.indexOf(']', s.indexOf('hide:')));
                url = url.replace('hide:' + s, window.atob(s));
            } else {
                url = url.replace('hide:', '');
                url = window.atob(url);
            }
            isHide = true;
        }
        a.attribute = url;

        url = a.element;
        if (url.indexOf('hide:') >= 0) {
            //correÃ§Ã£o do bug, vejo se tem algum html dentro do bixo e tento recortar
            if (url.indexOf('>') >= 0 || url.indexOf('<') >= 0) {
                var s = url;
                s = s.slice((s.indexOf('hide:') + 5), s.indexOf(']', s.indexOf('hide:')));
                url = url.replace('hide:' + s, window.atob(s));
            } else {
                url = url.replace('hide:', '');
                url = window.atob(url);
            }
            isHide = true;
        }

        a.element = url;

        //hadicionar protocolo http se nÃ£o houver nenhum declarado
        if (a.attribute.indexOf('://') == -1) {
            a.attribute = 'http://' + a.attribute;
        }
        var s = '';
        s = '<a href="' + a.attribute + '">' + a.element + '</a>';

        if (new sliceContentHide().isProtect() == true) {
            if (new sliceContentHide().isHideByLogin() && isHide) {
                var user = new sliceUser();
                if (!user.isLogged()) {
                    s = '<span style="color:red;">&laquo; Você deve estar logado para ver este link &raquo;</span>';
                }
            }
        }
        this._replacePiece(s, a.start, a.end);
    };

    this._replaceSpecialTagQuote = function (a) {
        var s = '';  
        //s += '<div class="quote">' + a.element + '</div>';
        s += '<div class="quote">';
        s += '<div class="quote-icon"><i class="material-icons">format_quote</i></div>';
        s += '<div class="quote-content">';
            s += a.element;
        s += '</div>';
        s += '</div>'; 

        this._replacePiece(s, a.start, a.end);
    };

    this._replaceSpecialTagCenter = function (a) {
        var s = '';
        s += '<div class="center">' + a.element + '</div>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagLeft = function (a) { 
        var s = '';
        s += '<div class="content_left"  style="line-height: 0px; overflow: auto;">' + a.element + '</div>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagRight = function (a) {
        var s = ''; 
        s += '<div class="content_right" style="line-height: 0px; overflow: auto;">' + a.element + '</div>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagTag = function (a) {
        var s = '';
        s += '<span><em>' + a.element + '</em></span>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagImageFonte = function (a) {
        var s = '';
        s += '<div class="content_image_fonte">' + a.element + '</div>';
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagVideoFonte = function (a) {
        var s = '';
        s += '<div class="content_video_fonte">' + a.element + '</div>';
        this._replacePiece(s, a.start, a.end);
    };


    this._replaceSpecialTagYoutube = function (a) {
        //define as dimensÃµes
        var b = new Array();
        if (this._getMaxFlashWidth() > 0 || this._getMaxFlashHeight() > 0) {
            var image = new sliceImage().setWidth(715).setHeight(410);
            if (this._getMaxFlashWidth() > 0) {
                image.setMaxWidth(this._getMaxFlashWidth());
            }
            if (this._getMaxFlashHeight() > 0) {
                image.setMaxHeight(this._getMaxFlashHeight());
            }
            b = image.getResizedDimension();
        } else {
            b = [
                this._getMaxFlashWidth() ? (this._getMaxFlashWidth() > 715 ? 715 : this._getMaxFlashWidth()) : 715,
                this._getMaxFlashHeight() ? (this._getMaxFlashHeight() > 410 ? 410 : this._getMaxFlashHeight()) : 410
            ];
        }
        function _getId(url) {
            var b;
            var id = '';
            b = url.indexOf('v=');
            if (b == -1) {
                b = url.indexOf('v/');
            }
            //se ainda for -1 o link estÃ¡ errado
            if (b == -1) {
                return '';
            }
            //recortar o fragmento
            id = url.substring(b + 2);
            //pode haver mais parÃ¢metros no link, entÃ£o remover
            b = id.indexOf('&');
            if (b > -1) {
                id = id.substring(0, b);
            }
            return id;
        }
        var viewControls = b[1] > 150;
        if (!this._isAllowSize()) {
            b[0] = '100%';
            b[1] = '100%';
            viewControls = true;
        }
        var ytId = _getId(a.element);
        var s = '';
        /*s += '<div class="code_youtube video-container" id="code_youtube">'; 
        s += new sliceYoutube(ytId).setWidth('+b[0]+').setHeight(b[1]).setCaption(true).setFullscreen(true).setHd(true).setControls(viewControls).setModestBranding(b[1] > 150).getEmbedCode();
        s += '</div>'; //code_youtube
        */
        s += '<span class="youtube-protect-sbbcode">Vídeo do Youtube<span>' + btoa(ytId) + '</span></span>';
                 
                
        this._replacePiece(s, a.start, a.end);
    };
    
    this._replaceSpecialTagVimeo = function (a) {
        //define as dimensÃµes
        var b = new Array();
        if (this._getMaxFlashWidth() > 0 || this._getMaxFlashHeight() > 0) {
            var image = new sliceImage().setWidth(715).setHeight(410);
            if (this._getMaxFlashWidth() > 0) {
                image.setMaxWidth(this._getMaxFlashWidth());
            }
            if (this._getMaxFlashHeight() > 0) {
                image.setMaxHeight(this._getMaxFlashHeight());
            }
            b = image.getResizedDimension();
        } else {
            b = [
                this._getMaxFlashWidth() ? (this._getMaxFlashWidth() > 715 ? 715 : this._getMaxFlashWidth()) : 715,
                this._getMaxFlashHeight() ? (this._getMaxFlashHeight() > 410 ? 410 : this._getMaxFlashHeight()) : 410
            ];
        }
        function _getId(url) {
            var b;
            var id = '';
            b = url.indexOf('vimeo.com/');
            //se ainda for -1 o link estÃ¡ errado
            //console.log(b);
            if (b == -1) {
                return '';
            }
            //recortar o fragmento
            id = url.substring(b + 10);
            return id;
        }

        if (!this._isAllowSize()) {
            b[0] = '100%';
            b[1] = '100%';
        }
        var vId = _getId(a.element);
        var s = '';
        /*
        //s += '<div class="code_youtube" id="code_vimeo">';
        s += '<div class="code_youtube video-container" id="code_vimeo">';
        s += new sliceVimeo(vId).setWidth(b[0]).setHeight(b[1]).setFullscreen(true).getEmbed();
        s += '</div>'; //code_youtube 
        */
        //s += '<span class="video-protect-sbbcode">Vídeo Vimeo <span>' + btoa('https://vimeo.com/' + vId) + '</span></span>';   
         s += '<span class="url-protect-sbbcode">URL<span>' + btoa('https://vimeo.com/' + vId) + '</span></span>'
        
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagTwitch = function (a) {
        //define as dimensÃµes
        var b = new Array();
        
        function _getId(url) {
            var b;
            var id = '';
            b = url.indexOf('www.twitch.tv/');
            //se ainda for -1 o link estÃ¡ errado
            //console.log(b);
            if (b == -1) {
                return '';
            }
            //recortar o fragmento
            id = url.substring(b + 14);
            return id;
        }

        
        var vId = _getId(a.element);
        var s = '';       
        //s += '<span class="video-protect-sbbcode">Vídeo Twitch <span>' + ('https://www.twitch.tv/' + vId) + '</span></span>';
        s += '<span class="url-protect-sbbcode">URL<span>' + btoa('https://www.twitch.tv/' + vId) + '</span></span>'

        this._replacePiece(s, a.start, a.end);
    };
   
    this._replaceSpecialTagTwitter = function (a) {
        //define as dimensÃµes
        var b = new Array();
        
        function _getId(url) {
            var b;
            var id = '';
            b = url.indexOf('twitter.com/');
            //se ainda for -1 o link estÃ¡ errado
            //console.log(b);
            if (b == -1) {
                return '';
            }
            //recortar o fragmento
            id = url.substring(b + 12);
            return id;
        } 

        
        var vId = _getId(a.element);
        var s = '';      
        s += '<span class="twitter-protect-sbbcode">Twitter<span>' + btoa('https://twitter.com/' + vId) + '</span></span>';
        
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagInstagram = function (a) {
        //define as dimensÃµes
        var b = new Array();
        
        function _getId(url) {
            var b;
            var id = '';
            b = url.indexOf('instagram.com/');
            //se ainda for -1 o link estÃ¡ errado
            //console.log(b);
            if (b == -1) {
                return '';
            }
            //recortar o fragmento
            id = url.substring(b + 14);
            return id;
        }

        
        var vId = _getId(a.element);
        var s = '';      
        s += '<span class="instagram-protect-sbbcode">Instagram<span>' + btoa('https://www.instagram.com/' + vId) + '</span></span>';
        
        this._replacePiece(s, a.start, a.end);
    };
    this._replaceSpecialTagFacebook = function (a) {
        //define as dimensÃµes
        var b = new Array();
        
        function _getId(url) {
            var b;
            var id = '';
            b = url.indexOf('facebook.com/');
            //se ainda for -1 o link estÃ¡ errado
            //console.log(b);
            if (b == -1) {
                return '';
            }
            //recortar o fragmento
            id = url.substring(b + 13);
            return id;
        }

        
        var vId = _getId(a.element);
        var s = '';      
        s += '<span class="facebook-protect-sbbcode">Facebook<span>' + btoa('https://www.facebook.com/' + vId) + '</span></span>';
        
        this._replacePiece(s, a.start, a.end);
    };
    
    this._replaceSpecialTagSlide = function (a){
        var s = '';

        var content =  a.element;

        while (true) {
            var p = content.indexOf("\n");
            if (p == -1) {
                break;
            }
            content = content.replace("\n", ";;;");
        }

        s += '<span class="slide-sbbcode">Slide <span>' + content + '</span></span>';
        this._replacePiece(s, a.start, a.end);
    }



    this._replaceSpecialTagHr = function () {
        var tag = "\\[hr\\]";
        var regex = new RegExp(tag, "ig");
        var content = this._getContent();

        content = content.replace(regex, '<div class="hr"></div>');

        this._setContent(content);
    };
    this._replacePiece = function (text, begin, end) {
        var content = this._getContent();
        var length = content.length;
        content = content.substring(0, begin) + text + (end < length ? content.substring(end, length) : '');
        this._setContent(content);
    };
    this._findDataToSpecialTag = function (tag) {
        var content = this._getContent();
        var tagBegin = "\\[" + tag + "(.*?)\\]";
        var tagEnd = "\\[/" + tag + "\\]";

        var regexBegin = new RegExp(tagBegin, "i");
        var regexEnd = new RegExp(tagEnd, "i");

        //tem tag de início?
        var b1, b2;
        b1 = content.search(regexBegin);
        if (b1 == -1) {
            return false;
        }
        //tem tag de encerramento?
        b2 = content.search(regexEnd);
        if (b2 == -1) {
            return false;
        }
        //tag de encerramento precisa estar à frente da de início
        if (b1 >= b2) {
            return false;
        }
        //variáveis de retorno
        var attribute, element, start, end;
        //onde começa
        start = b1;
        //onde termina
        end = b2 + new String('[/' + tag + ']').length;
        //recorta
        content = content.substr(start, end - start);
        //atributo
        var b3 = new String('[' + tag + '=').length;
        var b4 = content.indexOf(']');
        if (b4 == -1) {
            return false;
        }
        //se não tiver atributo, o valor é false
        attribute = b4 > b3 ? content.substr(b3, b4 - b3) : false;
        element = content.substring(b4 + 1, content.length - new String('[/' + tag + ']').length);

        var o = new Object();
        o.attribute = attribute,
        o.element = element;
        o.start = start;
        o.end = end;

        return o;
    };
    
    this._replaceSpecialTags = function () {
        ///<summary>Substitui as tags básicas.</summary>
        this._replaceSpecialTagHr();
        //tag hr é um caso especial, só tem tag de início e nao de fim
        var total = this._getSpecialTags().length;
        var b = false;
        for (var n = 0; n != total; n++) {
            var tag = this._specialTags[n];
            while (true) {
                b = false;
                var data = this._findDataToSpecialTag(tag);
                if (data == false) {
                    break;
                }
                switch (tag) {
                    case slice.list.code.tag.special.Code:
                        this._replaceSpecialTagCode(data);
                        break;
                    case slice.list.code.tag.special.Url:
                        this._replaceSpecialTagUrl(data);
                        break;
                    case slice.list.code.tag.special.Iurl:
                        this._replaceSpecialTagIurl(data);
                        break;
                    case slice.list.code.tag.special.Quote:
                        this._replaceSpecialTagQuote(data);
                        break;
                    case slice.list.code.tag.special.Youtube:
                        this._replaceSpecialTagYoutube(data);
                        break;
                    case slice.list.code.tag.special.Vimeo:
                        this._replaceSpecialTagVimeo(data);
                        break;
                    case slice.list.code.tag.special.Img:
                        this._replaceSpecialTagImg(data);
                        break;
                    case slice.list.code.tag.special.List:
                        this._replaceSpecialTagList(data);
                        break;
                    case slice.list.code.tag.special.Table:
                        this._replaceSpecialTagTable(data);
                        break;
                    case slice.list.code.tag.special.Color:
                        this._replaceSpecialTagColor(data);
                        break;
                    case slice.list.code.tag.special.T1:
                        this._replaceSpecialTagT1(data);
                        break;
                    case slice.list.code.tag.special.T2:
                        this._replaceSpecialTagT2(data);
                        break;
                    case slice.list.code.tag.special.Spoiler:
                        this._replaceSpecialTagSpoiler(data);
                        break;
                    case slice.list.code.tag.special.Flash:
                        this._replaceSpecialTagFlash(data);
                        break;
                    case slice.list.code.tag.special.Email:
                        this._replaceSpecialTagEmail(data);
                        break;
                    case slice.list.code.tag.special.Center:
                        this._replaceSpecialTagCenter(data);
                        break;
                    case slice.list.code.tag.special.Left: 
                        this._replaceSpecialTagLeft(data);
                        break;
                    case slice.list.code.tag.special.Right:
                        this._replaceSpecialTagRight(data);
                        break;
                    case slice.list.code.tag.special.Tag:
                        this._replaceSpecialTagTag(data);
                        break;
                     case slice.list.code.tag.special.ImageFonte:
                        this._replaceSpecialTagImageFonte(data);
                        break;
                      case slice.list.code.tag.special.VideoFonte:
                        this._replaceSpecialTagVideoFonte(data);
                        break;  


                   case slice.list.code.tag.special.Twitch:
                   case slice.list.code.tag.special.Video:
                        this._replaceSpecialTagTwitch(data);
                        break;
                   case slice.list.code.tag.special.Twitter:
                        this._replaceSpecialTagTwitter(data);
                        break; 
                   case slice.list.code.tag.special.Instagram:
                        this._replaceSpecialTagInstagram(data);
                        break;
                   case slice.list.code.tag.special.Facebook:
                        this._replaceSpecialTagFacebook(data);
                        break;
                    case slice.list.code.tag.special.Slide:
                        this._replaceSpecialTagSlide(data);
                        break;


                    default:
                        b = true;
                        break;
                }
                if (b) {
                    break;
                }
            }
        }
        return this;
    };
    this._replaceBasicTags = function () {
        ///<summary>Substitui as tags básicas.</summary>
        var content = this._getContent();
        var total = this._basicTags.length;
        for (var n = 0; n != total; n++) {
            tag = this._basicTags[n];
            //converte em minusculo
            var tagBegin = "\\[" + tag + "\\]";
            var tagEnd = "\\[/" + tag + "\\]";

            var regexBegin = new RegExp(tagBegin, "i");
            var regexEnd = new RegExp(tagEnd, "i");

            while (content.search(regexBegin) != -1) {
                content = content.replace(regexBegin, '<' + (tag == 's' ? 'del' : tag) + '>');
                //se nao tiver fechada, adiciona no final
                if (content.search(regexEnd) == -1) {
                    content += '[/' + tag + ']';
                }
                content = content.replace(regexEnd, '</' + (tag == 's' ? 'del' : tag) + '>');
            }
        }
        this._setContent(content);
        return this;
    };
    
    this._replaceNewLine = function () {
        ///<summary>Converte os caracteres de nova linha em uma tag br.</summary>
        var content = this._getContent();
        var s = this._getNewLineChar();
        content = content.replace(new RegExp(s, 'gi'), "<br />");
        this._setContent(content);
        return this;
    };
    this._replaceMediaToUrl = function () {
        var content = this._getContent();
        var a = ['youtube', 'vimeo', 'img'];
        for (var n = 0; n != a.length; n++) {
            content = content.replace(new RegExp('\\[' + a[n] + '\\]', 'gi'), '[url]');
            content = content.replace(new RegExp('\\[/' + a[n] + '\\]', 'gi'), '[/url]');
        }
        this._setContent(content);
    };
    this._replaceSmileys = function () {
        //var content = new sliceSmiley().setContent(this._getContent()).setLimit(this._getSmileysLimit()).replace().get();
        //this._setContent(content);
    };
    //#endregion
    //#region propriedades públicas
    this.setAllowSmileys = function (allowSmileys) {
        ///<summary>Define se smileys serão substituídos também. Padrão false.</summary>
        ///<param name="allowSmileys" type="Boolean"></param>
        this._allowSmileys = allowSmileys;
        return this;
    };
    this.setSmileysLimit = function (smileysLimit) {
        ///<summary>Define o limite e substituições de smileys, se eles forem permitidos. Padrão sem limite.</summary>
        ///<param name="smileysLimit" type="Boolean"></param>
        this._smileysLimit = smileysLimit;
        return this;
    };
    this.setForceMediaToUrl = function (forceMediaToUrl) {
        ///<summary>Se definido como verdadeiro, converte tags de media (youtube, img) em links url.</summary>
        /// <param name="forceMediaToUrl" type="Boolean">Um valor booleano</param>
        this._forceMediaToUrl = forceMediaToUrl;
        return this;
    };
    this.setNewLineChar = function (newlineChar) {
        ///<summary>Adota um novo caractere (ou conjunto) que represente uma nova linha.</summary>
        /// <param name="newlineChar" type="String">Caractere ou conjunto de caracteres que representa uma nova linha, o padrão é LnLn</param>
        this._newLineChar = newlineChar;
        return this;
    };
    this.setMaxFlashWidth = function (maxFlashWidth) {
        ///<summary>Define a largura máxima de um flash, esteja na tag [FLASH] ou [YOUTUBE].</summary>
        /// <param name="maxFlashWidth" type="Number">Em pixels</param>
        this._maxFlashWidth = maxFlashWidth;
        return this;
    };
    this.setMaxFlashHeight = function (maxFlashHeight) {
        ///<summary>Define a altura máxima de um flash, esteja na tag [FLASH] ou [YOUTUBE].</summary>
        /// <param name="maxFlashHeight" type="Number">Em pixels</param>
        this._maxFlashHeight = maxFlashHeight;
        return this;
    };
    this.setMaxImageWidth = function (maxImageWidth) {
        ///<summary>Define a largura máxima de uma imagem dentro da tag [IMG].</summary>
        /// <param name="maxImageWidth" type="Number">Em pixels</param>
        this._maxImageWidth = maxImageWidth;
        return this;
    };
    this.setMaxImageHeight = function (maxImageHeight) {
        ///<summary>Define a altura máxima de uma imagem dentro da tag [IMG].</summary>
        /// <param name="maxImageHeight" type="Number">Em pixels</param>
        this._maxImageHeight = maxImageHeight;
        return this;
    };
    this.removeNewLine = function () {
        ///<summary>Remove os caracteres de nova linha.</summary>
        var content = this._getContent();
        var s = this._getNewLineChar();
        content = content.replace(new RegExp(s, 'gi'), "");
        this._setContent(content);
        return this;
    };
    this.ignoreAllBasicTag = function () {
        ///<summary>Todas as tags básicas serão ignoradas - não substituídas ao invocar o método replace.</summary>
        this._basicTags = new Array();
        return this;
    };
    this.allowSpecialTag = function (tag) {
        ///<summary>Após usar o método de ignorar todas as tags, este método permite liberar as tags especiais individualmente.</summary>
        /// <param name="tag" type="String">Tag que pode ser listada por slice.list.code.tag.special</param>
        var a = this._getSpecialTags();
        a.push(tag);
        this._setSpecialTags(a);
        return this;
    };
    this.ignoreAllSpecialTag = function () {
        ///<summary>Todas as tags especiais serão ignoradas - não substituídas ao invocar o método replace</summary>
        this._setSpecialTags(new Array());
        return this;
    };
    this.ignoreSpecialTag = function (tag) {
        ///<summary>Ignora uma única tag durante a substituição.</summary>
        /// <param name="tag" type="String">Tag que pode ser listada por slice.list.code.tag.special</param>
        var a = this._getSpecialTags();
        var t = a.length;
        var b = new Array();
        for (var n = 0; n != t; n++) {
            if (a[n] != tag) {
                b.push(a[n]);
            }
        }
        this._setSpecialTags(b);
        return this;
    };
    this.ignoreBasicTag = function () {
        ///<summary>Ignora uma única tag durante a substituição.</summary>
        /// <param name="tag" type="String">Tag que pode ser listada por slice.list.code.tag.basic</param>
        var a = this._getBasicTags();
        var t = a.length;
        var b = new Array();
        for (var n = 0; n != t; n++) {
            if (a[n] != tag) {
                b.push(a[n]);
            }
        }
        this._setBasicTags(b);
        return this;
    };
    this.ignoreNewLine = function () {
        ///<summary>Todo os caracteres de nova linha serão ignorados - não substituídas ao invocar o método replace</summary>
        return this.setNewLineChar('jjnjhoijkmlmpok')
    };
    this.clean = function () {
        ///<summary>Deixa o texto limpo, sem caracteres de nova linha e tags</summary>
        var content = this._getContent();

        function cleanNewLine(obj, content) {
            var s = obj._getNewLineChar();
            content = content.replace(new RegExp(s, 'gi'), " ");
            while (true) {
                if (content.indexOf(', , ') == -1) {
                    break;
                }
                content = content.replace(', , ', ", ");
            }
            return content;
        }
        function cleanBasic(obj, content) {
            var total = obj._basicTags.length;
            for (var n = 0; n != total; n++) {
                tag = obj._basicTags[n];
                //converte em minusculo
                var tagBegin = "\\[" + tag + "\\]";
                var tagEnd = "\\[/" + tag + "\\]";

                var regexBegin = new RegExp(tagBegin, "gi");
                var regexEnd = new RegExp(tagEnd, "gi");

                content = content.replace(regexBegin, '');
                content = content.replace(regexEnd, '');
            }
            return content;
        }
        function cleanSpecial(obj, content) {
            obj._setContent(content);
            var total = obj._specialTags.length;
            var b = false;
            for (var n = 0; n != total; n++) {
                var tag = obj._specialTags[n];
                while (true) {
                    b = false;
                    var data = obj._findDataToSpecialTag(tag);
                    if (data == false) {
                        break;
                    }
                    switch (tag) {
                        case slice.list.code.tag.special.T1:
                        case slice.list.code.tag.special.T2:
                        case slice.list.code.tag.special.Url:
                        case slice.list.code.tag.special.Iurl:
                        case slice.list.code.tag.special.Quote:
                        case slice.list.code.tag.special.Youtube:
                        case slice.list.code.tag.special.Vimeo:

                        case slice.list.code.tag.special.Video:
                        case slice.list.code.tag.special.Twitter:
                        case slice.list.code.tag.special.Twitch:
                        case slice.list.code.tag.special.Instagram:
                        case slice.list.code.tag.special.Facebook:

                        case slice.list.code.tag.special.Img:
                        case slice.list.code.tag.special.Spoiler:
                        case slice.list.code.tag.special.Flash:
                            obj._replacePiece('', data.start, data.end);
                            break;
                        case slice.list.code.tag.special.List:
                            obj._replacePiece(data.element, data.start, data.end);
                            break;
                        default:
                            b = true;
                            break;
                    }
                    if (b) {
                        break;
                    }
                }
            }
            return obj._getContent();
        }
        content = cleanNewLine(this, content);
        content = cleanBasic(this, content);
        content = cleanSpecial(this, content);
        this._setContent(content);
        return this;
    };
    this.get = function () {
        ///<summary>Retorna o conteúdo gvcode convertido em html.</summary>
        /// <returns type="String">A string com conteúdo html.</returns>
        return this._getContent();
    };
    this.replace = function () {
        ///<summary>Substitui quebra de linha, tags basicas e tagas especiais.</summary>
        if (this._isForceMediaToUrl()) {
            this._replaceMediaToUrl();
        }
        this._replaceBasicTags();
        this._replaceSpecialTags();
        this._replaceNewLine();
        if (this._isAllowSmileys()) {
            this._replaceSmileys();
        }

        setTimeout('new sliceProtectMedia().init();',500); 

        return this;
    };
    this.toForm = function () {
        ///<summary>Normaliza o código para ser editado em um formulário.</summary>
        var content = this._getContent();
        var s = this._getNewLineChar();
        content = content.replace(new RegExp(s, 'gi'), "\n");
        this._setContent(content);
        return this;
    };
    //#endregion
    //#region construtor
    this._fillAllTags();
    if (content) {
        this._setContent(content);
    }
    //#endregion
}
 


function sliceCodeBar(formIdOrObject) {
    /// <summary>Anexa a barra com botões para adicionar o sliceCode em um campo TextArea de um formulário.</summary>
    /// <param name="formIdOrObject" type="Mixed">O objeto ou id do formulário que possui um campo TextArea.</param>
    //#region propriedades privadas
    this._toolBarId = 'gRToolbar';
    this._smileyId = 'gRSmiley';
    this._paletteId = 'gRPalette';
    this._paletteTimeId = null;
    this._paletteEvent = function () { }
    this._smileyTimeId = null;
    this._smileyEvent = function () { }
    this._formObj = null;
    this._ignoreTags = new Array();
    this._setIgnoreTags = function (ignoreTags) {
        this._ignoreTags = ignoreTags;
    };
    this._getIgnoreTags = function () {
        return this._ignoreTags;
    };
    this._getToolBarId = function () {
        return this._toolBarId;
    };
    this._getPaletteId = function () {
        return this._paletteId;
    };
    this._getSmileyId = function () {
        return this._smileyId;
    };
    this._setFormObj = function (formObj) {
        this._formObj = formObj;
    };
    this._getFormObj = function () {
        return this._formObj;
    };
    this._setPaletteEvent = function (paletteEvent) {
        this._paletteEvent = paletteEvent;
    };
    this._getPaletteEvent = function () {
        return this._paletteEvent;
    };
    this._setPaletteTimerId = function (paletteTimerId) {
        this._paletteTimeId = paletteTimerId;
    };
    this._getPaletteTimerId = function () {
        return this._paletteTimeId;
    };
    this._setSmileyEvent = function (smileyEvent) {
        this._smileyEvent = smileyEvent;
    };
    this._getSmileyEvent = function () {
        return this._smileyEvent;
    };
    this._setSmileyTimerId = function (smileyTimerId) {
        this._smileyTimeId = smileyTimerId;
    };
    this._getSmileyTimerId = function () {
        return this._smileyTimeId;
    };
    this._getTextAreaObj = function () {
        var o = this._getFormObj();
        var d = o.getElementsByTagName('textarea');
        return d ? d[0] : null;
    };
    this._hasTextArea = function () {
        return this._getTextAreaObj() != null;
    };
    this._store = function () {
        window._sliceCodeBar = this;
    };
    this._load = function () {
        var o = window._sliceCodeBar;
        if (!o) {
            return;
        }
        this._setFormObj(o._getFormObj());
        this._setPaletteTimerId(o._getPaletteTimerId());
        this._setPaletteEvent(o._getPaletteEvent());
        this._setSmileyTimerId(o._getSmileyTimerId());
        this._setSmileyEvent(o._getSmileyEvent());
    };
    this._toolBarAppend = function () {
        //se já existir, encerra
        if (new sliceContainer(this._getToolBarId()).exists()) {
            return;
        }
        var d = document.createElement('div');
        d.setAttribute('id', this._getToolBarId());
        d.className = 'scb scbCcontainer';
        this._getTextAreaObj().parentNode.insertBefore(d, this._getTextAreaObj());
        this._showButton();
        this._paletteCreate();
        this._smileyCreate();
    };

    this._showButton = function () {
        var a = new Array(); 
			 a.push('slice.list.code.tag.basic.B;Negrito;b;');
			 a.push('slice.list.code.tag.basic.I;Itálico;i;');
			 a.push('slice.list.code.tag.basic.U;Sublinhado;u');
			 a.push('slice.list.code.tag.basic.S;Rasurado;s');
			 a.push('-');
             a.push('slice.list.code.tag.special.Left;Alinhar a Esquerda;b_left');
             a.push('slice.list.code.tag.special.Center;Alinhar Centralizado;b_center');
             a.push('slice.list.code.tag.special.Right;Alinhar a Direita;b_right');
             a.push('-');
             a.push('slice.list.code.tag.special.T1;Título principal;t1');
			 a.push('slice.list.code.tag.special.T2;Título secundário;t2');
             a.push('-');

          
			    a.push('slice.list.code.tag.special.Table;Inserir tabela;table');
           
			a.push('slice.list.code.tag.special.List;Inserir lista;list');
			a.push('slice.list.code.tag.special.Url;Inserir link;url');
            a.push('-');
            // 'slice.list.code.tag.special.Email;Inserir e-mail;email',
            //'-',
			a.push('slice.list.code.tag.special.Img;Inserir imagem;img');
			a.push('slice.list.code.tag.special.Youtube;Inserir vídeo do Youtube;youtube');

            

                //'slice.list.code.tag.special.Flash;Inserir um conteúdo em flash;flash',
                a.push('slice.list.code.tag.special.Video;Inserir vídeo;b_video');
			    a.push('-');
                a.push('slice.list.code.tag.special.Slide;Inserir Slide;b_slide');
                a.push('slice.list.code.tag.special.Alerta;Inserir Alerta;b_alert');
                a.push('slice.list.code.tag.special.Aviso;Inserir Aviso;b_aviso');
                a.push('slice.list.code.tag.special.Page;Inserir Paginação;b_page');
               
           
              
            a.push('-');
			a.push('slice.list.code.tag.special.Twitter;Inserir Tweet;b_twitter');
			a.push('slice.list.code.tag.special.Facebook;Inserir algo do Facebook;b_face');
			a.push('slice.list.code.tag.special.Instagram;Inserir post do Instagram;b_instagram');
            //'slice.list.code.tag.special.Hr;Régua horizontal;hr',

			a.push('-');

            //'slice.list.code.tag.special.Code;Inserir código;code',
            
        	    a.push('slice.list.code.tag.special.Tag;Inserir Tag;b_tag');
			

            a.push('slice.list.code.tag.special.Quote;Inserir citação;quote');
			a.push('slice.list.code.tag.special.Spoiler;Inserir spoiler;spoiler');
            a.push('-');
            a.push('color');

            //'smileys'
		
        var s = '';
        var b = new Array();
        var item = new Array();
        for (var n = 0; n != a.length; n++) {
            //splinter?
            if (a[n] == '-') {
                b.push('<div class="splitter"></div>');
                continue;
            }
            //cor
            if (a[n] == 'color') {
                s = '';
                s += '<div class="button" id="button_color">';
                s += '<div id="sc_float_menu" class="button color" title="Cor da fonte">'; //onclick="new sliceCodeBar().paletteShrink(this);"
                s += '<ul><li><div class="palletContent">---</div><ul>';
                s += '<li><div class="palette">' + this._getPaletteCode() + '</div></li>';
                s += '</ul></li></ul>';
                s += '</div>';
                s += '</div>'; //button
                b.push(s);
                continue;
            }
            //smileys
            if (a[n] == 'smileys') {
                s = '';
                s += '<div class="button" id="button_smiley">';
                s += '<div class="button smileys" title="Inserir Smileys">';  //onclick="new sliceCodeBar().smileyShrink(this);"
                s += '<ul><li><div class="palletContent">---</div><ul>';
                s += '<li><div class="smiley_list">' + this._getSmileyCode() + '</div></li>';
                s += '</ul></li></ul>';
                s += '</div>';
                s += '</div>'; //button
                b.push(s);
                continue;
            }
            item = a[n].split(';');
            s = '';
            s += '<div class="button" id="button_' + item[2] + '">';
            s += '<div class="button ' + item[2] + '" title="' + item[1] + '" onclick="new sliceCodeBar().click(' + item[0] + ');"></div>';
            s += '</div>'; //button

            b.push(s);
        }
        s = b.join('');
        new sliceContainer(this._getToolBarId()).write(s);
        //remover botoes
        for (var n = 0; n != this._getIgnoreTags().length; n++) {
            new sliceContainer('button_' + this._getIgnoreTags()[n]).remove();
        }
    };
    this._getPaletteCode = function () {
        //preenchimento
        var a = new Array(
			'#FFFFFF', '#CCCCCC', '#C0C0C0', '#999999', '#666666', '#333333', '#000000',
			'#FCCCCC', '#FF6666', '#FF0000', '#CC0000', '#990000', '#660000', '#330000',
			'#FFCC99', '#FF9966', '#FF9900', '#FF6600', '#CC6600', '#993300', '#663300',
			'#FFFF99', '#FFFF66', '#FFCC66', '#FFCC33', '#CC9933', '#996633', '#663333',
			'#FFFFCC', '#FFFF33', '#FFFF00', '#FFCC00', '#999900', '#666600', '#333300',
			'#99FF99', '#66FF99', '#33FF33', '#33CC00', '#009900', '#006600', '#003300',
			'#99FFFF', '#33FFFF', '#66CCCC', '#00CCCC', '#339999', '#336666', '#003333',
			'#CCFFFF', '#66FFFF', '#33CCFF', '#3366FF', '#3333FF', '#000099', '#000066',
			'#CCCCFF', '#9999FF', '#6666CC', '#6633FF', '#6600CC', '#333399', '#330099',
			'#FFCCFF', '#FF99FF', '#CC66CC', '#CC33CC', '#993399', '#663366', '#330033'
		);
        var s = '';
        for (var n = 0; n != a.length; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 7; i++) {
                if (a[n]) {
                    s += '<div class="item" style="background-color:' + a[n] + '" onclick="new sliceCodeBar().click(slice.list.code.tag.special.Color,\'' + a[n] + '\')" onmouseover="new sliceCodeBar()._colorOnMouseOver();" onmouseout="new sliceCodeBar()._colorOnMouseOut();"></div>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        return s;
    };
    this._getSmileyCode = function () {
        //preenchimento
        var b = new sliceSmiley().getSmileys();
        var a = [
            b[12], b[5], b[1], b[2], b[3], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15], b[16],
            b[17], b[18], b[19], b[20], b[21], b[22], b[23], b[27], b[28], b[30], b[33], b[34], b[25], b[26]
        ];

        var s = '';
        var total = a.length;
        for (var n = 0; n != total; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 5; i++) {
                if (a[n]) {
                    s += '<span title="' + a[n].title + '" class="smiley ' + a[n].className + '" onclick="new sliceCodeBar().click(slice.list.code.tag.special.Smiley,\'' + a[n].shortCut + '\')" onmouseover="new sliceCodeBar()._smileyOnMouseOver();" onmouseout="new sliceCodeBar()._smileyOnMouseOut();">|</span>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        return s;
    };
    this._paletteCreate = function () {
        if (new sliceContainer(this._getPaletteId()).exists()) {
            return;
        }

        var d = document.createElement('div');
        d.setAttribute('id', this._getPaletteId());
        d.className = 'palette';

        with (d.style) {
            display = 'none';
        }

        document.getElement(this._getToolBarId()).appendChild(d);
        //document.body.appendChild(d);
        //preenchimento
        var a = new Array(
			'#FFFFFF', '#CCCCCC', '#C0C0C0', '#999999', '#666666', '#333333', '#000000',
			'#FCCCCC', '#FF6666', '#FF0000', '#CC0000', '#990000', '#660000', '#330000',
			'#FFCC99', '#FF9966', '#FF9900', '#FF6600', '#CC6600', '#993300', '#663300',
			'#FFFF99', '#FFFF66', '#FFCC66', '#FFCC33', '#CC9933', '#996633', '#663333',
			'#FFFFCC', '#FFFF33', '#FFFF00', '#FFCC00', '#999900', '#666600', '#333300',
			'#99FF99', '#66FF99', '#33FF33', '#33CC00', '#009900', '#006600', '#003300',
			'#99FFFF', '#33FFFF', '#66CCCC', '#00CCCC', '#339999', '#336666', '#003333',
			'#CCFFFF', '#66FFFF', '#33CCFF', '#3366FF', '#3333FF', '#000099', '#000066',
			'#CCCCFF', '#9999FF', '#6666CC', '#6633FF', '#6600CC', '#333399', '#330099',
			'#FFCCFF', '#FF99FF', '#CC66CC', '#CC33CC', '#993399', '#663366', '#330033'
		);
        var s = '';
        for (var n = 0; n != a.length; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 7; i++) {
                if (a[n]) {
                    s += '<div class="item" style="background-color:' + a[n] + '" onclick="new sliceCodeBar().click(slice.list.code.tag.special.Color,\'' + a[n] + '\')" onmouseover="new sliceCodeBar()._colorOnMouseOver();" onmouseout="new sliceCodeBar()._colorOnMouseOut();"></div>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        new sliceContainer(this._getPaletteId()).write(s);
    };
    this._paletteShow = function () {
        new sliceContainer(this._getPaletteId()).show();
    };
    this._paletteHide = function () {
        new sliceContainer(this._getPaletteId()).hide();
        //restaurar evento
        document.onmouseup = this._getPaletteEvent();
    };
    this._colorOnMouseOut = function () {
        clearTimeout(this._getPaletteTimerId());
        this._setPaletteTimerId(self.setTimeout('new sliceCodeBar()._paletteHide()', 1000));
        this._store();
    };
    this._colorOnMouseOver = function () {
        clearTimeout(this._getPaletteTimerId());
        this._setPaletteTimerId(null);
        this._store();
    };
    this._smileyCreate = function () {
        if (new sliceContainer(this._getSmileyId()).exists()) {
            return;
        }

        var d = document.createElement('div');
        d.setAttribute('id', this._getSmileyId());
        d.className = 'smiley_list';

        with (d.style) {
            display = 'none';
        }

        document.getElement(this._getToolBarId()).appendChild(d);
        //document.body.appendChild(d);
        //preenchimento
        var b = new sliceSmiley().getSmileys();
        var a = [
            b[12], b[5], b[1], b[2], b[3], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15], b[16],
            b[17], b[18], b[19], b[20], b[21], b[22], b[23], b[27], b[28], b[30], b[33], b[34], b[25], b[26]
        ];

        var s = '';
        var total = a.length;
        for (var n = 0; n != total; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 5; i++) {
                if (a[n]) {
                    s += '<span title="' + a[n].title + '" class="smiley ' + a[n].className + '" onclick="new sliceCodeBar().click(slice.list.code.tag.special.Smiley,\'' + a[n].shortCut + '\')" onmouseover="new sliceCodeBar()._smileyOnMouseOver();" onmouseout="new sliceCodeBar()._smileyOnMouseOut();">|</span>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        new sliceContainer(this._getSmileyId()).write(s);
    };
    this._smileyShow = function () {
        new sliceContainer(this._getSmileyId()).show();
    };
    this._smileyHide = function () {
        new sliceContainer(this._getSmileyId()).hide();
        //restaurar evento
        document.onmouseup = this._getSmileyEvent();
    };
    this._smileyOnMouseOut = function () {
        clearTimeout(this._getSmileyTimerId());
        this._setSmileyTimerId(self.setTimeout('new sliceCodeBar()._smileyHide()', 1000));
        this._store();
    };
    this._smileyOnMouseOver = function () {
        clearTimeout(this._getSmileyTimerId());
        this._setSmileyTimerId(null);
        this._store();
    },

    this._findPosition = function (obj) {
        var curleft = curtop = 0;
        if (obj.offsetParent) {
            curleft = obj.offsetLeft
            curtop = obj.offsetTop
            while (obj = obj.offsetParent) {
                curleft += obj.offsetLeft
                curtop += obj.offsetTop
            }
        }
        return [curleft, curtop];
    };
    this._rangeSurround = function (text1, text2) {
        var textarea = this._getTextAreaObj();
        // Can a text range be created?
        if (typeof (textarea.caretPos) != "undefined" && textarea.createTextRange) {
            var caretPos = textarea.caretPos, temp_length = caretPos.text.length;

            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text1 + caretPos.text + text2 + ' ' : text1 + caretPos.text + text2;

            if (temp_length == 0) {
                caretPos.moveStart("character", -text2.length);
                caretPos.moveEnd("character", -text2.length);
                caretPos.select();
            }
            else
                textarea.focus(caretPos);
        }
        // Mozilla text range wrap.
        else if (typeof (textarea.selectionStart) != "undefined") {
            var begin = textarea.value.substr(0, textarea.selectionStart);
            var selection = textarea.value.substr(textarea.selectionStart, textarea.selectionEnd - textarea.selectionStart);
            var end = textarea.value.substr(textarea.selectionEnd);
            var newCursorPos = textarea.selectionStart;
            var scrollPos = textarea.scrollTop;

            textarea.value = begin + text1 + selection + text2 + end;

            if (textarea.setSelectionRange) {
                if (selection.length == 0)
                    textarea.setSelectionRange(newCursorPos + text1.length, newCursorPos + text1.length);
                else
                    textarea.setSelectionRange(newCursorPos, newCursorPos + text1.length + selection.length + text2.length);
                textarea.focus();
            }
            textarea.scrollTop = scrollPos;
        }
        // Just put them on the end, then.
        else {
            textarea.value += text1 + text2;
            textarea.focus(textarea.value.length - 1);
        }
    };
    this._rangeReplace = function (text) {
        var textarea = this._getTextAreaObj();
        // Attempt to create a text range (IE).
        if (typeof (textarea.caretPos) != "undefined" && textarea.createTextRange) {
            var caretPos = textarea.caretPos;

            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
            caretPos.select();
        }
        // Mozilla text range replace.
        else if (typeof (textarea.selectionStart) != "undefined") {
            var begin = textarea.value.substr(0, textarea.selectionStart);
            var end = textarea.value.substr(textarea.selectionEnd);
            var scrollPos = textarea.scrollTop;

            textarea.value = begin + text + end;

            if (textarea.setSelectionRange) {
                textarea.focus();
                textarea.setSelectionRange(begin.length + text.length, begin.length + text.length);
            }
            textarea.scrollTop = scrollPos;
        }
        // Just put it on the end.
        else {
            textarea.value += text;
            textarea.focus(textarea.value.length - 1);
        }
    };
    this._appendTextAreaEvent = function () {
        var text = this._getTextAreaObj();
        text.onchange = function () { new sliceCodeBar()._storeCaret(); };
        text.onkeyup = function () { new sliceCodeBar()._storeCaret(); };
        text.onclick = function () { new sliceCodeBar()._storeCaret(); };
        text.onselect = function () { new sliceCodeBar()._storeCaret(); };
    };
    this._storeCaret = function () {
        var text = this._getTextAreaObj();
        // Only bother if it will be useful.
        if (typeof (text.createTextRange) != "undefined") {
            text.caretPos = document.selection.createRange().duplicate();
        }
    };
    //#endregion
    //#region propriedades públicas
    this.paletteShrink = function (obj) {
        /// <summary>Exibe ou oculta a paleta de cores.</summary>
        /// <param name="obj" type="Object">A referência ao objeto em que a paleta deve ficar embaixo.</param>
        var d = document.getElement(this._getPaletteId());
        if (d.style.display == "") {
            this._paletteHide();
            return;
        }
        //guardar evento
        this._setPaletteEvent(document.onmouseup);
        document.onmouseup = function () { new sliceCodeBar()._paletteHide() }
        //posicionar
        //alert(obj.parentNode);
        var p = this._findPosition(obj);
        var p1 = new Array(0, 0);
        var pt;
        //var g = obj;
        //logica gvziana, pegar o pai mais externo para gerar a posição absoluta
        /*while(true){
        g = g.parentNode;
        pt = this._findPosition(g);
        if (pt[0]==0 && pt[1]==0){
        break;
        }
        p1 = pt;
        }*/

        d.style.left = p[0] - p1[0] - 23 + 'px';
        d.style.top = p[1] - p1[1] + 5 + 'px';
        this._paletteShow();
    };
    this.smileyShrink = function (obj) {
        /// <summary>Exibe ou oculta a paleta de cores.</summary>
        /// <param name="obj" type="Object">A referência ao objeto em que a paleta deve ficar embaixo.</param>
        var d = document.getElement(this._getSmileyId());
        if (d.style.display == "") {
            this._smileyHide();
            return;
        }
        //guardar evento
        this._setPaletteEvent(document.onmouseup);
        document.onmouseup = function () { new sliceCodeBar()._smileyHide() }
        //posicionar
        //alert(obj.parentNode);
        var p = this._findPosition(obj);
        var p1 = new Array(0, 0);
        var pt;
        //var g = obj;
        //logica gvziana, pegar o pai mais externo para gerar a posição absoluta
        /*while(true){
        g = g.parentNode;
        pt = this._findPosition(g);
        if (pt[0]==0 && pt[1]==0){
        break;
        }
        p1 = pt;
        }*/

        d.style.left = p[0] - p1[0] - 23 + 'px';
        d.style.top = p[1] - p1[1] + 5 + 'px';
        this._smileyShow();
    };
    this.click = function (tag, value) {
        /// <summary>Ação ao clicar em um botão.</summary>
        /// <param name="tag" type="String">A tag, utilize os lists slice.list.code.tag.basic e slice.list.code.tag.special para listagem</param>
        /// <param name="value" type="String">Opcional. </param>
        switch (tag) {
            case slice.list.code.tag.special.Hr:
                this._rangeReplace('[hr]');
                break;
            case slice.list.code.tag.special.Page:
                this._rangeReplace('[page]');
                break;
            case slice.list.code.tag.special.Color:
                this._rangeSurround('[' + tag.toLowerCase() + '=' + value + ']', '[/' + tag.toLowerCase() + ']');
                this._paletteHide();
                break;
            case slice.list.code.tag.special.Smiley:
                this._rangeReplace('' + value + '');
                this._smileyHide();
                break;
            case slice.list.code.tag.special.List:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nItem 1 \nItem 2 \nItem 3 \n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.Table:
                //this._rangeSurround('[' + tag.toLowerCase() + ']\nTítulo 1 // Título 2 \nCélula 1-A // Célula 2-A \nCélula 1-B // Célula 2-B \n', '[/' + tag.toLowerCase() + ']');
                this._rangeSurround('[' + tag.toLowerCase() + ']\n[tr]\n[th]Titulo Coluna 1[/th]\n[th]Titulo Coluna 2[/th]\n[/tr]\n[tr]\n[td]Linha 1 - Coluna 1[/td]\n[td]Linha 2 - Coluna 1[/td]\n[/tr]\n[tr]\n[td]Linha 2 - Coluna 1[/td]\n[td]Linha 2 - Coluna 2[/td]\n[/tr]\n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.Alerta:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nTITULO DO ALERTA \nDescrição do alerta \n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.Aviso:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nTITULO DO AVISO \nDescrição do aviso \n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.Slide:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nLink da imagem \nLink da imagem \nLink da imagem \n', '[/' + tag.toLowerCase() + ']');
                break;
            default:
                this._rangeSurround('[' + tag.toLowerCase() + ']', '[/' + tag.toLowerCase() + ']');
                break;
        }
    };
    this.ignoreTag = function (tag) {
        /// <summary>Ignore uma tag, ao fazer isso o botão correspondente não aparecerá na caixa.</summary>
        /// <param name="tag" type="String">Uma tag básica ou especial, utilize os lists slice.list.code.tag.basic e slice.list.code.tag.special para listagem</param>
        this._getIgnoreTags().push(tag);
        return this;
    };
    this.apply = function () {
        /// <summary>Aplica/anexa a barra ao formulário indicado no método construtor.</summary>
        if (!this._hasTextArea()) {
            return;
        }
        this._toolBarAppend();
    };
     

    this.remove = function () {
        //se existir, remove 
        if (new sliceContainer(this._getToolBarId()).exists()) {
            new sliceContainer(this._getToolBarId()).remove();
        }
    };

    //#endregion
    //#region construtor
    if (formIdOrObject) {
        this._setFormObj(document.forms[formIdOrObject] ? document.forms[formIdOrObject] : formIdOrObject);
        this._store();
    } else {
        this._load();
    }
    //#endregion
}



function sliceSmiley() {
    /// <summary>Classe para converter determinados grupos de caracteres em smileys.</summary>
    //#region proprieades privadas
    this._limit = 0; //limite de smileys no texto, 0=ilimitado    
    this._content = null; //texto a ser examinado
    this._smileys = new Array();
    this._getContent = function () {
        return this._content;
    };
    this._getLimit = function () {
        return this._limit;
    };
    this._setSmileys = function (smileys) {
        this._smileys = smileys;
    };
    this._fillSmileys = function () {
        //retorna a lista de objetos dos smiles dentro de um array
        var a = [
            { shortCut: "[angel]", regex: "\\[angel\\]", className: "smiley_1", title: "Anjo" },
            { shortCut: "|-(", regex: "\\|\\-\\(", className: "smiley_2", title: "Nervoso" },
            { shortCut: "[:3]", regex: "\\[:3\\]", className: "smiley_3", title: "Vergonhoso" },
            { shortCut: ";(", regex: ";\\(", className: "smiley_4", title: "Chorando" },
            { shortCut: "^^", regex: "\\^\\^", className: "smiley_5", title: "Feliz" },
            { shortCut: ";)", regex: ";\\)", className: "smiley_6", title: "Piscadela" },
            { shortCut: "[cool]", regex: "\\[cool\\]", className: "smiley_7", title: "Cool" },
            { shortCut: "[inlove]", regex: "\\[inlove\\]", className: "smiley_8", title: "Amando" },
            { shortCut: ":(", regex: ":\\(", className: "smiley_9", title: "Triste" },
            { shortCut: ":D", regex: ":D", className: "smiley_10", title: "Contente" },
            { shortCut: ">_<", regex: ">_<|\\&gt\\;_\\&lt\\;", className: "smiley_11", title: "Surpreso" },
            { shortCut: ":*", regex: ":\\*", className: "smiley_12", title: "Beijo" },
            { shortCut: ":)", regex: ":\\)|=\\)", className: "smiley_13", title: "Feliz" },
            { shortCut: "[jack]", regex: "\\[jack\\]", className: "smiley_14", title: "Jack" },
            { shortCut: "[devil]", regex: "\\[devil\\]", className: "smiley_15", title: "Mal" },
            { shortCut: "[puke]", regex: "\\[puke\\]", className: "smiley_16", title: "Enjoado" },
            { shortCut: "[think]", regex: "\\[think\\]", className: "smiley_17", title: "Pensativo" },
            { shortCut: "[l]", regex: "\\[l\\]", className: "smiley_18", title: "S2" },
            { shortCut: "(:|", regex: "\\(:\\|", className: "smiley_19", title: "Putz..." },
            { shortCut: "-.-", regex: "\\-\\.\\-", className: "smiley_20", title: "Sério" },
            { shortCut: "[hehe]", regex: "\\[hehe\\]", className: "smiley_21", title: "Hehe" },
            { shortCut: "|-)", regex: "\\|\\-\\)", className: "smiley_22", title: "Sono" },
            { shortCut: ":P", regex: ":P|=p", className: "smiley_23", title: "Língua" },
            { shortCut: ":|", regex: ":\\|", className: "smiley_24", title: "Mudo" },
            { shortCut: "@_@", regex: "@_@", className: "smiley_25", title: "Confuso" },
            { shortCut: "[y]", regex: "\\[y\\]", className: "smiley_26", title: "Yes!" },
            { shortCut: "[n]", regex: "\\[n\\]", className: "smiley_27", title: "Não!" },
            { shortCut: "O_o", regex: "O_o", className: "smiley_28", title: "Admirado" },
            { shortCut: "O_O", regex: "O_O", className: "smiley_29", title: "Espantado" },
            { shortCut: "^_^", regex: "\\^_\\^", className: "smiley_30", title: "^^" },
            { shortCut: "*-*", regex: "\\*\\-\\*", className: "smiley_31", title: "ooouhhhhmmmmm" },
            { shortCut: "[money]", regex: "\\[money\\]", className: "smiley_32", title: "$" },
            { shortCut: "[nerd]", regex: "\\[nerd\\]", className: "smiley_33", title: "Nerd" },
            { shortCut: "[smirk]", regex: "\\[smirk\\]", className: "smiley_34", title: "Sei..." },
            { shortCut: "[:#]", regex: "\\[:#\\]", className: "smiley_35", title: "Aff..." },
        ];
        this._setSmileys(a);
    };
    //#endregion
    //#region propriedades públicas
    this.getSmileys = function () {
        /// <summary>Retorna um array contendo todos os smileys</summary>
        /// <returns type="Array">Cada elemento do array possui os atributos shortCut, className e title</returns>
        return this._smileys;
    };
    this.replace = function () {
        var smileys = this.getSmileys();
        var s = this._getContent();
        //substitui todas as ocorrencias
        var total = smileys.length;
        var smiley;
        for (var n = 0; n != total; n++) {
            smiley = smileys[n];
            s = s.replace(new RegExp(smiley.regex, 'gi'), '<span class="smiley ' + smiley.className + '" title="' + smiley.title + '">|</span>');
        }
        //aqui verificar se o limite de smileys superou o limite
        if (this._getLimit() > 0) {
            var a = s.match(new RegExp('class="smiley', 'g'));
            if (!a) {
                a = new Array();
            }
            if (a.length > this._getLimit()) {
                return this;
            }
        }

        this.setContent(s);
        return this;
    };
    this.setLimit = function (limit) {
        /// <summary>Define o limite de substituições de smiley em um conteúdo. Por padrão não há limite. Se for ultrapassado, nenhum replace é feito</summary>
        ///<param name="limit" type="Number"></param>
        this._limit = limit;
        return this;
    };
    this.setContent = function (content) {
        this._content = content;
        return this;
    };
    this.get = function () {
        /// <summary>Retorna o conteúdo substituído (se o método replace foi invocado)</summary>
        /// <returns type="String"></returns>
        return this._getContent();
    };
    this.write = function (id) {
        /// <summary>Escreve o conteúdo em um container</summary>
        ///<param name="id" type="String">O id do container a ser substituído</param>
        new sliceContainer(id).write(this.get());
        return this;
    };
    //#endregion
    //#region construtor
    this._fillSmileys();
    //#endregion
}
function sliceContainer(id) {
    ///<summary>Classe para trabalhar com elementos html do tipo container (div, span, etc).</summary>
    ///<param name="id" type="string">A id do container</param>
    //#region propriedades privadas
    this._id = 'null';
    this._setId = function (id) {
        this._id = id;
    };
    this._getId = function () {
        return this._id;
    };
    //#endregion
    //#region propriedades públicas
    this.exists = function () {
        ///<summary>A partir da id única, indica se o elmento existe.</summary>
        /// <returns type="Boolean"></returns>
        if (document.getElement(this._getId())) {
            return true;
        }
        return false;
    };
    this.write = function (content) {
        ///<summary>Escreve no interior do container. Se não existir, não acontece nada</summary>
        ///<param name="content" type="string">A id do container</param>
        var d = document.getElement(this._getId());
        if (d) {
            d.innerHTML = content;
        }
        return this;
    };
    this.read = function () {
        ///<summary>Lê o que existe no container. Se não existir, retorna uma string de comprimento zero.</summary>
        /// <returns type="String"></returns>
        var d = document.getElement(this._getId());
        return d ? d.innerHTML : '';
    };
    this.isHided = function () {
        ///<summary>Retorna verdadeiro se o container existir e estiver invisível.</summary>
        /// <returns type="Boolean"></returns>
        var d = document.getElement(this._getId());
        if (!d) {
            return false;
        }
        return d.style.display == 'none';
    };
    this.hide = function () {
        ///<summary>Oculta o container através do estilo.</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return;
        }
        d.style.display = 'none';
        return this;
    };
    this.remove = function () {
        ///<summary>Remove o container do documento. Se ele não existir, não acontece nada.</summary>
        if (!this.exists()) {
            return;
        }
        var d = document.getElement(this._getId());
        d.parentNode.removeChild(d);
        return this;
    };
    this.show = function () {
        ///<summary>Se o container estiver oculto através do estilo, este método o torna visível.</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return this;
        }
        d.style.display = 'block';
        return this;
    };
    this.toggle = function () {
        ///<summary>Alterna entre visivel e oculto o container através do estilo</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return this;
        }
        if (d.style.display == 'none') {
            d.style.display = 'block';
        } else {
            d.style.display = 'none';
        }
        return this;
    };
    this.clear = function () {
        ///<summary>Deixa o contaier vazio. Se não existir, não acontece nada.</summary>
        this.write('');
    };
    this.create = function (container, style, first) {
        ///<summary>Cria um div dentro do outro com metodo appendChild</summary>
        ///<param name="container" type="string">div que ira receber o item</param>    
        ///<param name="style" type="string">estilo css base do div</param> 
        ///<param name="first" type="string">se definido, o div será inserido antes deste</param> 

        //se existir para aqui
        if (this.exists()) {
            console.log('o div existe');
            return this;
        }
        if (!style) {
            style = '';
        }
        //verifica se o div base existe
        var div_content = document.getElement(container);
        if (!div_content) {
            console.log('div base nào existe');
            return this;
        }
        var div = document.createElement('div');
        div.innerHTML = '';
        div.setAttribute('id', this._getId());
        div.setAttribute('class', style);

        if (first) {
            var div_first = document.getElement(first);
            if (!div_first) {
                console.log('O div First, não existe');
                //força criar dentro da base 
                div_content.appendChild(div);
                return this;
            }
            //insere antes do div_first
            div_content.insertBefore(div, div_first);
            return this;
        }

        //se chega aqui e pq sera inserido abaixo de tudo
        div_content.appendChild(div);
        return this;
    };
    this.className = function (className) {
        ///<summary>Modifica o className do div. Se não existir, não acontece nada</summary>
        ///<param name="content" type="string">A id do container</param>
        var d = document.getElement(this._getId());
        if (d) {
            d.className = className;
        }
        return this;
    };
    this.setAttribute = function (name, value) {
        ///<summary>Modifica o className do div. Se não existir, não acontece nada</summary>
        ///<param name="content" type="string">A id do container</param>
        var d = document.getElement(this._getId());
        if (d) { 
            d.setAttribute(name, value);
        }
        return this;
    };
    this.focus = function () {
        ///<summary>Da foco no div informado, util para correr a pagina para onde necessitar.</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return;
        }
        d.scrollIntoView()
        return this;
    }
    //#endregion 
    //#region construtor
    if (id) {
        this._setId(id);
    }
    //#endregion
}
function sliceCookie(name, value) {
    /// <summary>Classe para leitura e escrita de cookie</summary>
    /// <param name="name" type="String">O nome do cookie</param>
    /// <param name="value" type="Mixed">Opcionalmente. O valor do cookie se for para invocar o método de escrita.</param>
    //#region propriedades privadas
    this._name = '';
    this._value = '';
    this._expires = 0;
    this._path = '/';
    this._domain = '';
    this._secure = false;
    this._setName = function (name) {
        /// <summary>Define o nome do cookie</summary>
        /// <param name="name" type="String">O nome do cookie</param>
        this._name = name;
    };
    this._getName = function () {
        ///<summary>Retorna o nome do cookie</summary>
        /// <returns type="String">O nome do cookie</returns>
        return this._name;
    };
    this._setValue = function (value) {
        ///<summary>Define o valor do cookie</summary>
        /// <param name="value" type="String">O valor do cookie</param>
        this._value = value;
    };
    this._getExpires = function () {
        /// <summary>Retorna o tempo de expiração em milissegundos. Por padrão é 0.</summary>
        return this._expires;
    };
    this._getPath = function () {
        /// <summary>Retorna o caminho dentro do site, no qual este cookie se aplica.</summary>
        return this._path;
    };
    this._getDomain = function () {
        /// <summary>Retorna o domínio que tem acesso ao cookie.</summary>
        /// <returns type="String">O domínio</returns>
        return this._domain;
    };
    this._isSecure = function () {
        /// <summary>Retorna se deve usar SSL para enviar a conexão pelo server. Padrão false.</summary>
        /// <returns type="Boolean">O valor booleano</returns>
        return this._secure;
    }
    //#endregion
    //#region propriedades públicas
    this.getValue = function () {
        /// <summary>Retorna o valor do cookie</summary>
        /// <returns type="String">O valor do cookie</returns>
        return this._value;
    };
    this.setExpires = function (number, unity) {
        /// <summary>Define o tempo para que o cookie expire. Por padrão, expira assim que o browser é fechado</summary>
        /// <param name="number" type="Number">O valor númerico</param>
        /// <param name="unity" type="Number">A unidade de medida, usar o list slice.list.cookie.timeUnit</param>
        this._expires = number * unity;
        return this;
    };
    this.setPath = function (path) {
        /// <summary>Define o caminho dentro do site, no qual este cookie se aplica. Por padrão, este valor não é preenchido</summary>
        /// <param name="path" type="String">O caminho</param>
        this._path = path;
        return this;
    };
    this.setDomain = function (domain) {
        /// <summary>Define o domínio que terá acesso ao cookie. Por padrão, deixado em branco, apenas o domínio (mas não os subdomínios) que criou terá acesso</summary>
        /// <param name="domain" type="String">O domínio, como .clubvicio.com para todos os sub, ou então teste.clubvicio.com para apenas este sub</param>
        this._domain = domain;
    };
    this.setSecure = function (secure) {
        /// <summary>Define se deve usar SSL para enviar a conexão pelo server. Padrão false.</summary>
        /// <param name="secure" type="Boolean">O valor booleano</param>
        this._secure = secure;
        return this;
    };
    this.write = function () {
        /// <summary>Escreve o cookie.</summary>
        var a = new Array();
        var s;
        //nome+valor
        a.push(this._getName() + "=" + escape(value));
        //expires
        if (this._getExpires() > 0) {
            a.push("expires=" + new Date(parseInt((new Date()).getTime()) + parseInt(this._getExpires())).toGMTString());
        }
        //path
        s = this._getPath();
        if (s.length > 0) {
            a.push("path=" + escape(s));
        }
        //domain
        s = this._getDomain();
        if (s.length > 0) {
            a.push("domain=" + escape(s));
        }
        //secure
        if (this._isSecure()) {
            a.push("secure");
        }
        //junta e escreve
        document.cookie = a.join('; ');
    };
    this.read = function () {
        /// <summary>Lê o valor do cookie informado no método construtor e armazena para ser retornado pelo método getValue.</summary>
        /// <returns type="Boolean">Retorna verdadeiro se o cookie for encontrado e lido com sucesso.</returns>
        var results = document.cookie.match('(^|;) ?' + this._getName() + '=([^;]*)(;|$)');

        if (results) {
            var s = unescape(results[2]);
            //precisa ter ao menos um caractere
            if (s.length > 0) {
                this._setValue(s);
                return true;
            }
        }

        return false;
    };
    this.expire = function () {
        /// <summary>Faz com a data do cookie seja definida para o passado tornando-o expirado.</summary>
        this.setExpires(-10, slice.list.cookie.timeUnit.Years);
        //anula o valor para garantir
        this._setValue('');
        this.write();
    };
    //#endregion
    //#region construtor
    if (name) {
        this._setName(name);
    }
    if (value) {
        this._setValue(value);
    }
    //#endregion
}
function sliceDarkness() {
    /// <summary>Exibe/oculta o escurecimento de toda a página</summary>
    //#region propriedades privadas
    this._clickToClose = true;
    this._div = null;
    this._setDiv = function (div) {
        /// <summary>Define o div (em objeto) que é colocado sobre o fundo negro</summary>
        /// <param name="div" type="Object">O div em formato de objeto</param>
        this._div = div;
    };
    this._getDiv = function () {
        return this._div;
    };
    this._isClickToClose = function () {
        return this._clickToClose;
    };
    this._getPageSize = function () {
        var xScroll, yScroll;

        if (window.innerHeight && window.scrollMaxY) {
            xScroll = document.body.scrollWidth;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }

        var windowWidth, windowHeight;
        if (self.innerHeight) {	// all except Explorer
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }

        // for small pages with total height less then height of the viewport
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        // for small pages with total width less then width of the viewport
        if (xScroll < windowWidth) {
            pageWidth = windowWidth;
        } else {
            pageWidth = xScroll;
        }

        arrayPageSize = new Array(pageWidth, pageHeight, windowWidth, windowHeight)
        return arrayPageSize;
    };
    this._getPageScroll = function () {
        var yScroll;

        if (self.pageYOffset) {
            yScroll = self.pageYOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
            yScroll = document.documentElement.scrollTop;
        } else if (document.body) {// all other Explorers
            yScroll = document.body.scrollTop;
        }

        arrayPageScroll = new Array('', yScroll)
        return arrayPageScroll;
    };
    this._centerObject = function () {
        /// <summary>Centraliza o div, que precisa ter suas dimensões em style</summary>
        var o = this._getDiv(); // document.getElement(id) ? document.getElement(id) : id;
        var arrayPageScroll = this._getPageScroll();
        var arrayPageSize = this._getPageSize();
        var s;
        if (!o.height) {
            s = o.style.height;
            o.height = s.substring(0, s.indexOf('px'));
        }
        if (!o.width) {
            s = o.style.width;
            o.width = s.substring(0, s.indexOf('px'));
        }
        o.style.position = 'absolute';
        var top = (arrayPageScroll[1] + ((arrayPageSize[3] - 35 - o.height) / 2));
        var left = (((arrayPageSize[0] - 20 - o.width) / 2));

        if (top > 120) {
            top = 120;
        }
        if (top < 5) {
            top = 5;
        }

        o.style.top = top + "px";
        o.style.left = left + "px";
        o.style.display = 'block';

    };
    this._overlayShow = function () {
        /// <summary>Mostra o fundo negro</summary>
        this._overlayClose();
        var d = document.createElement("div");
        d.setAttribute('id', 'overlay');
        d.setAttribute('class', 'overlay');
        document.body.appendChild(d);
        var d1 = document.getElement('overlay');
        var f = this._getPageSize();
        with (d1.style) {
            position = 'absolute';
            //width = f[0] + 'px'
            width = '100%';
            height = f[1] + 'px';
            left = 0;
            top = 0;
            display = 'block';
            //backgroundImage = 'url(http://s4.gamevicio.com.br/images/others/overlay.png)';
            var s = 'PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9I';
            s += 'jEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhc';
            s += 'kdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0';
            s += 'iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5P';
            s += 'SIwLjUiLz4KICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIwLjUiLz4KICA8L2xpb';
            s += 'mVhckdyYWRpZW50PgogIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjZ3JhZC11Y2dnLWdlbmVyYXRlZCkiIC8+Cjwvc3ZnPg==';
            backgroundImage = 'url(data:image/svg+xml;base64,' + s + ')';
        }
        if (this._isClickToClose()) {
            d.onclick = function () {
                new sliceDarkness().close();
            }
        }
    };
    this._store = function () {
        window._sliceDarkness = this;
    };
    this._load = function () {
        var o = window._sliceDarkness;
        if (!o) {
            return;
        }
        this._setDiv(o._getDiv());
    };
    this._overlayClose = function () {
        /// <summary>Fecha o fundo negro</summary>
        if (document.getElement('overlay')) {
            document.body.removeChild(document.getElement('overlay'));
        }
    }
    this._divAppend = function (idOrObj) {
        /// <summary>Anexa o div sobre o fundo negro</summary>
        var o = document.getElement(idOrObj) ? document.getElement(idOrObj) : idOrObj;
        this._setDiv(o);
        var d = document.body;
        if (!d) {
            return;
        }
        //anexa        
        d.appendChild(this._getDiv());
        //centraliza
        this._centerObject();
    };
    this._divClose = function () {
        /// <summary>Fecha/remove o div da tela</summary>        
        var o = this._getDiv();
        if (o) {
            document.body.removeChild(o);
        }
        this._setDiv(null);
    };
    //#endregion
    //#region propriedades públicadas
    this.setDiv = function (div) {
        /// <summary>Define o div (em objeto) que é colocado sobre o fundo negro</summary>
        /// <param name="div" type="Object">O div em formato de objeto</param>
        this._div = div;
        this._store();
        return this;
    };
    this.setClickToClose = function (clickToClose) {
        /// <summary>Define se ao clicar em uma área fora do div será fechado. Por padrão é verdadeiro.</summary>
        /// <param name="clickToClose" type="Boolean">O valor booleano</param>
        this._clickToClose = clickToClose;
        this._store();
        return this;
    };
    this.show = function (idOrObj) {
        /// <summary>Mostra o fundo negro.</summary>
        /// <param name="idOrObj" type="Mixed">Opcional.A id do elemento ou sua referência, ele será colocado no centro e na frente do fundo negro</param>
        this.close();
        this._overlayShow();
        if (idOrObj) {
            this._divAppend(idOrObj);
        }
        this._store();
    };
    this.close = function () {
        /// <summary>Fecha o fundo negro e qualquer coisa que estiver dentro dele</summary>
        this.onClose();
        this._divClose();
        this._overlayClose();
        this._store();
    };
    this.onClose = function () {
        /// <summary>Evento a ser sobrescrito se o fundo escuro for fechado</summary>
    };
    //#endregion
    //#region construtor
    this._load();
    //#endregion
}
function sliceDimension(width, height) {
    /// <summary>Classe simples para gerar um objeto com os valores de dimensão (largura e altura)</summary>
    /// <param name="width" type="Number">A largura em pixels</param>
    /// <param name="height" type="Number">A altura em pixels</param>
    //#region propriedades privadas
    this._width = 0;
    this._height = 0;
    this._setWidth = function (width) {
        this._width = width;
    };
    this._setHeight = function (height) {
        this._height = height;
    };
    //#endregion
    //#region propriedades públicas
    this.getWidth = function () {
        return this._width;
    };
    this.getHeight = function () {
        return this._height;
    };
    //#endregion
    //#region construtor
    if (width) {
        this._setWidth(width);
    }
    if (height) {
        this._setHeight(height);
    }
    //#endregion
}
function sliceFlash() {
    /// <summary>Exibe um embed em Flash. Também permite verificar se o plugin está instalado.</summary>
    //#region propriedades privadas
    //http://kb2.adobe.com/cps/127/tn_12701.html
    this._id = null;
    this._width = 0;
    this._height = 0;
    this._url = '';
    this._loop = true;
    this._windowMode = slice.list.flash.windowMode.Opaque;
    this._flashVars = new Array();
    this._getId = function () {
        return this._id;
    };
    this._getWindowMode = function () {
        return this._windowMode;
    };
    this._getWidth = function () {
        return this._width;
    };
    this._getHeight = function () {
        return this._height;
    };
    this._getUrl = function () {
        return this._url;
    };
    this._isLoop = function () {
        return this._loop;
    };
    this._getFlashVars = function () {
        return this._flashVars;
    };
    //#endregion
    //#region propriedades públicas
    this.addFlashVar = function (name, value) {
        ///<summary>Adiciona uma variável para ser interpretada pelo flash em escopo global.</summary>
        /// <param name="name" type="String">O nome da variável</param>
        /// <param name="value" type="String">O valor da variável. Se necessário, o valor passará por encoding.</param>
        this._getFlashVars().push(name + '=' + encodeURIComponent(value));
        return this;
    };
    this.isInstalled = function () {
        /// <summary>Indica se o navegador tem o Adobe Flash Instalado</summary>
        /// <returns type="Boolean"></returns>
        var hasFlash = false;
        try {
            var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (fo) {
                hasFlash = true;
            }
        } catch (e) {
            if (navigator.mimeTypes["application/x-shockwave-flash"] != undefined) {
                hasFlash = true;
            }
        }
        return hasFlash;
    };
    this.setId = function (id) {
        this._id = id;
        return this;
    };
    this.setWindowMode = function (windowMode) {
        ///<summary>Define o modo da janela (wmode).</summary>
        /// <param name="windowMode" type="String">Define o modo da janela, utilize o slice.list.flash.windowMode para listagem. Padrão slice.list.flash.windowMode.Opaque.</param>
        this._windowMode = windowMode;
        return this;
    };
    this.setLoop = function (loop) {
        ///<summary>Define se o flash fica em estado de repetição. Por padrão é true.</summary>
        /// <param name="loop" type="Boolean">Um valor booleano.</param>
        this._loop = loop;
        return this;
    };
    this.setUrl = function (url) {
        ///<summary>O caminho relativo ou completo para o arquivo swf.</summary>
        /// <param name="url" type="String">A url pra o swf.</param>
        this._url = url;
        return this;
    };
    this.setWidth = function (width) {
        ///<summary>Define a largura do embed em pixels.</summary>
        /// <param name="width" type="Number">A largura em pixels.</param>
        this._width = width;
        return this;
    };
    this.setHeight = function (height) {
        ///<summary>Define a altura do embed em pixels.</summary>
        /// <param name="height" type="Number">A altura em pixels</param>
        this._height = height;
        return this;
    };
    this.getEmbed = function () {
        var s = '';
        s += '<object ' + (this._getId() ? 'id="' + this._getId() + '" ' : '') + 'width="' + this._getWidth() + '" height="' + this._getHeight() + '" wmode="' + this._getWindowMode() + '" loop="' + (this._isLoop() ? 'true' : 'false') + '" data="' + this._getUrl() + '" type="application/x-shockwave-flash">';
        s += '<param name="wmode" value="' + this._getWindowMode() + '">';
        if (this._getFlashVars().length > 0) {
            s += '<param name=FlashVars value="' + this._getFlashVars().join('&') + '" />'
        }
        s += '<param name="movie" value="' + this._getUrl() + '">';
        s += '</object>';

        return s;
    };
    //#endregion
}
function sliceImage() {
    ///<summary>Classe para trabalhar com imagens, possui métodos para redimensionamento proporcional.</summary>
    //#region propriedades privadas
    this._url = null;
    this._validResponse = false;
    this._width = 0;
    this._maxWidth = null;
    this._maxHeight = null;
    this._percent = null;
    this._height = 0;
    this._getMaxWidth = function () {
        return this._maxWidth;
    };
    this._getWidth = function () {
        return this._width;
    };
    this._getMaxHeight = function () {
        return this._maxHeight;
    };
    this._getPercent = function () {
        return this._percent;
    };
    this._getHeight = function () {
        return this._height;
    };
    this._setValidResponse = function (validResponse) {
        this._validResponse = validResponse;
    };
    //#endregion
    //#region propriedades públicas
    this.setUrl = function (url) {
        ///<summary>Define a url da imagem</summary>
        /// <param name="url" type="String">A url completa juntamente com o protocolo</param>
        this._url = url;
        return this;
    };
    this.setPercent = function (percent) {
        ///<summary>Define a imagem vai ser redimensionada baseada em percentual (1-100)</summary>
        /// <param name="percent" type="Integer">Um inteiro (1-100).</param>
        this._percent = percent;
        return this;
    };
    this.setMaxWidth = function (maxWidth) {
        ///<summary>Define a largura máxima da imagem em pixels</summary>
        /// <param name="maxWidth" type="Integer">A largura em pixels.</param>
        this._maxWidth = maxWidth;
        return this;
    };
    this.setWidth = function (width) {
        ///<summary>Define a largura da imagem em pixels ou percentual</summary>
        /// <param name="width" type="String">A largura em pixels ou percentual. Ex: 640, '80%'</param>
        this._width = width;
        return this;
    };
    this.setMaxHeight = function (maxHeight) {
        ///<summary>Define a altura máxima da imagem em pixels</summary>
        /// <param name="maxHeight" type="Integer">A altura em pixels.</param>
        this._maxHeight = maxHeight;
        return this;
    };
    this.setHeight = function (height) {
        ///<summary>Define a altura da imagem em pixels ou percentual</summary>
        /// <param name="height" type="String">A altura em pixels ou percentual. Ex: 640, '80%'</param>
        this._height = height;
        return this;
    };
    this.needResize = function () {
        ///<summary>Compara a dimensão da imagem e da dimensão máxima e retorna se a imagem precisa ser redimensionada. É preciso definir alguma dimensão máxima ou o percentual</summary>
        /// <returns type="Boolean"></returns>

        //console.log('--- ' + this._getWidth() +' - '+ this._getMaxWidth() + ' ;;; ' + this._getHeight() +' - '+ this._getMaxHeight());

        if (this._getMaxWidth() > 0) {
            if (this._getWidth() > this._getMaxWidth()) {
                return true;
            }
        };
        if (this._getMaxHeight() > 0) {
            if (this._getHeight() > this._getMaxHeight()) {
                return true;
            }
        };
        //checar se percentual foi definido
        if (this._getPercent() > 0) {
            return true;
        }

        return false;
    };
    this.getOrientation = function () {
        ///<summary>Retorna o tipo de orientação da imagem (quadrada, vertical ou horizontal)</summary>
        /// <returns type="String">Do tipo list slice.list.image.orientation</returns>
        if (this._getWidth() == this._getHeight()) {
            return slice.list.image.orientation.Square;
        }
        if (this._getWidth() > this._getHeight()) {
            return slice.list.image.orientation.Horizontal;
        }
        return slice.list.image.orientation.Vertical;
    };
    this.getResizedDimension = function () {
        ///<summary>Retorna as novas dimensões proporcionais da imagem. Do contrário ficam as originais</summary>
        /// <returns type="Array">Array[largura,altura]</returns>
        var oldDimension = [this._getWidth(), this._getHeight()];
        //precisa ser redimensionado?
        if (!this.needResize()) {
            return oldDimension;
        }
        //percentual
        if (this._getPercent() > 0) {
            return [Math.round((oldDimension[0] * this._getPercent()) / 100), Math.round((oldDimension[1] * this._getPercent()) / 100)];
        }
        var factor = 1;
        switch (this.getOrientation()) {
            case slice.list.image.orientation.Horizontal:
                factor = this._getWidth() > this._getMaxWidth() ? this._getMaxWidth() / this._getWidth() : 1;
                if (this._getMaxHeight() > 0) {
                    if (Math.round(this._getHeight() * factor) > this._getMaxHeight()) {
                        factor = this._getHeight() > this._getMaxHeight() ? this._getMaxHeight() / this._getHeight() : 1;
                    }
                }
                break;
            case slice.list.image.orientation.Vertical:
                factor = this._getHeight() > this._getMaxHeight() ? this._getMaxHeight() / this._getHeight() : 1;
                if (this._getMaxWidth() > 0) {
                    if (Math.round(this._getWidth() * factor) > this._getMaxWidth()) {
                        factor = this._getWidth() > this._getMaxWidth() ? this._getMaxWidth() / this._getWidth() : 1;
                    }
                }
                break;
            case slice.list.image.orientation.Square:
                if (this._getMaxHeight() < this._getMaxWidth()) {
                    factor = this._getHeight() > this._getMaxHeight() ? this._getMaxHeight() / this._getHeight() : 1;
                } else {
                    factor = this._getWidth() > this._getMaxWidth() ? this._getMaxWidth() / this._getWidth() : 1;
                }
                break;
        }
        //multiplica o fator e arredonda
        return [Math.round(this._getWidth() * factor), Math.round(this._getHeight() * factor)];
    };
    this.getUrl = function () {
        return this._url;
    };
    this.isValidResponse = function () {
        return this._validResponse;
    };
    this.load = function () {
        ///<summary>Definida a url, este método faz o carregamento e chama o evento onReady ao terminar. Em caso de sucesso, define as novas dimensões.</summary>
        this.onLoading();
        var image = new Image();
        image.obj = this;
        //define os eventos
        image.onload = function () {
            this.obj._setValidResponse(true);
            //define as dimensões
            this.obj.setWidth(this.width);
            this.obj.setHeight(this.height);
            this.obj.onReady();
        }
        image.onerror = function () {
            this.obj._setValidResponse(false);
            this.obj.onReady();
        }
        //define a url, ao fazer isso, a imagem já começa a carregar
        image.src = this.getUrl();
    };
    this.onReady = function () {
        ///<summary>Método (evento) invocado após o método load ser concluído (com ou não sucesso). Use isValidResponse para descobrir.</summary>
    };
    this.onLoading = function () {
        ///<summary>Método (evento) invocado assim que o método load é requisitado.</summary>
    };
    //#endregion
}
function sliceLoader() {
    /// <summary>Exibe/oculta a janela informativa de loader</summary>
    //#region propriedades privadas
    this._message = '';
    this._secondsToClose = 0;
    this._type = slice.list.loader.type.Info;
    this._closeTimerId = null;
    this._animationTimerId = null;
    this._animationFramePosition = 0;
    this._animationFrames = new Array();
    this._setAnimationFrames = function (animationFrames) {
        this._animationFrames = animationFrames;
    };
    this._getAnimationFrames = function () {
        return this._animationFrames;
    };
    this._setAnimationFramePosition = function (animationFramePosition) {
        this._animationFramePosition = animationFramePosition;
    };
    this._getAnimationFramePosition = function () {
        return this._animationFramePosition;
    };
    this._setAnimationTimerId = function (animationTimerId) {
        this._animationTimerId = animationTimerId;
    };
    this._getAnimationTimerId = function () {
        return this._animationTimerId;
    };
    this._setCloseTimerId = function (closeTimerId) {
        this._closeTimerId = closeTimerId;
    };
    this._getCloseTimerId = function () {
        return this._closeTimerId;
    };
    this._setMessage = function (message) {
        this._message = message;
    };
    this._getMessage = function () {
        return this._message;
    };
    this._setSecondsToClose = function (seconds) {
        this._secondsToClose = seconds;
    };
    this._getSecondsToClose = function () {
        return this._secondsToClose;
    };
    this._setType = function (type) {
        this._type = type;
    };
    this._getType = function () {
        return this._type;
    };
    this._resize = function (charNumber) {
        var d = document.getElement('GVLoaderContent');
        if (d) {
            d.style.width = (charNumber * 12) + 'px'
        }
    };
    this._autoClose = function () {
        if (this._getSecondsToClose() == 0) {
            return;
        }
        var id = setTimeout('new sliceLoader().close()', this._getSecondsToClose() * 1000);
        this._setCloseTimerId(id);
    };
    this._iebody = function () {
        return (document.compatMode != "BackCompat" ? document.documentElement : document.body);
    };
    this._store = function () {
        window._sliceLoader = this;
    };
    this._load = function () {
        var o = window._sliceLoader;
        if (!o) {
            return;
        }
        this._setCloseTimerId(o._getCloseTimerId());
        this._setAnimationTimerId(o._getAnimationTimerId());
        this._setAnimationFramePosition(o._getAnimationFramePosition());
        this._setAnimationFrames(o._getAnimationFrames());
        this._setSecondsToClose(o._getSecondsToClose());
        this._setMessage(o._getMessage());
        this._setType(o._getType());
    };
    this._dispose = function () {
        /// <summary>Fecha o loader, cancela timer de autofechamento e instancia global</summary>
        //remove elementos html se houver
        var d = document.getElement('GVLoader')
        if (d) {
            document.body.removeChild(d);
        }
        //remove timer
        if (this._getCloseTimerId() != null) {
            clearTimeout(this._getCloseTimerId());
        }
        if (this._getAnimationTimerId() != null) {
            clearTimeout(this._getAnimationTimerId());
        }
        //remove instancia global
        if (window._sliceLoader) {
            window._sliceLoader = null;
        }
    };
    this._build = function () {
        if (document.getElement('GVLoader') == null) {
            var d = document.createElement("div");
            d.setAttribute('id', 'GVLoader');
            if (document.body != null) {
                document.body.appendChild(d);
            }
            //aplicar estilo no div externo
            with (d.style) {
                position = 'fixed';
                top = '0px';
                width = '100%';
                background = 'transparent';
                textAlign = 'center';
                zIndex = '5000';
            }

            var e = document.createElement("div");
            e.setAttribute('id', 'GVLoaderContent');
            d.appendChild(e);
            //aplicar estilo no div interno
            with (e.style) {
                color = '#000000';
                fontWeight = 'bold';
                fontSize = '100%';
                width = '300px';
                background = 'LightGoldenRodYellow ';
                padding = '10px';
                margin = '0 auto';
                zIndex = '510';
            }
            e.className = 'GvLoaderContent';
        }
    };
    this._animationStart = function () {
        this._setAnimationFramePosition(0);

        var a = new Array();
        //loading dots
        a.push(new Array('&nbsp;&nbsp;&nbsp;', '.&nbsp;&nbsp;', '..&nbsp;', '...'));
        a.push(new Array('_o_', '\\o/', '|o|', '/o\\', '|o|', '\\o/'));
        a.push(new Array('|', '/', '--', '\\'));
        a.push(new Array('&nbsp;', '|', '||', '|||'));
        this._setAnimationFrames(a[0]);

        this._animationRun();
    };
    this._animationRun = function () {
        var d = document.getElement('slice_loader_animation');
        if (!d) {
            return;
        }

        var a = this._getAnimationFrames();
        var p = this._getAnimationFramePosition();
        if (p > a.length - 1) {
            p = 0;
        }

        d.innerHTML = a[p];
        p++;
        this._setAnimationFramePosition(p);
        clearTimeout(this._getAnimationTimerId());
        var id = setTimeout('new sliceLoader()._animationRun()', 500);
        this._setAnimationTimerId(id);
        this._store();
    };
    //#endregion
    //#region propriedades públicas
    this.show = function (message, type, secondsToClose) {
        /// <summary>Exibe a janela informativa de loader</summary>
        /// <param name="message" type="String">A mensagem que aparecerá para o usuário</param>
        /// <param name="type" type="String">Opcional. O tipo de mensagem, usar o list slice.list.loader.type. Por padrão é usado slice.list.loader.type.Info</param>
        /// <param name="secondsToClose" type="Number">Opcional. O número de segundos para automaticamente fechar a jaenla informativa. Se não preencher ou deixar 0, ela só será fechada pelo método close</param>
        if (!message) {
            return;
        }
        this._setType(type ? type : slice.list.loader.type.Info);
        this._setSecondsToClose(secondsToClose ? secondsToClose : 0);
        //fecha o que estiver aberto e mata timers
        this.close();
        //redimensionar baseado na quantiade de caracteres
        var size = message.length;
        //type: progress (com pontinhos),  info: sem nada por enqto
        if (this._getType() == slice.list.loader.type.Progress) {
            message += '<span id="slice_loader_animation">&nbsp;</span>';
        }
        this._setMessage(message);
        this._build();
        this._resize(size);
        var d = document.getElement('GVLoaderContent');
        if (d) {
            d.innerHTML = this._getMessage();
        }
        this._autoClose();
        //iniciar animacao?
        if (this._getType() == slice.list.loader.type.Progress) {
            this._animationStart();
        }
        this._store();
    };
    this.close = function () {
        /// <summary>Fecha o loader</summary>
        this._dispose();
    };
    //#endregion
    //#region construtor
    this._load();
    //#endregion
}
function sliceMobile() {
    //#region propriedades públicas
    this.is = function () {
        ///<summary>Retorna se o acesso é feito de um dispositivo móvel.</summary>
        /// <returns type="Boolean"></returns>
        return screen.width < 1024;
    };
    //#endregion
} 
function sliceRequest(method, url) {
    /// <summary>Cria um objeto para fazer requisição http por get ou post</summary>
    /// <param name="method" type="String">Use o list slice.list.request.method para uma lista do métodos</param>
    /// <param name="url" type="String">a url de requisição</param>
    // #region propriedades privadas
    this._id = null;
    this._mode = 'append';
    this._url = '';
    this._urlMain = '';
    this._method = slice.list.request.method.Get;
    this._postVars = new Array();
    this._disposeAfterReady = true;
    this._storageEnabled = false;
    this._storageMethod = slice.list.storage.method.Session;
    this._storageInvalidResponse = false;
    this._storageExpireNumber = 0;
    this._storageExpireTimeUnit = slice.list.storage.timeUnit.Minutes;
    this._setStorageExpireNumber = function (storageExpireNumber) {
        this._storageExpireNumber = storageExpireNumber;
    };
    this._getStorageExpireNumber = function () {
        return this._storageExpireNumber;
    };
    this._setStorageExpireTimeUnit = function (storageExpireTimeUnit) {
        this._storageExpireTimeUnit = storageExpireTimeUnit;
    };
    this._getStorageExpireTimeUnit = function () {
        return this._storageExpireTimeUnit;
    };
    this._setStorageInvalidResponse = function (storageInvalidResponse) {
        this._storageInvalidResponse = storageInvalidResponse;
    };
    this._isStorageInvalidResponse = function () {
        return this._storageInvalidResponse;
    };
    this._setStorageEnabled = function (storageEnabled) {
        this._storageEnabled = storageEnabled;
    };
    this._isStorageEnabled = function () {
        return this._storageEnabled;
    };
    this._setStorageMethod = function (storageMethod) {
        this._storageMethod = storageMethod;
    };
    this._getStorageMethod = function () {
        return this._storageMethod;
    };
    this._setMethod = function (method) {
        this._method = method;
    };
    this._getMethod = function () {
        return this._method;
    };
    this._getPostVars = function () {
        ///<summary>o array com as várias a serem passadas por post</summary>
        /// <returns type="Array">variáveis post.</returns>
        return this._postVars;
    };
    this._getUrlMain = function () {
        ///<summary>Se o usuário definiu, retorna a url principal do caminho, assim ele só precisa preencher o restante do caminho</summary>
        /// <returns type="String">A url principal, retorna uma string vazia se não tiver sido preenchida.</returns>
        return this._urlMain;
    };
    this._isDisposeAfterReady = function () {
        return this._disposeAfterReady;
    };
    this._setUrl = function (url) {
        this._url = url;
    };
    this._getUrl = function () {
        return this._url;
    };
    this._getUrlFull = function () {
        var user = new sliceUser();
        return this._getUrlMain() + this._getUrl() + '/' + this._getId() + '/' + user.getId() + '/' + user.getKey() + '/' + new String(Math.random()).substring(2);
    };
    this._setId = function (n) {
        this._id = n;
    };
    this._getId = function () {
        return this._id;
    };
    this._sendWithGet = function () {
        /// <summary>Envia a requisição do tipo get</summary>
        //storage?
        if (this._isStorageEnabled()) {
            var storage = new sliceStorage(this._getStorageMethod());
            if (this._getStorageExpireNumber() > 0) {
                storage.setMaxAge(this._getStorageExpireNumber(), this._getStorageExpireTimeUnit());
            }
            if (storage.issetField(this._getUrl())) {
                this.response = storage.getField(this._getUrl());
                this.onReady();
                return;
            }
        }

        var d = document.createElement('script');
        d.setAttribute('id', 'slice_script_container_' + this._getId());
        d.setAttribute('language', 'javascript');
        d.setAttribute('type', 'text/javascript');
        d.setAttribute('src', this._getUrlFull());

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(d);
    };
    this._sendWithPost = function () {
        /// <summary>Envia a requisição do tipo get</summary>
        if (!document.body) {
            return;
        }
        //criar um div invisível
        var d = document.createElement('div');
        d.setAttribute('id', 'slice_script_container_' + this._getId());
        d.style.display = 'none';
        document.body.appendChild(d);
        //cria um iframe
        var i = document.createElement('iframe');
        i.setAttribute('id', 'slice_iframe_' + this._getId());
        i.setAttribute('name', 'slice_iframe_' + this._getId());
        d.appendChild(i);
        //cria o form
        var f = document.createElement('form');
        f.setAttribute('id', 'slice_form_' + this._getId());
        f.setAttribute('method', 'post');
        f.setAttribute('enctype', 'multipart/form-data');

        f.setAttribute('action', this._getUrlFull());
        f.setAttribute('target', 'slice_iframe_' + this._getId());
        //adicionar as variáveis
        var post = this._getPostVars();
        for (var n = 0; n != post.length; n++) {
            var o = post[n];
            var f1;
            switch (o.type) {
                case slice.list.request.fieldType.Hidden:
                    f1 = document.createElement('input');
                    f1.setAttribute('type', 'hidden');
                    f1.setAttribute('name', o.name);
                    f1.setAttribute('value', o.value);
                    f.appendChild(f1);
                    break;
                //lembre futuro, nao se pode passar o caminho do arquivo       
                //acho que devo passar o objeto como referência       
                case slice.list.request.fieldType.File:
                    f1 = o.value;
                    f1.setAttribute('name', o.name);
                    //f1.setAttribute('type', 'file');
                    //f1.setAttribute('name', o.name);
                    //f1.setAttribute('value', o.value);
                    //f1.value = o.value;
                    f.appendChild(f1);
                    break;
                //falta fazer o tipo file       
            }
        }
        d.appendChild(f);
        //enviar o formulário
        f.submit();
    };
    this._onReady = function () {
        this.onReady();
        //armazenar?
        if (!this._isStorageEnabled()) {
            return;
        }
        //arzemanar resposta inválida?
        if (!this.isValidResponse()) {
            if (!this._isStorageInvalidResponse()) {
                return;
            }
        }
        var storage = new sliceStorage(this._getStorageMethod());
        storage.setField(this._getUrl(), this.response);
    };
    //#endregion
    //#region propriedades públicas
    this.setUrlMain = function (url) {
        ///<summary>Define a url principal do caminho, assim ele só precisa preencher o restante do caminho. Se não for usada, o usuário tem de digitar o caminho completo todas as vezes.</summary>
        /// <param name="url" type="String">A url parcial inicial</param>
        this._urlMain = url;
        window._sliceRequestUrlMain = url;
    };
    this.setDisposeAfterReady = function (disposeAfterReady) {
        /// <summary>Define se após invocar o método onReady, o objeto será automaticamente descartado. Por padrão é verdadeiro</summary>
        /// <param name="disposeAfterReady" type="Boolean">A variável booleana que indica se haverá dispose do request após uso</param>
        this._disposeAfterReady = disposeAfterReady;
        return this;
    };
    this.send = function () {
        /// <summary>Envia a requisição para o servidor</summary>
        
        //seta a id
        this._setId(sliceResponse.length);
        //armazena o objeto em uma variável global
        sliceResponse.push(this);
        this.onSubmit();
        //dispose após chamar o ready?
        if (this._isDisposeAfterReady()) {
            this._f = this.onReady;
            this.onReady = function () {
                this._f();
                this._f = null;
                this.dispose();
            };
        };

        switch (this._getMethod()) {
            case slice.list.request.method.Get:
                this._sendWithGet();
                break;
            case slice.list.request.method.Post: 
                 
                this.addPostVar('timesend', new Date().getTime());
                 
                this._sendWithPost();
                break;
        }
    };
    this.addPostVarFromForm = function (nameOrObj) {
        /// <summary>A partir de um formulário, adiciona todas as variáveis na requisição em método post</summary>
        /// <param name="nameOrObj" type="Mixed">O nome ou o próprio objeto do formulário</param>
        var elements = nameOrObj.elements ? nameOrObj.elements : (document.forms[nameOrObj] ? document.forms[nameOrObj].elements : document.getElement(nameOrObj).elements);
        var pairs = new Array();
        for (var i = 0; i < elements.length; i++) {
            //if ((name = elements[i].name) && (value = elements[i].value)) {
            if ((name = elements[i].name)) {
                //aqui falta testar se o campo é do tipo file
                value = elements[i].value;
                this.addPostVar(name, value);
            }
        }
        return this;
    };
    this.addPostVar = function (name, value, type) {
        /// <summary>Adicionar uma variável a ser passada por post</summary>
        /// <param name="name" type="String">Nome da variável</param>
        /// <param name="value" type="Mixed">O valor da variável</param>
        /// <param name="type" type="String">Opcional. O tipo da variável, use o list slice.list.request.fieldType</param>
        var o = new Object();
        o.name = name;
        o.value = value;
        if (!type) {
            type = slice.list.request.fieldType.Hidden;
        }

        o.type = type;
        this._getPostVars().push(o);
        return this;
    };
    this.storage = function (enabled, method, storeInvalidResponse, expireNumber, expireUnit) {
        /// <summary>Define se a requisição vai utilizar recursos de armazenamento.</summary>
        /// <param name="enabled" type="Boolean">Define se a leitura/escrita de armazenamento estará ligada. Padrão false.</param>
        /// <param name="method" type="String">O método de armazenamento, utilize o list slice.list.storage.method para listagem. Padrão slice.list.storage.method.Session.</param>
        /// <param name="storeInvalidResponse" type="Boolean">Define se respostas inválidas serão armazenadas. Por padrão é false.</param>
        /// <param name="expireNumber" type="Number">Define o tempo de expiração do dado que será multiplicado pela unidade expireUnit.</param>
        /// <param name="expireUnity" type="Number">Define a unidade do tempo de expiração, utilizar o list slice.list.storage.timeUnit para listagem.</param>
        this._setStorageEnabled(enabled);
        this._setStorageMethod(method);
        this._setStorageInvalidResponse(storeInvalidResponse);
        if (expireNumber) {
            if (expireNumber > 0) {
                this._setStorageExpireNumber(expireNumber);
                this._setStorageExpireTimeUnit(expireUnit);
            }
        }

        return this;
    };
    this.clearStorage = function (method) {
        /// <summary>Remove (se houver) dados armazenados da consulta identificada pela url.</summary>
        /// <param name="method" type="String">O método de armazenamento, utilize o list slice.list.storage.method para listagem. Padrão slice.list.storage.method.Session.</param>
        new sliceStorage(method ? method : this._getStorageMethod()).unsetField(this._getUrl());

        return this;
    };
    this.onReady = function () {
        /// <summary>Método que deve ser sobrescrito para ser executado quando a requisição for completada</summary>
    };
    this.onSubmit = function () {
        /// <summary>Método que deve ser sobrescrito para ser executado antes da requisição ser efetuada</summary>
    };
    this.obj = null;
    this.dispose = function () {
        ///<summary>Remove o objeto e seus recursos da página</summary>
        this.obj = null;
        var d = document.getElement('slice_script_container_' + this._getId());
        if (d) {
            d.parentNode.removeChild(d);
        }
        sliceResponse[this._getId()] = null;
    };
    this.isValidResponse = function () {
        ///<summary>Indica se a resposta é válida</summary>
        /// <returns type="Boolean">Returns a number that represents the area.</returns>
        return this.response.status == 'ok';
    };
    this.getErrorCode = function () {
        ///<summary>Retorna o código do erro</summary>
        /// <returns type="Number">retorna 0 se não houver erro.</returns>
        return this.isValidResponse() ? 0 : this.response.error.code;
    };
    this.getErrorDescription = function () {
        ///<summary>Retorna a descrição do erro</summary>
        /// <returns type="String">A descrição</returns>
        return this.isValidResponse() ? 'Sem erros' : this.response.error.description;
    }
    //#endregion
    //#region construtor
    this._setMethod(method);
    this._setUrl(url);
    
    if (window._sliceRequestUrlMain) {
        this.setUrlMain(window._sliceRequestUrlMain);
    }
    if (!window.sliceResponse) {
        window.sliceResponse = new Array();
    }
    //#endregion
}
function sliceString(string) {
    //#region propriedades privadas
    this._string = '';
    this._setString = function (string) {
        this._string = string;
    };
    this._getString = function () {
        return this._string;
    };
    this._toIntegerFriendly = function () {
        var nStr = this._getString();
        var s;
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
        }
        s = x1 + x2;

        return s;
    };
    this._round = function (num, dec) {
        var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        return result;
    };
    this._toMegahertzFriendly = function () {
        var a = new Array("MHz", "GHz", "THz");
        var number = parseInt(this._getString());
        var i;
        if (number < 1000) {
            return number + ' ' + a[0];
        }
        if (number < 10000) {
            return this._round(number / 1000, 2) + ' ' + a[1];
        }
        if (number < 100000) {
            return this._round(number / 10000, 2) + ' ' + a[2];
        }

        return number;
    };
    this._toBytesFriendly = function () {
        var bytes = Number(this._getString());
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };
    this._toTimeFriendly = function () {
        ///<summary>Converte segundos em horas/minutos, a string, necessita ser em segundos</summary>
        /// <returns type="String">A string formatada.</returns>
        var seg = this._getString();
        var st = '';
        var h = 0;
        var m = 0;
        var s = 0;
        h = parseInt((seg / 60) / 60);
        if (h > 0) {
            st += h > 1 ? h + "h" : h + 'h';
        }
        m = parseInt((seg / 60) % 60);
        if (m > 0) {
            st += m + 'm';
        }
        s = (seg % 60) % 60;
        if (s > 0 && h == 0) {
            st += s + 's';
        }
        return st;
    };
    //#endregion
    //#region propriedades públicas
    this.replaceNewLine = function () {
        ///<summary>Converte caracteres especiais vindo do slicerequest em quebras de linha</summary>
        /// <returns type="String">A string com quebras de linha se houver.</returns>
        var content = this._getString();
        return content.replace(/LnLn/gi, "\n")
    };
    this.removeNewLine = function () {
        ///<summary>Substitui os caracteres de nova linha diretamente de formulários, usado antes de mandar para o slicerequest</summary>
        /// <returns type="String"></returns>
        var content = this._getString();
        while (true) {
            var p = content.indexOf("\n");
            if (p == -1) {
                break;
            }
            content = content.replace("\n", " ");
        }

        return content;
    };
    this.replaceSmartQuote = function () {
        ///<summary>Substitui as aspas especiais criadas pelo MSWord por aspas simples</summary>
        /// <returns type="String"></returns>
        var str = this._getString();
        var myReplacements = new Array();
        var myCode, intReplacement;
        myReplacements[8216] = 39;
        myReplacements[8217] = 39;
        myReplacements[8220] = 34;
        myReplacements[8221] = 34;
        myReplacements[8212] = 45;
        for (c = 0; c < str.length; c++) {
            var myCode = str.charCodeAt(c);
            if (myReplacements[myCode] != undefined) {
                intReplacement = myReplacements[myCode];
                str = str.substr(0, c) + String.fromCharCode(intReplacement) + str.substr(c + 1);
            }
        }
        return str;
    };
    this.replaceWordChars = function () {
        ///<summary>Substitui vários caracteres especiais feitos pelo MSWord como aspas duplas, traços</summary>
        /// <returns type="String"></returns>
        var s = this._getString();
        // smart single quotes and apostrophe
        s = s.replace(/[\u2018]/g, "\'");
        s = s.replace(/[\u2019]/g, "\'");
        s = s.replace(/[\u201A]/g, "\'");
        // smart double quotes
        s = s.replace(/[\u201C]/g, "\"");
        s = s.replace(/[\u201D]/g, "\"");
        s = s.replace(/[\u201E]/g, "\"");
        // ellipsis
        s = s.replace(/\u2026/g, "...");
        // dashes
        s = s.replace(/[\u2013]/g, "-");
        s = s.replace(/[\u2014]/g, "-");
        // circumflex
        s = s.replace(/\u02C6/g, "^");
        // open angle bracket
        s = s.replace(/\u2039/g, "<");
        // close angle bracket
        s = s.replace(/\u203A/g, ">");
        // spaces
        s = s.replace(/[\u02DC]/g, " ");
        s = s.replace(/[\u00A0]/g, " ");

        return s;
    };
    this.getPeriod = function (lengthMin, lengthMax) {
        ///<summary>Recorta o período de um texto</summary>
        /// <param name="lengthMin" type="Number">O comprimento mínimo da string de retorno</param>
        /// <param name="lengthMax" type="Number">Opcional. O comprimento máximo da string de retorno</param>
        /// <returns type="String"></returns>
        var content = this._getString();

        if (content.length <= lengthMin) {
            return content;
        }
        var b = content.indexOf('.', lengthMin);
        b = b == -1 ? content.length : b++;
        b++;
        var s = content.substring(0, b);
        if (lengthMax) {
            if (s.length > lengthMax) {
                //implementar
            }
        }
        return s;
    };
    this.truncate = function (lenght) {
        var content = this._getString();

        if (content.length > lenght) {
            lenght--;
            var last = content.substr(lenght - 1, 1);
            while (last != ' ' && lenght > 0) {
                lenght--;
                last = content.substr(lenght - 1, 1);
            }
            last = content.substr(lenght - 2, 1);
            if (last == ',' || last == ';' || last == ':') {
                content = content.substr(0, lenght - 2) + '...';
            } else if (last == '.' || last == '?' || last == '!') {
                content = content.substr(0, lenght - 1);
            } else {
                content = content.substr(0, lenght - 1) + '...';
            }
        }
        return content;
    }
    this.normalizeUri = function () {
        ///<summary>Ajusta uma string para ser usada como fragmento de uma url (não pode ser a url toda)</summary>
        /// <returns type="String"></returns>
        var util = function (string) {
            this._string = string;
            this._strtr = function (str, from, to) {
                var fr = '', i = 0, j = 0, lenStr = 0, lenFrom = 0;
                var tmpFrom = [], tmpTo = [], ret = '', match = false;

                if (typeof from === 'object') {
                    this.krsort(from);
                    for (fr in from) {
                        tmpFrom.push(fr);
                        tmpTo.push(from[fr]);
                    }
                    from = tmpFrom;
                    to = tmpTo;
                }

                lenStr = str.length;
                lenFrom = from.length;
                for (i = 0; i < lenStr; i++) {
                    match = false;
                    for (j = 0; j < lenFrom; j++) {
                        if (str.substr(i, from[j].length) == from[j]) {
                            match = true;
                            i = (i + from[j].length) - 1;
                            break;
                        }
                    }
                    if (false !== match) {
                        ret += to[j];
                    } else {
                        ret += str[i];
                    }
                }
                return ret;
            };
            this.replace = function () {
                this._string = this._string.replace(/[ ]+/g, ' ');
                this._string = this._strtr(this._string, "áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ '&\"-", "aaaaeeiooouucAAAAEEIOOOUUC_____");
                this._string = this._string.replace(/\W/g, '');
                this._string = this._string.replace(/_/g, '-');
                //remove hífens consecutivos
                while (true) {
                    if (this._string.indexOf('--') == -1) {
                        break;
                    }
                    this._string = this._string.replace(/--/g, '-');
                }


                return this;
            };
            this.get = function () {
                return this._string;
            }
        }
        var o = new util(this._getString());
        return o.replace().get();
    };
    this.toFormat = function (format) {
        ///<summary>Converte uma string em um formato especial</summary>
        /// <param name="format" type="String">O formato numérico e ser convertido, utilize o list slice.list.string.format para uma listagem</param>
        /// <returns type="String">A string numérica formatada.</returns>
        var s = '';

        switch (format) {
            case slice.list.string.format.IntegerFriendly:
                s = this._toIntegerFriendly();
                break;
            case slice.list.string.format.MegahertzFriendly:
                s = this._toMegahertzFriendly();
                break;
            case slice.list.string.format.BytesFriendly:
                s = this._toBytesFriendly();
                break;
            case slice.list.string.format.TimeFriendly:
                s = this._toTimeFriendly();
                break;
        }
        return s;
    }
    this.str_replace = function (find, replace) {
        ///<summary>Substitui "find" por "replace" dentro da string</summary>
        /// <returns type="String"></returns>
        var content = this._getString();
        while (true) {
            var p = content.indexOf(find);
            if (p == -1) {
                break;
            }
            content = content.replace(find, replace);
        }

        return content;
    };
    this.rand = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    //#endregion
    this.validUrl = function () {
        var value = this._getString();
        return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }
     
    this.timeStamp = function () { 
        return Math.round(new Date().getTime() / 1000);
    }
     
    //#region construtor
    if (string) {
        this._setString(string);
    }
    //#endregion
}
function sliceScroller(onScroll, scrollLimit, scrollDirection) {
    ///<summary>Anexa um evento quando a rolagem da página horizontal ou vertical atinge um limite</summary>
    /// <param name="onScroll" type="Function">A função que ocorre quando o limite de rolagem é atingido</param>
    /// <param name="scrollLimit" type="Number">Um número de 0 a 100 que representa o limite para que o evento ocorra. Padrão 85</param>
    /// <param name="scrollDirection" type="String">A direção da rolagem, utilize o list slice.list.scroll.direction. Padrão slice.list.scroll.direction.Vertical</param>
    //#region propridades privadas
    this._scrollLimit = 85;
    this._scrollDirection = slice.list.scroll.direction.Vertical;
    this._setScrollLimit = function (scrollLimit) {
        this._scrollLimit = scrollLimit;
    };
    this._getScrollLimit = function () {
        return this._scrollLimit;
    };
    this._getPageSize = function () {
        var xScroll, yScroll;

        if (window.innerHeight && window.scrollMaxY) {
            xScroll = document.body.scrollWidth;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }

        var windowWidth, windowHeight;
        if (self.innerHeight) {	// all except Explorer
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }

        // for small pages with total height less then height of the viewport
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        // for small pages with total width less then width of the viewport
        if (xScroll < windowWidth) {
            pageWidth = windowWidth;
        } else {
            pageWidth = xScroll;
        }

        arrayPageSize = new Array(pageWidth, pageHeight, windowWidth, windowHeight)
        return arrayPageSize;
    };
    this._getPageScroll = function () {
        var scrOfX = 0, scrOfY = 0;
        if (typeof (window.pageYOffset) == 'number') {
            //Netscape compliant
            scrOfY = window.pageYOffset;
            scrOfX = window.pageXOffset;
        } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
        } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
        }
        return [scrOfX, scrOfY];
    };
    this._attach = function () {
        ///<summary>Anexa o evento para quando a página é rolada para o final, exibe mais comentários</summary>
        window.onscroll = function () {
            //se não houver mais div_list, usuário mudou de página
            var o = window._sliceScroller;
            if (!o) {
                return;
            }

            if (o._getScrollPositionPercent() < o._getScrollLimit()) {
                return;
            }
            //chama evento
            o._onScroll();
        }
    };
    this._unattachEvent = function () {
        window.onscroll = function () { }
    };
    this._store = function () {
        window._sliceScroller = this;
    };
    this._load = function () {
        var o = window._sliceScroller;
        if (!o) {
            return;
        }
        //recarrega evento
        this._onScroll = o._onScroll;
        this._setScrollLimit(o._getScrollLimit());
    };
    this._getScrollPositionPercent = function () {
        ///<summary>Retorna o percentual de rolagem, um inteiro 0-100 do limite inferior</summary>
        var scroll = this._getPageScroll();
        var page = this._getPageSize();
        //var currentPosition = scroll[1] + page[3];
        var currentPosition = page[1] - page[3];
        var currentPercent = 0;
        //currentPercent = Math.round((currentPosition * 100) / page[3]);
        currentPercent = Math.round((scroll[1] * 100) / currentPosition);

        /*console.log(page);
        console.log(scroll);
        console.log(currentPercent);*/
        return currentPercent;

    };
    this._onScroll = function () {
        ///<summary>Método/evento a ser sobrescrito quando a barra de rolagem vertical alcança o limite inferior</summary>
    }
    //#endregion
    //#region propriedades públicas
    this.dispose = function () {
        //remove evento
        this._unattachEvent();
        //remove elemtno
        window._sliceScroller = null;
    };
    //#endregion
    //#region construtor
    this._load();
    if (scrollLimit) {
        this._setScrollLimit(scrollLimit);
    }
    if (onScroll) {
        this._onScroll = onScroll;
        this._attach();
        this._store();
    }
    //#endregion
}
function sliceStorage(method) {
    /// <summary>Classe para trabalhar com armazenamento e leitura de dados através das APIs sessionStorage e localStorage.</summary>
    ///<param name="method" type="String">O método de armazenamento, utilize o list slice.list.storage.method para listagem. Por padrão é slice.list.storage.method.Session</param>
    //#region propriedades privadas
    this._method = slice.list.storage.method.Session;
    this._clearOnExceeded = true;
    this._maxAge = 0;
    this._getMaxAge = function () {
        return this._maxAge;
    };
    this._setMethod = function (method) {
        this._method = method;
    };
    this._getMethod = function () {
        return this._method;
    };
    this._getObj = function () {
        /// <summary>Retorna um objeto de HTML% de acordo com o método especificado</summary>
        /// <returns type="Object">Um objeto do tipo sessionStorage ou localStorage</returns>
        return this._getMethod() == slice.list.storage.method.Session ? window.sessionStorage : window.localStorage;
    };
    this._isClearOnExceeded = function () {
        return this._clearOnExceeded;
    };
    this._normalizeFieldName = function (fieldName) {
        return fieldName instanceof Array ? fieldName.join(',') : fieldName;
    };
    this._unsetRandom = function () {
        var t = this.getLength();
        if (t == 0) {
            return;
        }
        var randomnumber = Math.floor(Math.random() * t);
        this.unsetField(this.getFieldNameByOrder(randomnumber));
    };
    //#endregion
    //#region propriedades públicas
    this.setMaxAge = function (number, timeUnit) {
        /// <summary>Define o tempo de validade de um registro. Por padrão ele é armazenado para sempre no localStorage e até o fechamento da aba no sessionStorage.</summary>
        /// <param name="number" type="Number">Um número inteiro</param>
        /// <param name="timeUnit" type="Number">A unidade de tempo, utilize o list slice.list.storage.timeUnit.</param>
        this._maxAge = number * timeUnit;
        return this;
    };
    this.getFieldNameByOrder = function (order) {
        /// <summary>Retorna o nome do campo a partir da ordem</summary>
        /// <param name="order" type="Number">Um número inteiro de 0-(comprimento de registros - 1)</param>
        /// <returns type="String"></returns>
        return this._getObj().key(order);
    };
    this.isSupported = function () {
        /// <summary>Indica se o navegador tem suporte ao storage</summary>
        /// <returns type="Boolean"></returns>
        var r = false;
        try {
            r = typeof (this._getObj()) == 'undefined' ? false : true;
        } catch (e) {
            r = false;
        }
        return r;
    };
    this.getLength = function () {
        /// <summary>Retorna A quantidade de registros do tipo de storage definido para o domínio</summary>
        /// <returns type="Number"></returns>
        return this._getObj().length;
    };
    this.setField = function (fieldName, value) {
        /// <summary>Define um registro. Se ele já existir, será sobrescrito</summary>
        /// <param name="fieldName" type="Mixed">O nome do campo, pode-se passar um Array se for uma chave múltipla</param>
        /// <param name="value" type="Object">O valor pode ser string, inteiro ou objeto</param>
        if (!this.isSupported()) {
            return this;
        }
        try {
            this._getObj().setItem(this._normalizeFieldName(fieldName), new Date().getTime() + ',' + JSON.stringify(value));
        } catch (e) {
            switch (e) {
                case QUOTA_EXCEEDED_ERR:
                    //remove um item e tenta de novo
                    if (this.isClearOnExceeded()) {
                        this._unsetRandom();
                        this.setField(fieldName, value);
                    }
                    break;
            }
        }
        return this;
    };
    this.getField = function (fieldName) {
        /// <summary>Retorna o valor do campo, se não estiver definido, retorna uma string de comprimento zero</summary>
        ///<param name="fieldName" type="Mixed">O nome do campo, pode-se passar um Array se for uma chave múltipla</param>
        /// <returns type="Mixed"></returns>
        if (!this.isSupported()) {
            return '';
        }
        if (!this.issetField(fieldName)) {
            return '';
        }

        //
        var s = this._getObj().getItem(this._normalizeFieldName(fieldName));
        var s1 = s.substring(s.indexOf(',') + 1);

        return JSON.parse(s1);
    };
    this.unsetField = function (fieldName) {
        /// <summary>Remove um campo/registro armazenado</summary>
        ///<param name="fieldName" type="Mixed">O nome do campo, pode-se passar um Array se for uma chave múltipla</param>|
        if (!this.isSupported()) {
            return this;
        }
        this._getObj().removeItem(this._normalizeFieldName(fieldName));
        return this;
    };
    this.unsetContent = function () {
        /// <summary>Remove todos os dados armazenados no storage</summary>
        if (!this.isSupported()) {
            return this;
        }
        this._getObj().clear();
        return this;
    };
    this.issetField = function (fieldName) {
        /// <summary>Indica se o campo foi definido</summary>
        ///<param name="fieldName" type="Mixed">O nome do campo, pode-se passar um Array se for uma chave múltipla</param>|
        /// <returns type="Boolean"></returns>
        var s = this._getObj().getItem(this._normalizeFieldName(fieldName));
        if (s == null) {
            return false;
        }
        //checar idade?
        if (this._getMaxAge() == 0) {
            return true;
        }
        var s1 = parseInt(s.substring(0, s.indexOf(',')));
        var s2 = new Date().getTime() - this._getMaxAge();

        return s1 > s2;
    };
    //#endregion
    //#region construtor
    if (method) {
        this._setMethod(method);
    }
    //#endregion
}
function sliceTime() {
    ///<summary>Converte a data rfc em um formato amigável para leitura</summary>
    /// <param name="timeRFC" type="String">a data em formato rfc</param>
    /// <param name="format" type="String">(Opcional, padrão é Full).O formato de retorno, utilize o list slice.list.time.format para obter a lista de formatos</param>
    //#region propriedades privadas
    this._timeRFC = '';
    this._format = slice.list.time.format.Full;
    this._containerId = null;
    this._containerList = new Array();
    this._containerIncrement = 1;
    this._timerMonitoreId = null;
    this._setContainerList = function (containerList) {
        this._containerList = containerList;
    };
    this._getContainerList = function () {
        return this._containerList;
    };
    this._setContainerIncrement = function (containerIncrement) {
        this._containerIncrement = containerIncrement;
    };
    this._getContainerIncrement = function () {
        return this._containerIncrement;
    };
    this._setTimerMonitoreId = function (timerMonitoreId) {
        this._timerMonitoreId = timerMonitoreId;
    };
    this._getTimerMonitoreId = function () {
        return this._timerMonitoreId;
    };
    this._getTimeRFC = function () {
        /// <summary>Retorna a data em formato RFC</summary>
        /// <returns type="String">A data em formato RFC</returns>
        return this._timeRFC;
    };
    this._getFormat = function () {
        /// <summary>Retorna o formato amigável a ser usado</summary>
        /// <returns type="String">O formato amigável</returns>
        return this._format;
    };
    this._setContainerId = function (id) {
        /// <summary>Define o id do container da data, usado apenas para auto atualização</summary>
        /// <param name="id" type="String">A id do objeto que contém ou deve conter a data, como span ou div</param>
        this._containerId = id;
    };
    this._getContainerId = function () {
        /// <summary>Retorna a id do container da data, usado apenas para auto atualização</summary>
        /// <returns type="String">A id do container</returns>
        return this._containerId;
    };
    this._getLang = function(){
        if (window.location.href.indexOf("//br.") > 0){
            return 'br';
        }else{
            return 'eng';
        }
    }
    this._monthToString = function (month, isShort) {
        /// <summary>Obtem o nome do mês</summary>
        /// <param name="month" type="Number">O número do mês 0-11</param>
        /// <param name="isShort" type="Boolean">Se verdadeiro, o nome do mês fica abreviado</param>
        /// <returns type="String">Retorna o mês em formato de texto</returns>
        if (this._getLang()=='br'){
            var pt = new Array('Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro');
        }else{
            var pt = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
        }
        var s = pt[month];
        if (s) {
            s = (isShort ? s.substring(0, 3) : s);
        } else {
            s = '';
        }
        return s;
    };
    this._yearToString = function (year, isShort) {
        /// <summary>Obtem o ano</summary>
        /// <param name="year" type="Number">O ano em formato de quatro dígitos</param>
        /// <param name="isShort" type="Boolean">Se verdadeiro, o ano é reduzido para os últimos dois dígitos</param>
        var s = new String(year);
        s = isShort ? s.substring(2, 4) : s;
        return s;
    };
    this._leadingZero = function (number) {
        /// <summary>Garante ao menos dois dígitos, colocando um 0 à esquerda</summary>
        /// <param name="number" type="Mixed">O número int ou string</param>
        /// <param name="short" type="String">Adiciona 0 à esquerda se o número for menor que 10</param>
        return parseInt('' + number) < 10 ? '0' + number : '' + number;
    };
   
    this._getFullTextENG = function () {
        /// <summary>A partir do tempoRFC fornecido, transforma em um formato amigável em texto completo</summary>
        /// <returns type="String">A data em formato completo</returns>
        var o = new Date(this._getTimeRFC());
        var c = new Date();
        var d = Math.round(c.getTime() / 1000) - Math.round(o.getTime() / 1000);
        var s = "";
        var s1 = "";
        //segundos
        /*if (d < 60) {
        s1 = d < 2 ? 'segundos' : d + ' segundos';
        return this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ' atrás)';
        }*/
        //minutos
        if (d < (60 * 60)) {

            if (Math.round(d / 60) < 2) {
                var t = Math.round(d / 60);
                s1 = t > 0 ? t + " minute" : 'seconds';
            } else {
                s1 = Math.round(d / 60) + " minutes";
            }
            return this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ' ago)';
        }
        //horas
        if (d < (60 * 60 * 24)) {
            if (Math.round(d / (60 * 60)) < 2) {
                s1 = Math.round(d / (60 * 60)) + " hour";
            } else {
                s1 = Math.round(d / (60 * 60)) + " hours";
            }

            return (o.getDate() != c.getDate() ? this._leadingZero(o.getDate()) + ' ' + this._monthToString(o.getMonth(), true) + ' ' : '') + this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ' ago)';
        }
        //dias
        if (d < (60 * 60 * 24 * 7)) {
            switch (Math.round(d / (60 * 60 * 24))) {
                case 1:
                    s1 = "Yesterday";
                    break;
                case 2:
                    s1 = "Day before yesterday";
                    break;
                default:
                    s1 = Math.round(d / (60 * 60 * 24)) + " days ago";
                    break;
            }
            return this._monthToString(o.getMonth(), true) + ' ' + this._leadingZero(o.getDate()) + ', at ' + this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ')';
        }
        //semanas
        if (d < (60 * 60 * 24 * 7 * 4)) {
            if (Math.round(d / (60 * 60 * 24 * 7)) < 2) {
                s1 = Math.round(d / (60 * 60 * 24 * 7)) + " week ago";
            } else {
                s1 = Math.round(d / (60 * 60 * 24 * 7)) + " weeks ago";
            }

            return this._monthToString(o.getMonth(), true) + ' ' + this._leadingZero(o.getDate()) + ' ' + ' (' + s1 + ')';
        }
        //meses
        if (d < (60 * 60 * 24 * 7 * 4 * 12)) {
            if (Math.round(d / (60 * 60 * 24 * 7 * 4)) < 2) {
                s1 = Math.round(d / (60 * 60 * 24 * 7 * 4)) + " month ago";
            } else {
                s1 = Math.round(d / (60 * 60 * 24 * 7 * 4)) + " months agos";
            }

            return this._monthToString(o.getMonth(), true) + ' ' + this._leadingZero(o.getDate()) + ', ' + (o.getFullYear() != c.getFullYear() ? this._yearToString(o.getFullYear(), false) + ' ' : '') + '(' + s1 + ')';
        }
        //anos
        if (d > (60 * 60 * 24 * 7 * 4 * 12)) {
            if (Math.round(d / (60 * 60 * 24 * 7 * 4)) < 24) {
                s1 = Math.floor(d / (60 * 60 * 24 * 7 * 4 * 12)) + " year ago";
            } else {
                s1 = Math.floor(d / (60 * 60 * 24 * 7 * 4 * 12)) + " years ago";
            }

            return this._monthToString(o.getMonth(), true) + ' ' + this._leadingZero(o.getDate()) + ', ' + o.getFullYear() + ' (' + s1 + ')';
        }
        return '';
    };
    this._getFullTextBR = function () {
        /// <summary>A partir do tempoRFC fornecido, transforma em um formato amigável em texto completo</summary>
        /// <returns type="String">A data em formato completo</returns>
        var o = new Date(this._getTimeRFC());
        var c = new Date();
        var d = Math.round(c.getTime() / 1000) - Math.round(o.getTime() / 1000);
        var s = "";
        var s1 = "";
        //segundos
        /*if (d < 60) {
        s1 = d < 2 ? 'segundos' : d + ' segundos';
        return this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ' atrás)';
        }*/
        //minutos
        if (d < (60 * 60)) {

            if (Math.round(d / 60) < 2) {
                var t = Math.round(d / 60);
                s1 = t > 0 ? t + " minuto" : 'segundos';
            } else {
                s1 = Math.round(d / 60) + " minutos";
            }
            return this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ' atrás)';
        }
        //horas
        if (d < (60 * 60 * 24)) {
            if (Math.round(d / (60 * 60)) < 2) {
                s1 = Math.round(d / (60 * 60)) + " hora";
            } else {
                s1 = Math.round(d / (60 * 60)) + " horas";
            }

            return (o.getDate() != c.getDate() ? this._leadingZero(o.getDate()) + ' ' + this._monthToString(o.getMonth(), true) + ' ' : '') + this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ' atrás)';
        }
        //dias
        if (d < (60 * 60 * 24 * 7)) {
            switch (Math.round(d / (60 * 60 * 24))) {
                case 1:
                    s1 = "Ontem";
                    break;
                case 2:
                    s1 = "Anteontem";
                    break;
                default:
                    s1 = Math.round(d / (60 * 60 * 24)) + " dias atrás";
                    break;
            }
            return this._leadingZero(o.getDate()) + ' ' + this._monthToString(o.getMonth(), true) + ' ' + this._leadingZero(o.getHours()) + ':' + this._leadingZero(o.getMinutes()) + ' (' + s1 + ')';
        }
        //semanas
        if (d < (60 * 60 * 24 * 7 * 4)) {
            if (Math.round(d / (60 * 60 * 24 * 7)) < 2) {
                s1 = Math.round(d / (60 * 60 * 24 * 7)) + " semana atrás";
            } else {
                s1 = Math.round(d / (60 * 60 * 24 * 7)) + " semanas atrás";
            }

            return this._leadingZero(o.getDate()) + ' ' + this._monthToString(o.getMonth(), true) + ' ' + ' (' + s1 + ')';
        }
        //meses
        if (d < (60 * 60 * 24 * 7 * 4 * 12)) {
            if (Math.round(d / (60 * 60 * 24 * 7 * 4)) < 2) {
                s1 = Math.round(d / (60 * 60 * 24 * 7 * 4)) + " mês atrás";
            } else {
                s1 = Math.round(d / (60 * 60 * 24 * 7 * 4)) + " meses atrás";
            }

            return this._leadingZero(o.getDate()) + ' ' + this._monthToString(o.getMonth(), true) + ' ' + (o.getFullYear() != c.getFullYear() ? this._yearToString(o.getFullYear(), false) + ' ' : '') + '(' + s1 + ')';
        }
        //anos
        if (d > (60 * 60 * 24 * 7 * 4 * 12)) {
            if (Math.round(d / (60 * 60 * 24 * 7 * 4)) < 24) {
                s1 = Math.floor(d / (60 * 60 * 24 * 7 * 4 * 12)) + " ano atrás";
            } else {
                s1 = Math.floor(d / (60 * 60 * 24 * 7 * 4 * 12)) + " anos atrás";
            }

            return this._leadingZero(o.getDate()) + ' ' + this._monthToString(o.getMonth(), true) + ' ' + o.getFullYear() + ' (' + s1 + ')';
        }
        return '';
    };
   
    this._getFullText = function(){
        if (this._getLang()=='br'){
            return this._getFullTextBR();
        }else{
            return this._getFullTextENG();
        }

    }
    this._monitoreStop = function () {
        var id = this._getTimerMonitoreId();
        if (id) {
            clearTimeout(id);
            this._setTimerMonitoreId(null);
        }
    };
    this._monitoreStart = function () {
        this._monitoreStop();
        var id = setTimeout('new sliceTime()._monitoreRun()', 20 * 1000);
        this._setTimerMonitoreId(id);
        this._store();
    };
    this._monitoreRun = function () {
        this._monitoreStop();
        this._updateAll();
    };
    this._detectFormatInTag = function (o) {
        var s = o.innerHTML.toLowerCase();
        if (s.indexOf('[onlytime]') > -1) {
            return slice.list.time.format.OnlyTime;
        }
        if (s.indexOf('[onlytext]') > -1) {
            return slice.list.time.format.OnlyText;
        }

        return slice.list.time.format.Full;
    };
    this._updateAll = function () {
        /// <summary>Atualiza o tempo de todos os containeres adicionados</summary>
        var removed = new Array();
        var total = this._getContainerList().length;
        for (var n = 0; n != total; n++) {
            var o = this._getContainerList()[n];
            if (document.getElement(o.containerId)) {
                this.setTimeRFC(o.time);
                this.setFormat(o.format);
                this.write(o.containerId);
            } else {
                //armazena o índice para remoção
                removed.push(n);
            }
        }
        //remove os elementos não mais presentes do final para o começo para preservar o índice
        while (removed.length > 0) {
            this._getContainerList().splice(removed.pop(), 1);
        }
        //atualiza
        this._store();
        //refaz loop
        this._monitoreStart();
    };
    this._applyTitle = function (o) {
        var d = new Date(o.getAttribute('datetime'));
        var s = '';
        if (this._getLang()=='br'){
            s += ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d.getDay()] + ', ';
            s += this._leadingZero(d.getDate()) + ' de ' + this._monthToString(d.getMonth(), false).toLowerCase() + ' de ' + d.getFullYear() + ' às ';
            s += this._leadingZero(d.getHours()) + ':' + this._leadingZero(d.getMinutes());
        }else{        
            s += ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()] + ', ';
            s += this._monthToString(d.getMonth(), false).toLowerCase() + ' ' + this._leadingZero(d.getDate()) + ', ' + d.getFullYear() + ' at ';
            s += this._leadingZero(d.getHours()) + ':' + this._leadingZero(d.getMinutes());
        }
              
        o.setAttribute('title', s);
    };
    this._updateByTagTime = function () {
        var d = document.getElementsByTagName('time');
        var total = d.length;
        for (var n = 0; n != total; n++) {
            var o = d[n];
            if (!o.getAttribute('datetime')) {
                continue;
            }
            //define id se nao houver
            if (!o.getAttribute('id')) {
                o.setAttribute('id', 'time_' + this._getContainerIncrement());
                this._setContainerIncrement(this._getContainerIncrement() + 1);
            }
            //define titulo se nao houver
            if (!o.getAttribute('title')) {
                this._applyTitle(o);
            }
            this.setFormat(this._detectFormatInTag(o));
            this.setTimeRFC(o.getAttribute('datetime'));
            this.update(o.getAttribute('id'));
        }
    };
    this._store = function () {
        window._sliceTime = this;
    };
    this._load = function () {
        var o = window._sliceTime;
        if (!o) {
            return;
        }
        this.setTimeRFC(o._getTimeRFC());
        this.setFormat(o._getFormat());
        this._setContainerId(o._getContainerId());
        this._setTimerMonitoreId(o._getTimerMonitoreId());
        this._setContainerList(o._getContainerList());
        this._setContainerIncrement(o._getContainerIncrement());
    };
    this._dispose = function () {
        /// <summary>Libera todos os recursos</summary>
        window._sliceTime = null;
        this._monitoreStop();
    };
    //#endregion 
    //#region propriedades públicas
    this.setFormat = function (format) {
        /// <summary>Define o formato amigável a retornar</summary>
        /// <param name="format" type="String">O formato de retorno, utilize o list slice.list.time.format para obter a lista de formatos</param>
        this._format = format;
        return this;
    };
    this.setTimeRFC = function (timeRFC) {
        /// <summary>Define a data em formato rfc ou iso a ser convertida</summary>
        /// <param name="timeRFC" type="String">a data em formato rfc ou iso</param>
        this._timeRFC = timeRFC;
        return this;
    };
    this.update = function (containerId) {
        /// <summary>Define um container que terá o tempo informado atualizado com frequência inferior a 1 minuto</summary>
        /// <param name="id" type="String">A id do objeto que contém ou deve conter a data, como span ou div</param>
        if (!containerId) {
            this._updateByTagTime();
            return this;
        }
        //armazena id do container
        //chama o timer
        this._monitoreStart();
        this._setContainerId(containerId);
        //se o elemento já estiver, nao adiciona
        var total = this._getContainerList().length;
        for (var n = 0; n != total; n++) {
            var o1 = this._getContainerList()[n];
            if (o1.containerId == this._getContainerId()) {
                return this;
            }
        }

        var o = new Object();
        o = {
            time: this._getTimeRFC(),
            format: this._getFormat(),
            containerId: this._getContainerId()
        }
        new sliceContainer(this._getContainerId()).write(this.get());
        //adiciona
        this._getContainerList().push(o);
        this._store();
        return this;
    };
    this.write = function (containerId) {
        /// <summary>Escreve a data no interior de um container</summary>
        /// <param name="containerId" type="String">A id do objeto que contém ou deve conter a data, como span ou div</param>
        this._setContainerId(containerId);
        var d = document.getElement(containerId);
        if (d) {
            d.innerHTML = this.get();
        }
        return this;
    };
    this.get = function () {
        /// <summary>Retorna uma string em formato amigável</summary>
        var s = this._getFullText();
        var p, e;
        switch (this._getFormat()) {
            //data sem o comparação em minutos, horas, dias       
            case slice.list.time.format.OnlyTime:
                p = s.indexOf(' (');
                if (p == -1) {
                    break;
                }
                s = s.substring(0, p);
                break;
            //apenas a comparação em minutos, horas, dias       
            case slice.list.time.format.OnlyText:
                p = s.indexOf('(');
                if (p == -1) {
                    break;
                }
                e = s.indexOf(')');
                if (e == -1) {
                    break;
                }
                s = s.substring(p + 1, e);
                break;
            //formato completo data + comparação       
            case slice.list.time.format.Full:
            default:
                //não faz naad
                break;
        }
        return s;
    };
    //#endregion
    //#region construtor
    this._load();
    //#endregion
}
function sliceYoutube(id) {
    ///<summary>Agrega métodos para exibir o embed do Youtube.</summary>
    /// <param name="id" type="String">A id do vídeo</param>
    //#region propriedades privadas
    this._id = '';
    this._api = false;
    this._ready = false;
    this._width = 640;
    this._height = 390;
    this._autoplay = false;
    this._caption = false;
    this._player = null;
    this._fullscreen = true;
    this._related = true;
    this._hd = false;
    this._controls = true;
    this._annotations = true;
    this._modestBranding = false;
    this._setId = function (id) {
        ///<summary>Define a id do vídeo</summary>
        /// <param name="id" type="String">A id do vídeo</param>
        this._id = id;
    };
    this._getId = function () {
        return this._id;
    };
    this._setReady = function (ready) {
        this._ready = ready;
        this._store();
    };
    this._isReady = function () {
        return this._ready;
    };
    this._setPlayer = function (player) {
        ///<summary>Define a player do vídeo, criado atravez da api do youtube</summary>
        /// <param name="id" type="String">o player do vídeo</param>
        this._player = player;
        this._store();
    };
    this._getPlayer = function () {
        return this._player;
    };
    this._getWidth = function () {
        return this._width;
    };
    this._getHeight = function () {
        return this._height;
    };
    this._isAutoplay = function () {
        return this._autoplay;
    };
    this._isFullscreen = function () {
        return this._fullscreen;
    };
    this._isCaption = function () {
        return this._caption;
    };
    this._isControls = function () {
        return this._controls;
    };
    this._isRelated = function () {
        return this._related;
    };
    this._isModestBranding = function () {
        return this._modestBranding;
    };
    this._isHd = function () {
        return this._hd;
    };
    this._isApi = function () {
        return this._api;

    };
    this._isAnnotations = function () {
        return this._annotations;
    };
    this._store = function () {
        window._sliceYoutube = this;
    };
    this._load = function () {
        var o = window._sliceYoutube;
        if (!o) {
            return;
        }
        this._setId(o._getId());
        this._setReady(o._isReady());
        this.setAutoplay(o._isAutoplay());
        this.setHd(o._isHd());
        this.setAnnotations(o._isAnnotations());
        this.setControls(o._isControls());
        this.setCaption(o._isCaption());
        this.setFullscreen(o._isFullscreen());
        this.setModestBranding(o._isModestBranding());
        this.setRelated(o._isRelated());
        this.setWidth(o._getWidth());
        this.setHeight(o._getHeight());
        this._setPlayer(o._getPlayer());

    };
    this._initApi = function () {

        if (YT == undefined) {
            setTimeout('new sliceYoutube()._initApi();', 500);
            return;
        }

        var player = new YT.Player('player', {
            height: this._getHeight(),
            width: this._getWidth(),
            videoId: this._getId(),
            playerVars: {
                rel: (this._isRelated() ? 1 : 0),
                autoplay: (this._isAutoplay() ? 1 : 0),
                cc_load_policy: (this._isCaption() ? 1 : 0),
                hd: (this._isHd() ? 1 : 0),
                fs: (this._isFullscreen() ? 1 : 0),
                modestbranding: (this._isModestBranding() ? 1 : 0),
                controls: (this._isControls() ? 2 : 0),
                iv_load_policy: (this._isAnnotations() ? 1 : 3),
                autohide: 1
            },
            events: {
                'onReady': this._onReady
            }
        });

        //armazena o player
        window._yplayer = player;
        this._setPlayer(player);
        this._store();
    };
    this._onReady = function (event) {
        var obj = new sliceYoutube();
        /*if (obj._isAutoplay()) {
        event.target.playVideo();
        }*/
        if (obj._isHd()) {
            event.target.setPlaybackQuality('highres');  //forço o HD aqui, pois nos eventos nao tava indo 100% das vezes
        }
        obj._setReady(true);
        obj._store();
    };
    this._getIframe = function () {
        ///<summary>Retorna o código html para exibição do player do youtube.</summary>
        /// <returns type="String">O embed em html</returns>
        this._load();
        var s = '';
        var url = 'https://www.youtube.com/embed/' + this._getId();
        var a = new Array();
        if (this._isAutoplay()) {
            a.push('autoplay=1');
        }
        if (this._isCaption()) {
            a.push('cc_load_policy=1');
        }
        if (!this._isFullscreen()) {
            a.push('fs=0');
        }
        if (this._isModestBranding()) {
            a.push('modestbranding=1');
        }
        if (!this._isControls()) {
            a.push('controls=0');
        }
        if (!this._isAnnotations()) {
            a.push('iv_load_policy=3');
        }
        if (!this._isRelated()) {
            a.push('rel=0');
        }
        if (this._isHd()) {
            a.push('hd=1');
        }

        url += '/?enablejsapi=1&autohide=1';
        if (a.length > 0) {
            url += '&' + a.join('&');
        }

        s += '<iframe width="' + this._getWidth() + '" height="' + this._getHeight() + '" src="' + url + '" frameborder="0" ' + (this._isFullscreen() ? 'allowfullscreen' : '') + '></iframe>';

        return s;
    };
    this._getIframeApi = function () {
        ///<summary>Retorna o código html para exibição do player do youtube.</summary>
        /// <returns type="String">O embed em html</returns>
        this._load();
        var s = '';

        s += '<div id="player" style="width:' + this._getWidth() + '; height:' + this._getHeight() + ';"></div>';

        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        setTimeout('new sliceYoutube()._initApi();', 500);

        return s;
    };
    //#endregion
    //#region propriedades públicas
    this.dispose = function () {
        if (!window._sliceYoutube) {
            return;
        }
        window._sliceYoutube = null;
    };
    this.setWidth = function (width) {
        ///<summary>Define a largura do embed em pixels ou percentual. Padrão 640</summary>
        /// <param name="width" type="String">A largura em pixels ou percentual. Ex: 640, '80%'</param>
        this._width = width;
        return this;
    };
    this.setHeight = function (height) {
        ///<summary>Define a altura do embed em pixels. Padrão 640</summary>
        /// <param name="height" type="Number">A altura em pixels</param>
        this._height = height;
        return this;
    };
    this.setAutoplay = function (autoplay) {
        ///<summary>Define se o embed começa a tocar assim que é exibido. Padrão false</summary>
        /// <param name="autoplay" type="Boolean">Um valor booleano indicando se o vídeo deve autotocar</param>
        this._autoplay = autoplay;
        return this;
    };
    this.setCaption = function (caption) {
        ///<summary>Define se o embed pode exibir legendas se o vídeo possuir. Padrão false</summary>
        /// <param name="caption" type="Boolean">Um valor booleano</param>
        this._caption = caption;
        return this;
    };
    this.setAnnotations = function (annotations) {
        ///<summary>Define se o embed exibirá ou não as anotações. Padrão true.</summary>
        /// <param name="annotations" type="Boolean">Um valor booleano</param>
        this._annotations = annotations;
        return this;
    };
    this.setControls = function (controls) {
        ///<summary>Define se o vídeo terá a barra de progresso e botões de navegação. Padrão true</summary>
        /// <param name="caption" type="Boolean">Um valor booleano</param>
        this._controls = controls;
        return this;
    };
    this.setModestBranding = function (modestBranding) {
        ///<summary>Define se o vídeo apareça o logo do youtube de forma mais discreta. Padrão false</summary>
        /// <param name="caption" type="Boolean">Um valor booleano</param>
        this._modestBranding = modestBranding;
        return this;
    };
    this.setFullscreen = function (fullscreen) {
        ///<summary>Define se o embed terá o botão para exibir em tela cheia. Padrão true</summary>
        /// <param name="fullscreen" type="Boolean">Um valor booleano</param>
        this._caption = fullscreen;
        return this;
    };
    this.setRelated = function (related) {
        ///<summary>Define se os vídeos relacionados serão exibidos quando a reprodução do vídeo encerrar. Padrão true</summary>
        /// <param name="related" type="Boolean">Um valor booleano</param>
        this._related = related;
        return this;
    };
    this.setHd = function (hd) {
        ///<summary>Define se os vídeos rodarão em hd. Padrão false</summary>
        /// <param name="hd" type="Boolean">Um valor booleano</param>
        this._hd = hd;
        return this;
    };
    this.setApi = function (api) {
        ///<summary>Define se ira utilizar a api-jp para ler os do player no iframe. Padrão false</summary>
        /// <param name="api" type="Boolean">Um valor booleano</param>
        this._api = api;
        return this;
    };
    this.getEmbed = function () {
        ///<summary>Retorna o código html para exibição do player do youtube.</summary>
        /// <returns type="String">O embed em html</returns>
        var s = '';
        if (this._isApi()) {
            s = this._getIframeApi();
        } else {
            s = this._getIframe();
        }

        new sliceContainer('code_youtube').write(s);
        return this;
    };
    this.getEmbedCode = function () {
        ///<summary>Retorna o código html para exibição do player do youtube.</summary>
        /// <returns type="String">O embed em html</returns>
        var s = '';
        if (this._isApi()) {
            s = this._getIframeApi();
        } else {
            s = this._getIframe();
        }
        
        return s;
    };
    this.getCurrentTime = function () {
        if (!this._isReady()) {
            return 0;
        }
        var player = new sliceYoutube()._getPlayer();
        return player.getCurrentTime();
    };
    this.getDuration = function () {
        if (!this._isReady()) {
            return 0;
        }
        var player = new sliceYoutube()._getPlayer();
        return player.getDuration();
    };
    this.play = function () {
        if (!this._isReady()) {
            return;
        }
        var player = new sliceYoutube()._getPlayer();
        player.playVideo();
        return this;
    };
    this.stop = function () {
        if (!this._isReady()) {
            return;
        }
        var player = new sliceYoutube()._getPlayer();
        player.stopVideo();
        return this;
    }
    this.pause = function () {
        if (!this._isReady()) {
            return;
        }
        var player = new sliceYoutube()._getPlayer();
        player.pauseVideo();
        return this;
    }
    this.mude = function () {
        if (!this._isReady()) {
            return;
        }
        var player = new sliceYoutube()._getPlayer();
        player.mute();
        return this;
    }
    this.unMute = function () {
        if (!this._isReady()) {
            return;
        }
        var player = new sliceYoutube()._getPlayer();
        player.unMute();
        return this;
    }
    this.isReady = function () {
        return this._ready;
    };
    //#endregion
    //#region construtor
    this._load();
    if (id) {
        this._setId(id);
    }
    this._store();
    //#endregion
}
 
function sliceVimeo(id) {
    ///<summary>Agrega métodos para exibir o embed do Youtube.</summary>
    /// <param name="id" type="String">A id do vídeo</param>
    //#region propriedades privadas
    this._id = '';
    this._api = false;
    this._ready = false;
    this._width = 640;
    this._height = 390;
    this._autoplay = false;
    this._player = null;
    this._fullscreen = true;

    this._setId = function (id) {
        ///<summary>Define a id do vídeo</summary>
        /// <param name="id" type="String">A id do vídeo</param>
        this._id = id;
    };
    this._getId = function () {
        return this._id;
    };
    this._setReady = function (ready) {
        this._ready = ready;
        this._store();
    };
    this._isReady = function () {
        return this._ready;
    };
    this._setPlayer = function (player) {
        ///<summary>Define a player do vídeo, criado atravez da api do youtube</summary>
        /// <param name="id" type="String">o player do vídeo</param>
        this._player = player;
        this._store();
    };
    this._getPlayer = function () {
        return this._player;
    };
    this._getWidth = function () {
        return this._width;
    };
    this._getHeight = function () {
        return this._height;
    };
    this._isAutoplay = function () {
        return this._autoplay;
    };
    this._isApi = function () {
        return this._api;

    };
    this._isFullscreen = function () {
        return this._fullscreen;
    };
    this._store = function () {
        window._sliceVimeo = this;
    };
    this._load = function () {
        var o = window._sliceVimeo;
        if (!o) {
            return;
        }
        this._setId(o._getId());
        this._setReady(o._isReady());
        this.setAutoplay(o._isAutoplay());
        this.setWidth(o._getWidth());
        this.setHeight(o._getHeight());
        this._setPlayer(o._getPlayer());
        this.setFullscreen(o._isFullscreen());

    };
    this._getIframe = function () {
        ///<summary>Retorna o código html para exibição do player do youtube.</summary>
        /// <returns type="String">O embed em html</returns>
        this._store();
        var s = '';
        var url = '//player.vimeo.com/video/' + this._getId();
        var a = new Array();
        if (this._isAutoplay()) {
            a.push('autoplay=1');
        }

        url += '?byline=0&portrait=0';
        if (a.length > 0) {
            url += '&' + a.join('&');
        }

        s += '<iframe src="' + url + '" src="' + url + '" width="' + this._getWidth() + '" height="' + this._getHeight() + '" frameborder="0"  ' + (this._isFullscreen() ? 'webkitallowfullscreen mozallowfullscreen allowfullscreen' : '') + '></iframe>';

        return s;
    };
    this._getIframeApi = function () {
        ///<summary>Retorna o código html para exibição do player.</summary>
        /// <returns type="String">O embed em html</returns>
        this._store();
        var s = '';

        return s;
    };
    //#endregion
    //#region propriedades públicas
    this.dispose = function () {
        if (!window._sliceVimeo) {
            return;
        }
        window._sliceVimeo = null;
    };
    this.setWidth = function (width) {
        ///<summary>Define a largura do embed em pixels ou percentual. Padrão 640</summary>
        /// <param name="width" type="String">A largura em pixels ou percentual. Ex: 640, '80%'</param>
        this._width = width;
        return this;
    };
    this.setHeight = function (height) {
        ///<summary>Define a altura do embed em pixels. Padrão 640</summary>
        /// <param name="height" type="Number">A altura em pixels</param>
        this._height = height;
        return this;
    };
    this.setAutoplay = function (autoplay) {
        ///<summary>Define se o embed começa a tocar assim que é exibido. Padrão false</summary>
        /// <param name="autoplay" type="Boolean">Um valor booleano indicando se o vídeo deve autotocar</param>
        this._autoplay = autoplay;
        return this;
    };
    this.setFullscreen = function (fullscreen) {
        ///<summary>Define se o embed terá o botão para exibir em tela cheia. Padrão true</summary>
        /// <param name="fullscreen" type="Boolean">Um valor booleano</param>
        this._caption = fullscreen;
        return this;
    };
    this.setApi = function (api) {
        ///<summary>Define se ira utilizar a api-jp para ler os do player no iframe. Padrão false</summary>
        /// <param name="api" type="Boolean">Um valor booleano</param>
        this._api = api;
        return this;
    };
    this.getEmbed = function () {
        ///<summary>Retorna o código html para exibição do player do.</summary>
        /// <returns type="String">O embed em html</returns>
        //if (this._isApi()) {
        //return this._getIframeApi();
        //}
        return this._getIframe();
    };
    this.isReady = function () {
        return this._ready;
    };
    //#endregion
    //#region construtor
    this._load();
    if (id) {
        this._setId(id);
    }
    this._store();
    //#endregion
}

function sliceBox() {
    /// <summary>Classe para manipular o box de exibição de itens</summary>
    //#region propriedades privadas
    this._width = 0;
    this._height = 0;
    this._title = '';
    this._content = '';
    this._totalButton = 0;
    this._form = 'formBox';
    this._onClose = null;
    this._clickToClose = true;
    this._viewClose = true;
    this._submitAction = function () { }
    this._getForm = function () {
        return this._form;
    };
    this._getWidth = function () {
        ///<summary>Retorna a _width</summary>
        /// <returns type="Number">Retorna a _width</returns>
        return this._width;
    };
    this._getHeight = function () {
        ///<summary>Retorna a height</summary>
        /// <returns type="Number">Retorna a height</returns>
        return this._height;
    };
    this._getTitle = function () {
        return this._title;
    };
    this._getContent = function () {
        return this._content;
    };
    this._isClickToClose = function () {
        return this._clickToClose;
    };
    this._isViewClose = function () {
        return this._viewClose;
    };
    this._setTotalButton = function (total) {
        this._totalButton = total;
        this._store();
        return this;
    };
    this._getTotalButton = function () {
        return this._totalButton;
    };
    this._setSubmitAction = function (action) {
        this._submitAction = action;
        this._store();
        return this;
    }
    this._getSubmitAction = function () {
        return this._submitAction;
    };
     
    this._getOnClose = function () {
        ///<summary>Retorna a _onClose</summary>
        /// <returns type="Function">Retorna a _onClose</returns>
        return this._onClose;
    };
     
    this._store = function () {
        window._sliceBox = this;
    };
    this._load = function () {
        var o = window._sliceBox;
        if (!o) {
            return;
        }
        this.setWidth(o._getWidth());
        this.setHeight(o._getHeight());
        this.setTitle(o._getTitle());
        this.setContent(o._getContent());
        this.setClickToClose(o._isClickToClose());
        this.setViewClose(o._isViewClose());
        this.setForm(o._getForm());
        this._setTotalButton(o._getTotalButton());
        this._setSubmitAction(o._getSubmitAction());

        this.setOnClose(o._getOnClose());
    };
    this._create = function () {
        var s = '';
        var content = this._getContent();
        if (content.length <= 0) {
            return;
        }

        s += '<form method="post" id="' + this._getForm() + '" name="' + this._getForm() + '" enctype="multipart/form-data">';
        if (this._isViewClose()) {
            s += '<div class="close"><a href="javascript:void(0);" id="sliceBoxClose">X</a></div>';
        }
        var title = this._getTitle();
        if (title.length > 0) {
            s += '<div class="title" id="sliceBoxTitle">' + title + '</div>';
        }
        s += '<div class="sb_content">' + content + '</div>';
        s += '<div class="actions" id="actions"></div>';

        var o = document.createElement('div');
        o.setAttribute('id', 'sliceBox');
        o.setAttribute('class', 'sliceBox');
        o.setAttribute('style', 'width:' + this._getWidth() + 'px;min-height:100px;height:100px');
        s += '</form>';
        o.innerHTML = s;
        new sliceDarkness().setClickToClose(this._isClickToClose()).show(o);
        var d = document.getElement('overlay');
        if (!d) {
            return;
        }
        var c = document.getElement('sliceBoxClose');
        if (c) {
            c.obj = this;
            c.onclick = function () {
                this.obj._execOnClose();
                new sliceDarkness().close();
            }
        }

        ///limpo o title+content neste ponto nao utilizarei mais
        this.setTitle('');
        this.setContent('');
    };
    this._createImage = function () {
        var s = '';
        var content = this._getContent();
        if (content.length <= 0) {
            return;
        }

        var maxSize = document.documentElement.clientWidth < document.documentElement.clientHeight ? document.documentElement.clientWidth : document.documentElement.clientHeight;
        maxSize = maxSize - 30;
        if (maxSize > 900) {
            maxSize = 900;
        }

        var image = new sliceImage();
        image.obj = this;
        image.setMaxWidth(maxSize);
        image.setMaxHeight(maxSize);
        image.setUrl(this._getContent());
        image.onReady = function () {
            if (!this.isValidResponse()) {
                window.open(this.obj._getContent());
                return;
            }

            var width = this._getWidth();
            var height = this._getHeight();

            var resized = this.needResize();
            var a = this.getResizedDimension();
            //console.log(a);

            if (width > this._getMaxWidth() || height > this._getMaxHeight()) {
                width = a[0];
                height = a[1];
            }

            this.obj._load();
            this.obj.setWidth(width);
            this.obj.setHeight(height);

            if (this.obj._isViewClose()) {
                s += '<div class="close"><a href="javascript:void(0);" id="sliceBoxClose">X</a></div>';
            }
            s += '<div class="sliceBoxImgContent" style="height:' + height + 'px;">';
            s += '<a href="' + this.obj._getContent() + '" target="_blank"><img src="' + this.obj._getContent() + '" width="' + width + '" height="' + height + '" /></a>';
            s += '</div>';

            var o = document.createElement('div');
            o.setAttribute('id', 'sliceBox');
            o.setAttribute('class', 'sliceBox');
            o.setAttribute('style', 'width:' + width + 'px;min-height:100px;height:100px;padding:0px;'); //background:url(' + this._getContent() + ') top center no-repeat;
            o.innerHTML = s;
            new sliceDarkness().setClickToClose(this.obj._isClickToClose()).show(o);
            var d = document.getElement('overlay');
            if (!d) {
                return;
            }

            var c = document.getElement('sliceBoxClose');
            if (c) {
                c.obj = this; 
                c.onclick = function () {
                    this.obj._execOnClose();
                    new sliceDarkness().close();
                }
            }
            ///limpo o title+content neste ponto nao utilizarei mais
            this.obj.setTitle('');
            this.obj.setContent('');
            this.obj._store();

        }
        image.load();



    };
    this._animate = function () {
        //nao anima se a base nao estiver no html
        var d = document.getElement('sliceBox');
        var o = document.getElement('overlay');
        if (!d || !o) {
            return;
        }
        d.style.width = this._getWidth() + 'px';
        d.style.minHeight = this._getHeight() + 'px';
        d.style.height = this._getHeight() + 'px';  //devo informar o min-height e height por causa do chrome        
        d.className = 'sliceBox sliceBoxView';
        o.className = 'overlayView';
        //reposiciona devido ao efeito
        new sliceDarkness().setDiv(d)._centerObject();
        //ajusta detalhes do efeito
        setTimeout('new sliceBox()._adjust();', 500);
    };
    this._adjust = function () {
        //ajusta alguns detalhes pra deixar mais agradavel
        var d = document.getElement('sliceBox');
        if (!d) {
            return;
        }
        //deixa o box livre para receber mais conteudo e se auto-ajustar
        d.style.height = 'auto';  //contorna o efeito reverso do chrome
        //d.style.minHeight = this._getHeight() + 'px;';

        var pgH = 0;
        if (window.innerHeight > 0) {
            var p = ((window.innerHeight - d.offsetHeight) / 2);
            if (p <= 0) {
                p = 30;
            }
            if (d.style.top != p + 'px') {
                d.style.top = p + 'px'; 
            }
        }

        var a = document.getElement('actions');
        if (!a) {
            return;
        }

        var style = 'actions actions_view';
        if (a.innerHTML.length > 10) {
            style = 'actions actions_view actions_view_content';
        }
        //exibo os botoes suavemente
        a.className = style;
    };

    this._execOnClose = function () {
        if (this._getOnClose() == null) {
            return;
        }
        this._getOnClose();  
    }
    //#endregion
    //#region propriedades publicas
    this.setClickToClose = function (clickToClose) {
        /// <summary>Define se ao clicar em uma area fora do div sera fechado. Por padrão é verdadeiro.</summary>
        /// <param name="clickToClose" type="Boolean">O valor booleano</param>
        this._clickToClose = clickToClose;
        this._store();
        return this;
    };
    this.setViewClose = function (view) {
        this._viewClose = view;
        this._store();
        return this;
    };
    this.setOnClose = function (i) {
        this._onClose = i;
        this._store();
        return this;
    }
    this.setWidth = function (width) {
        this._width = width;
        this._store();
        return this;
    };
    this.setHeight = function (height) {
        this._height = height;
        this._store();
        return this;
    };
    this.setTitle = function (title) {
        this._title = title;
        this._store();
        return this;
    };
    this.setContent = function (content) {
        this._content = content;
        this._store();
        return this;
    };
    this.setForm = function (form) {
        this._form = form;
        this._store();
        return this;
    };
    this.show = function () {
        //verifica se ja foi criado o box, se não cria aqui
        var box = document.getElement('sliceBox');
        if (!box) {
            this._create();
        }
        //exibe com o efeito
        setTimeout('new sliceBox()._animate();', 500);
    };
    this.showImage = function () {
        //verifica se ja foi criado o box, se não cria aqui
        var box = document.getElement('sliceBox');
        if (!box) {
            this._createImage();
        }
        //exibe com o efeito
        setTimeout('new sliceBox()._animate();', 500);
    }
    this.close = function () {
        this._execOnClose();
        new sliceDarkness().close();
    };
    this.appendButton = function (title, type, action) {
        //verifica se o box ja foi criado, se nao cria aqui
        var box = document.getElement('sliceBox');
        if (!box) {
            this._create();
        }
        var d = document.getElement('actions');
        if (!d || !title || !type) {
            return this;
        }
        var btId = this._getTotalButton();
        btId++;
        this._setTotalButton(btId);
        var btClass = '';
        var btType = 'button';
        //define a class dos botoes
        switch (type) {
            case slice.list.box.button.Close:
                btClass = 'cancel red darken-1';
                break;
            case slice.list.box.button.Submit:
                btClass = 'submit';
                btType = 'submit';
                this._setSubmitAction(action);
                break;
            case slice.list.box.button.Button:
                this._setSubmitAction(action);
                break;
        }
        //var s = '<input name="' + title + '" id="bt_' + title + '" type="' + btType + '" class="button ' + btClass + '" value="' + title + '" />';
        // d.innerHTML += s;

        var button = document.createElement('button');
        button.setAttribute('id', 'bt_' + btId);
        button.setAttribute('name', 'bt_' + btId);
        button.setAttribute('class', 'button btn waves-effect waves-light ' + btClass);
        button.setAttribute('value', title);
        button.innerHTML = title;
        button.setAttribute('type', btType);
        d.appendChild(button);
                
        switch (type) {
            case slice.list.box.button.Close:
                button.onclick = function () {
                    this._execOnClose();
                    new sliceDarkness().close();
                }
                break;
            case slice.list.box.button.Submit:
                //anexar a submitaction
                var f = document.forms[this._getForm()];
                f._submitAction = this._getSubmitAction();
                f.onsubmit = function () {
                    this._submitAction();
                    return false;
                }
                break;
            case slice.list.box.button.Button:
                button._submitAction = this._getSubmitAction();
                button.onclick = function () {
                    this._submitAction();
                    return false;
                }
                break;
        }
        return this;
    };
    
    this.initBoxImage = function (id) {
        var body = document.getElement('body');
        var img = document.getElement(id);
        if (!img || !body) {
            return;
        }

        var mWidth = (body.clientWidth / 100) * 95;
        var mHeight = (body.clientHeight / 100) * 90;

        new sliceBox().setWidth(img.width).setHeight(img.height).setContent(img.src).showImage();
             
    } 
    //#endregion 
    //#region construtor
    this._load();

    //#endregion
} 

function sliceScript() {
    //#region propriedades públicas
    this.runAsync = function () {
        ///<summary>Roda os métodos declarados como assíncronos na tag head</summary>
        //so inicia se ja tiver carregado a pagina
        if (document.readyState == "complete") {
            if (!_sas) {
                return;
            }
            for (var n = 0; n != _sas.length; n++) {
                eval(_sas[n]);
            }

        } else {
            setTimeout('new sliceScript().runAsync();', 100);
        }
    };
    //#endregion
}
function sliceImageAsync() {
    ///<summary>Converte as imagens de forma assíncrona</summary>
    //#region propriedades privadas
    this._className = 'image_async';
    this._acceptedTags = new Array('a', 'div');
    this._getClassName = function () {
        return this._className;
    };
    this._getAcceptedTags = function () {
        return this._acceptedTags;
    };
    this._getElements = function () {
        var tags = new Array();
        for (var tag in this._getAcceptedTags()) {
            var elems = document.getElementsByTagName(this._getAcceptedTags()[tag]), i;
            for (i in elems) { 
                if (elems[i]) {
                    if ((' ' + elems[i].className + ' ').indexOf(' ' + this._getClassName() + ' ') > -1) {
                        tags.push(elems[i]);
                    }
                }
            }
        }
        return tags;
    };
    this._decodeClassNameToURL = function (className) {
        var str = '';
        for (var i = 0; i < className.length; i += 2) {
            str += String.fromCharCode(parseInt(className.substr(i, 2), 16));
        }
        return str;
    };
    this._replace = function (element) {
        if (!element) {
            return;
        }
        var a = element.className.split(' ');
        if (a.length != 2) {
            return;
        }
        element.style.backgroundImage = 'url("' + this._decodeClassNameToURL(a[1]) + '")';
        element.className = a[0];
    };
    this._update = function () {
        var a = this._getElements();
        var total = a.length;
        for (var n = 0; n != total; n++) {
            this._replace(a[n]);
        };
    };
    //#endregion
    //#region propriedades públicas
    this.setClassName = function (className) {
        ///<summary>Define o nome da classe que vai ser analisada</summary>
        ///<param name="className" type="String"></param>
        this._className = className;
        return this;
    };
    this.setAcceptedTags = function (acceptedTags) {
        ///<summary>Define as tags que serão analisadas</summary>
        ///<param name="acceptedTags" type="Array"></param>
        this._acceptedTags = acceptedTags;
        return this;
    };
    this.update = function () {
        this._update();
    };
    //#endregion
}

function sliceContentHide() {
    //#region propriedades privadas

    ///esconde o link se nao estiver logado 
    this._hideByLogin = true;

    ///usa o metodo para proteger a imagem e url ou exibe normal
    this._protect = true;

    //atualiza os links <a>
    this._updateLinks = function (obj) {
        if (obj.href.length <= 0) {
            return;
        }
        if (obj.href.indexOf('hide:') < 0) {
            return;
        }

        var url = obj.href.replace('hide:', '');
        obj.url = window.atob(url);
    };
    //atualiza as imagens
    this._updateImage = function (obj) {
        if (obj.src.length <= 0) {
            return;
        }
        if (obj.src.indexOf('hide:') < 0) {
            return;
        }

        var srcImage = obj.src.replace('hide:', '');
        srcImage = window.atob(srcImage);

        //crio um objeto para dar load na imagem
        var img = new Image();
        img.onload = function () {
            // quando completar o load atualiza a imagem
            obj.src = this.src;
        };
        img.src = srcImage;
    };

    //inicia a atualizaÃ§Ã£o
    this._updateImagesItens = function () {
        //carrega as imagens
        var imgs = document.getElementsByTagName("img");
        for (var n = 0; n != imgs.length; n++) {
            this._updateImage(imgs[n]);
        };
    };
    this._updateLinkItens = function () {
        //carrega os links
        var links = document.getElementsByTagName("a");
        for (var n = 0; n != links.length; n++) {
            this._updateLinks(links[n]);
        };

    };
    //#endregion
    //#region propriedades pÃºblicas

    //atualiza a imagem, recebendo o id para localizar o objeto
    this.updateImageById = function (id) {
        if (document.readyState == "complete") {
            var d = document.getElement(id);
            if (!d) {
                return;
            }
            this._updateImage(d);
        } else {
            setTimeout('new sliceContentHide().updateImageById("' + id + '");', 100);
        }
    }
    this.updateLinkById = function (id) {
        if (document.readyState == "complete") {
            var d = document.getElement(id);
            if (!d) {
                return;
            }
            this._updateLinks(d);
        } else {
            setTimeout('new sliceContentHide().updateLinkById("' + id + '");', 100);
        }
    }
    this.init = function (type) {
        //so inicia se ja tiver carregado a pagina
        if (document.readyState == "complete") {
            this._updateImagesItens();
            //this._updateLinkItens();
        } else {
            setTimeout('new sliceContentHide().init();', 100);
        }
    };
    this.convert = function (str) {
        if (str.length <= 0) {
            return str;
        }
        if (str.indexOf('hide:') < 0) {
            return str;
        }

        return window.atob(str.replace('hide:', ''));
    };

    this.isHideByLogin = function () {
        return this._hideByLogin;
    };
    this.isProtect = function () {
        return this._protect;
    };

    this._translateLink = function () {
        var d1 = document.getElement('download_mirror_b');
        var d2 = document.getElement('download_mirror_link');
        if (!d1 || !d2) {
            return;
        }

        ///converte o link convertido para o original
        d2.href = window.atob(d1.innerHTML);
        d2.innerHTML = 'Click here to start downloading';

    };

    this.translateLink = function () {
        var d1 = document.getElement('download_mirror_b');
        var d2 = document.getElement('download_mirror_link');
        if (!d1 || !d2) {
            setTimeout('new sliceContentHide().translateLink();', 100);
            return;
        }

        if (document.readyState == "complete") {
            this._translateLink();
            return;
        }

        setTimeout('new sliceContentHide().translateLink();', 100);
    };
    //#endregion
    //#region construtor


    //#endregion
}


function sliceField(id) {
    ///<summary>Classe para trabalhar com elementos html do tipo container (div, span, etc).</summary>
    ///<param name="id" type="string">A id do container</param>
    //#region propriedades privadas
    this._id = 'null';
    this._type = 'text';

    this._setId = function (id) {
        this._id = id;
        return this;
    };
    this._getId = function () {
        return this._id;
    };
    this._setType = function (i) {
        this._type = i;
        return this;
    };
    this._getType = function () {
        return this._type;
    };

    //#endregion
    //#region propriedades públicas
    this.exists = function () {
        ///<summary>A partir da id única, indica se o elmento existe.</summary>
        /// <returns type="Boolean"></returns>
        if (document.getElement(this._getId())) {
            return true;
        }
        return false;
    };
     
    this.write = function (content) {
        ///<summary>Escreve no interior do campo. Se não existir, não acontece nada</summary>
        ///<param name="content" type="string">A id do container</param>
        var d = document.getElement(this._getId());
        if (d) {
            d.value = content;
        }
        return this;
    };
    this.read = function () {
        ///<summary>Lê o que existe no container. Se não existir, retorna uma string de comprimento zero.</summary>
        /// <returns type="String"></returns>
        var d = document.getElement(this._getId());
        return d ? d.value : '';
    };
    this.length = function () {
        ///<summary>Retorna o tamanho do conteudo</summary>
        /// <returns type="Integer"></returns>
        var d = document.getElement(this._getId());
        return d ? d.value.length : 0;
    }
   
    this.isHided = function () {
        ///<summary>Retorna verdadeiro se o container existir e estiver invisível.</summary>
        /// <returns type="Boolean"></returns>
        var d = document.getElement(this._getId());
        if (!d) {
            return false;
        }
        return d.style.display == 'none';
    };
    this.hide = function () {
        ///<summary>Oculta o container através do estilo.</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return;
        }
        d.style.display = 'none';
        return this;
    };
    this.remove = function () {
        ///<summary>Remove o container do documento. Se ele não existir, não acontece nada.</summary>
        if (!this.exists()) {
            return;
        }
        var d = document.getElement(this._getId());
        d.parentNode.removeChild(d);
        return this;
    };
    this.show = function () {
        ///<summary>Se o container estiver oculto através do estilo, este método o torna visível.</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return this;
        }
        d.style.display = 'block';
        return this;
    };
    this.toggle = function () {
        ///<summary>Alterna entre visivel e oculto o container através do estilo</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return this;
        }
        if (d.style.display == 'none') {
            d.style.display = 'block';
        } else {
            d.style.display = 'none';
        }
        return this;
    };
    this.clear = function () {
        ///<summary>Deixa o contaier vazio. Se não existir, não acontece nada.</summary>
        this.write('');
    };
   
    this.className = function (className) {
        ///<summary>Modifica o className do div. Se não existir, não acontece nada</summary>
        ///<param name="content" type="string">A id do container</param>
        var d = document.getElement(this._getId());
        if (d) {
            d.className = className;
        }
        return this;
    };
    this.focus = function () {
        ///<summary>Da foco no div informado, util para correr a pagina para onde necessitar.</summary>
        var d = document.getElement(this._getId());
        if (!d) {
            return;
        }
        d.scrollIntoView()
        return this;
    }
    //#endregion
    //#region construtor
    if (id) {
        this._setId(id);
    }
    //#endregion
}

function slicePageControl() {
    //#region proprieades privadas
    this._pageWidth = null;
    this._pageHeight = null;
    this._pageScroll = null;
    this._windowWidth = null;
    this._windowHeight = null;

    this._setPageWidth = function (i) {
        this._pageWidth = i;
    };
    this.getPageWidth = function () {
        return this._pageWidth;
    };
    this._setPageHeight = function (i) {
        this._pageHeight = i;
    };
    this.getPageHeight = function () {
        return this._pageHeight;
    };
    this._setWindowWidth = function (i) {
        this._windowWidth = i;
    };
    this.getWindowWidth = function () {
        return this._windowWidth;
    };
    this._setWindowHeight = function (i) {
        this._windowHeight = i;
    };
    this.getWindowHeight = function () {
        return this._windowHeight;
    };
    this._setPageScroll = function (i) {
        this._pageScroll = i;
    };
    this.getPageScroll = function () {
        return this._pageScroll;
    };
    this._store = function () {
        window._slicePageControl = this;
    };
    this._load = function () {
        var o = window._slicePageControl;
        if (!o) {
            return;
        }
        this._setPageWidth(o.getPageWidth());
        this._setPageHeight(o.getPageHeight());
        this._setWindowWidth(o.getWindowWidth());
        this._setWindowHeight(o.getWindowHeight());
        this._setPageScroll(o.getPageScroll());
    };

    this._getPageSize = function () {
        var xScroll = null;
        var yScroll = null;
        var windowWidth = null;
        var windowHeight = null;
        var pageWidth = null;
        var pageHeight = null;

        if (window.innerHeight && window.scrollMaxY) {
            xScroll = document.body.scrollWidth;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) { // IE 6
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // navegadoes do MAC
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }

        if (self.innerHeight) {	// funciona em navegadores que nao sejam IE
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // somente para IE 6
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // outros IE's
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }

        // se a altura da pagina for menor que a janela do navegador
        if (yScroll < windowHeight) {
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }

        // se a largura da pagina for menos que a janela do navegador
        if (xScroll < windowWidth) {
            pageWidth = windowWidth;
        } else {
            pageWidth = xScroll;
        }

        //seta as variaveis 
        this._setPageHeight(pageHeight);
        this._setPageWidth(pageWidth);
        this._setWindowHeight(windowHeight);
        this._setWindowWidth(windowWidth);
    };

    this._getScroll = function () {
        var scroll;
        if (self.pageYOffset) {
            scroll = self.pageYOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {	 // IE 6 
            scroll = document.documentElement.scrollTop;
        } else if (document.body) {// outros navegadores
            scroll = document.body.scrollTop;
        }
        this._setPageScroll(scroll);
    };
    //#endregion
    //#region propriedades públicas
    this.init = function () {
        //so inicia se ja tiver carregado a pagina
        if (document.readyState == "complete") {
            this.adjust();
            if (window.addEventListener) {
                window.addEventListener("resize", function (event) { new slicePageControl().adjust(); }, false);
            } else if (document.attachEvent) {
                window.attachEvent("onresize", function (event) { new slicePageControl().adjust(); });
            } else {
                window.onresize = function (event) {
                    new slicePageControl().adjust();
                }
            }

        } else {
            setTimeout('new slicePageControl().init();', 100);
        }
    };

    this.adjust = function () {
        this._getScroll();  //define o scroll
        this._getPageSize();  //define o tamanho da pagina e do navegador  
        return this;
    };
    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
 

//#region lists
if (!slice) {
    var slice = new Object();
}
slice.list = {}
slice.list.user = {}
slice.list.user.storeMode = {
    Cookie: 'cookie',
    Storage: 'storage',
    Both: 'both'
}
slice.list.request = {
    method: {
        /// <summary>Os métodos de requisição.</summary>
        Get: 'get',
        Post: 'post'
    },
    fieldType: {
        /// <summary>Os tipos de campo ao passar uma variável por post.</summary>
        Hidden: 'hidden',
        File: 'file'
    }
}
slice.list.storage = {
    method: {
        /// <summary>Os modos de armazemanto local de dados.</summary>
        Session: 'session',
        Local: 'local',
        Both: 'both'
    },
    timeUnit: {
        /// <summary>As unidades de tempo de expiração do registro armazenado.</summary>
        Seconds: (1000),
        Minutes: (1000 * 60),
        Hours: (1000 * 60 * 60),
        Days: (1000 * 60 * 60 * 24),
        Weeks: (1000 * 60 * 60 * 24 * 7),
        Months: (1000 * 60 * 60 * 24 * 30),
        Years: (1000 * 60 * 60 * 24 * 30 * 12)
    }
}
slice.list.loader = {
    type: {
        /// <summary>O tipo de mensagem do loader.</summary>
        Info: 'info',
        Progress: 'progress'
    }
}
slice.list.cookie = {
    timeUnit: {
        /// <summary>As unidades de tempo de expiração do cookie.</summary>
        Seconds: (1000),
        Minutes: (1000 * 60),
        Hours: (1000 * 60 * 60),
        Days: (1000 * 60 * 60 * 24),
        Weeks: (1000 * 60 * 60 * 24 * 7),
        Months: (1000 * 60 * 60 * 24 * 30),
        Years: (1000 * 60 * 60 * 24 * 30 * 12)
    }
}
slice.list.code = {
    tag: {
        special: {
            Smiley: 'smiley',
            Code: 'code',
            User: 'user',
            Game: 'game',
            Table: 'table',
            Email: 'email',
            Img: 'img',
            Url: 'url',
            Iurl: 'iurl',
            List: 'list',
            Youtube: 'youtube',
            Vimeo: 'vimeo',
            Center: 'center',
            Flash: 'flash',
            Color: 'color',
            T2: 't2',
            T1: 't1',
            Spoiler: 'spoiler',
            Quote: 'quote',
            Hr: 'hr',
            Left: 'left', 
            Right: 'right',
            Tag: 'tag',
            Video: 'video',
            Slide: 'slide',
            Facebook: 'facebook',
            Twitter: 'twitter',
            Instagram: 'instagram',
            Aviso: 'aviso',
            Alerta: 'alerta',
            Page: 'page',
            VideoFonte: 'video_fonte',
            ImageFonte: 'image_fonte',
            Highlight: 'highlight'

        },
        basic: {
            B: 'b',
            I: 'i',
            S: 's',
            U: 'u'
        }
    }
}
slice.list.scroll = {
    direction: {
        Horizontal: 'horizontal',
        Vertical: 'vertical'
    }
}
slice.list.flash = {
    windowMode: {
        Window: 'window',
        Direct: 'direct',
        Opaque: 'opaque',
        Transparent: 'transparent',
        Gpu: 'gpu'
    }
}
slice.list.image = {
    orientation: {
        Horizontal: 'horizontal',
        Vertical: 'vertical',
        Square: 'square'
    }
}
slice.list.time = {
    format: {
        /// <summary>Os formatos de exibição da data amigável.</summary>
        Full: 'Full',
        OnlyTime: 'OnlyTime',
        OnlyText: 'OnlyText'
    }
}
slice.list.string = {
    format: {
        IntegerFriendly: 'integerFriendly',
        MegahertzFriendly: 'megahertzFriendly',
        BytesFriendly: 'bytesFriendly',
        TimeFriendly: 'timefriendly'
    }
}
//#endregion


//#endregion

 
/////******

//#region list
//1=>disponível,2=>ocupado,3=>ausente,4=>invisível
slice.list.messenger = {
    status: {
        Available: 1,
        Busy: 2,
        Absent: 3,
        Invisible: 4
    },
    invite: {
        Accept: 'accept',
        Reject: 'reject'
    },
    type: {
        Send: 'send',
        Receive: 'receive',
        Trash: 'trash',
    }
}
slice.list.like = {
    type: {
        Liked: 'liked',
        NotLiked: 'notliked',
        Alert: 'alert',
        Whatever: 'whatever'
    }
}
slice.list.area = {
    video: {
        User: 1,
        Community: 2
    },
    photo: {
        User: 1,
        Community: 2
    },
    view: {
        Photo: 'photo',
        Video: 'video'
    },
    page: {
        Profile: 'profile',
        Community: 'community'
    },
    game: {
        Steam: 'steam',
        PSN: 'psn',
        Live: 'live'
    }
}
slice.list.pm = {
    markas: {
        unreaded: 'unreaded',
        readed: 'readed'
    }
}
slice.list.box = {
    button: {
        /// <summary>Status das interações</summary>
        Close: 'close',
        Submit: 'submit',
        Button: 'button'
    },
    action: {
        Close: 'close'
    }
}
slice.list.interation = {
    status: {
        /// <summary>Status das interações</summary>
        Sending: 'sending',
        None: 'none'
    }
}
slice.list.item = {
    age: {
        /// <summary>Se o item é novo ou antigo.</summary>
        New: 'new',
        Old: 'old'
    }
}

//#endregion

//#endregion

//#region other

//new sliceRequest().setUrlMain('https://www.gamevicio.com/api/request/index.php?');
new sliceRequest().setUrlMain(window.location.protocol + '//' + window.location.host + '/api/request/index.php?');


/***
carrega metodos ao completar o load da pagina
*** */
function initSlice() {

    document.getElement = function(elemId){
       var elem = document.getElementById(elemId);
        if (!elem){
            elem = document.getElementsByClassName(elemId)[0];
            if (!elem){
                return null;
            }  
        } 
        return elem; 
    }
     
    //so inicia se ja tiver carregado a pagina
    if (document.readyState == "complete") {
        new sliceImageAsync().update();
        new sliceTime().update();
        new slicePageControl().init();
        new sliceScript().runAsync();
    } else {
        setTimeout('initSlice();', 100);
    }
}
initSlice(); 


 
//#endregion




(function(window, document) {
    'use strict';
    /**
     * @constructor
     */
    var Sharer = function(elem) {
        this.elem = elem;
    };

    /**
     *  @function init
     *  @description bind the events for multiple sharer elements
     *  @returns {Empty}
     */
    Sharer.init = function() {
        var elems = document.querySelectorAll('[data-sharer]'),
            i,
            l = elems.length;

        for (i = 0; i < l; i++) {
            elems[i].addEventListener('click', Sharer.add);
        }
    };

    /**
     *  @function add
     *  @description bind the share event for a single dom element
     *  @returns {Empty}
     */
    Sharer.add = function(elem) {
        var target = elem.currentTarget || elem.srcElement;
        var sharer = new Sharer(target);
        sharer.share();
    };

    // instance methods
    Sharer.prototype = {
        constructor: Sharer,
        /**
         *  @function getValue
         *  @description Helper to get the attribute of a DOM element
         *  @param {String} attr DOM element attribute
         *  @returns {String|Empty} returns the attr value or empty string
         */
        getValue: function(attr) {
            var val = this.elem.getAttribute('data-' + attr);
            // handing facebook hashtag attribute
            if (val && attr === 'hashtag') {
                if (!val.startsWith('#')) {
                    val = '#' + val;
                }
            }
            return val;
        },

        /**
         * @event share
         * @description Main share event. Will pop a window or redirect to a link
         * based on the data-sharer attribute.
         */
        share: function() {
            var sharer = this.getValue('sharer').toLowerCase(),
                sharers = {
                    facebook: {
                        shareUrl: 'https://www.facebook.com/sharer/sharer.php',
                        params: {
                            u: this.getValue('url'),
                            hashtag: this.getValue('hashtag')
                        }
                    },
                    linkedin: {
                        shareUrl: 'https://www.linkedin.com/shareArticle',
                        params: {
                            url: this.getValue('url'),
                            mini: true
                        }
                    },
                    twitter: {
                        shareUrl: 'https://twitter.com/intent/tweet/',
                        params: {
                            text: this.getValue('title'),
                            url: this.getValue('url'),
                            hashtags: this.getValue('hashtags'),
                            via: this.getValue('via')
                        }
                    },
                    email: {
                        shareUrl: 'mailto:' + this.getValue('to') || '',
                        params: {
                            subject: this.getValue('subject'),
                            body: this.getValue('title') + '\n' + this.getValue('url')
                        },
                        isLink: true
                    },
                    whatsapp: {
                        shareUrl: this.getValue('web') !== null ? 'https://api.whatsapp.com/send' : 'whatsapp://send',
                        params: {
                            text: this.getValue('title') + ' ' + this.getValue('url')
                        }, 
                        isLink: (this.getValue('web') !== null ? false : true)
                    },
                    telegram: {
                        shareUrl: 'tg://msg_url',
                        params: {
                            text: this.getValue('title'),
                            url: this.getValue('url'),
                            to: this.getValue('to')
                        },
                        isLink: true
                    },
                    viber: {
                        shareUrl: 'viber://forward',
                        params: {
                            text: this.getValue('title') + ' ' + this.getValue('url')
                        },
                        isLink: true
                    },
                    line: {
                        shareUrl:
                            'http://line.me/R/msg/text/?' +
                            encodeURIComponent(this.getValue('title') + ' ' + this.getValue('url')),
                        isLink: true
                    },
                    pinterest: {
                        shareUrl: 'https://www.pinterest.com/pin/create/button/',
                        params: {
                            url: this.getValue('url'),
                            media: this.getValue('image'),
                            description: this.getValue('description')
                        }
                    },
                    tumblr: {
                        shareUrl: 'http://tumblr.com/widgets/share/tool',
                        params: {
                            canonicalUrl: this.getValue('url'),
                            content: this.getValue('url'),
                            posttype: 'link',
                            title: this.getValue('title'),
                            caption: this.getValue('caption'),
                            tags: this.getValue('tags')
                        }
                    },
                    hackernews: {
                        shareUrl: 'https://news.ycombinator.com/submitlink',
                        params: {
                            u: this.getValue('url'),
                            t: this.getValue('title')
                        }
                    },
                    reddit: {
                        shareUrl: 'https://www.reddit.com/submit',
                        params: { url: this.getValue('url') }
                    },
                    vk: {
                        shareUrl: 'http://vk.com/share.php',
                        params: {
                            url: this.getValue('url'),
                            title: this.getValue('title'),
                            description: this.getValue('caption'),
                            image: this.getValue('image')
                        }
                    },
                    xing: {
                        shareUrl: 'https://www.xing.com/app/user',
                        params: {
                            op: 'share',
                            url: this.getValue('url'),
                            title: this.getValue('title')
                        }
                    },
                    buffer: {
                        shareUrl: 'https://buffer.com/add',
                        params: {
                            url: this.getValue('url'),
                            title: this.getValue('title'),
                            via: this.getValue('via'),
                            picture: this.getValue('picture')
                        }
                    },
                    instapaper: {
                        shareUrl: 'http://www.instapaper.com/edit',
                        params: {
                            url: this.getValue('url'),
                            title: this.getValue('title'),
                            description: this.getValue('description')
                        }
                    },
                    pocket: {
                        shareUrl: 'https://getpocket.com/save',
                        params: {
                            url: this.getValue('url')
                        }
                    },
                    digg: {
                        shareUrl: 'http://www.digg.com/submit',
                        params: {
                            url: this.getValue('url')
                        }
                    },
                    stumbleupon: {
                        shareUrl: 'http://www.stumbleupon.com/submit',
                        params: {
                            url: this.getValue('url'),
                            title: this.getValue('title')
                        }
                    },
                    flipboard: {
                        shareUrl: 'https://share.flipboard.com/bookmarklet/popout',
                        params: {
                            v: 2,
                            title: this.getValue('title'),
                            url: this.getValue('url'),
                            t: Date.now()
                        }
                    },
                    weibo: {
                        shareUrl: 'http://service.weibo.com/share/share.php',
                        params: {
                            url: this.getValue('url'),
                            title: this.getValue('title'),
                            pic: this.getValue('image'),
                            appkey: this.getValue('appkey'),
                            ralateUid: this.getValue('ralateuid'),
                            language: 'zh_cn'
                        }
                    },
                    renren: {
                        shareUrl: 'http://share.renren.com/share/buttonshare',
                        params: {
                            link: this.getValue('url')
                        }
                    },
                    myspace: {
                        shareUrl: 'https://myspace.com/post',
                        params: {
                            u: this.getValue('url'),
                            t: this.getValue('title'),
                            c: this.getValue('description')
                        }
                    },
                    blogger: {
                        shareUrl: 'https://www.blogger.com/blog-this.g',
                        params: {
                            u: this.getValue('url'),
                            n: this.getValue('title'),
                            t: this.getValue('description')
                        }
                    },
                    baidu: {
                        shareUrl: 'http://cang.baidu.com/do/add',
                        params: {
                            it: this.getValue('title'),
                            iu: this.getValue('url')
                        }
                    },
                    douban: {
                        shareUrl: 'https://www.douban.com/share/service',
                        params: {
                            name: this.getValue('title'),
                            href: this.getValue('url'),
                            image: this.getValue('image')
                        }
                    },
                    okru: {
                        shareUrl: 'https://connect.ok.ru/dk',
                        params: {
                            'st.cmd': 'WidgetSharePreview',
                            'st.shareUrl': this.getValue('url'),
                            title: this.getValue('title')
                        }
                    },
                    mailru: {
                        shareUrl: 'http://connect.mail.ru/share',
                        params: {
                            share_url: this.getValue('url'),
                            linkname: this.getValue('title'),
                            linknote: this.getValue('description'),
                            type: 'page'
                        }
                    },
                    evernote: {
                        shareUrl: 'http://www.evernote.com/clip.action',
                        params: {
                            url: this.getValue('url'),
                            title: this.getValue('title')
                        }
                    },
                    skype: {
                        shareUrl: 'https://web.skype.com/share',
                        params: {
                            url: this.getValue('url'),
                            title: this.getValue('title')
                        }
                    }
                },
                s = sharers[sharer];

            // custom popups sizes
            if (s) {
                s.width = this.getValue('width');
                s.height = this.getValue('height');
            }
            return s !== undefined ? this.urlSharer(s) : false;
        },
        /**
         * @event urlSharer
         * @param {Object} sharer
         */
        urlSharer: function(sharer) {
            var p = sharer.params || {},
                keys = Object.keys(p),
                i,
                str = keys.length > 0 ? '?' : '';
            for (i = 0; i < keys.length; i++) {
                if (str !== '?') {
                    str += '&';
                }
                if (p[keys[i]]) {
                    str += keys[i] + '=' + encodeURIComponent(p[keys[i]]);
                }
            }
            sharer.shareUrl += str;

            if (!sharer.isLink) {
                var popWidth = sharer.width || 600,
                    popHeight = sharer.height || 480,
                    left = window.innerWidth / 2 - popWidth / 2 + window.screenX,
                    top = window.innerHeight / 2 - popHeight / 2 + window.screenY,
                    popParams =
                        'scrollbars=no, width=' +
                        popWidth +
                        ', height=' +
                        popHeight +
                        ', top=' +
                        top +
                        ', left=' +
                        left,
                    newWindow = window.open(sharer.shareUrl, '', popParams);

                if (window.focus) {
                    newWindow.focus();
                }
            } else {
                window.location.href = sharer.shareUrl;
            }
        }
    };

    // adding sharer events on domcontentload
    if (document.readyState === 'complete' || document.readyState !== 'loading') {
        Sharer.init();
    } else {
        document.addEventListener('DOMContentLoaded', Sharer.init);
    }

    // turbolinks compatibility
    window.addEventListener('page:load', Sharer.init);

    // exporting sharer for external usage
    window.Sharer = Sharer;
})(window, document);


//#region sliceBasics
function sliceBasics() {
    //#region proprieades privadas
    this._id = null;
    this._urlVars = null;

    this._lang = 'br';
    this.setLang = function (i) {
        this._lang = i;
        this._store();
        return this;
    };
    this.getLang = function () {
        return this._lang;
    };

    this._store = function () {
        window._sliceBasics = this;
    };
    this._load = function () {
        var o = window._sliceBasics;
        if (!o) {
            return;
        } 
        this.setId(o.getId());
        this.setLang(o.getLang());
    };


    //#endregion
    //#region propriedades públicas

    this._setUrlVars = function (i) {
        this._urlVars = i;
        //this._store();
        return this;
    };
    this._getUrlVars = function () {
        return this._urlVars;
    };


    this.setId = function (i) {
        this._id = i;
        //this._store();
        return this;
    };
    this.getId = function () {
        return this._id;
    };


    this.getUrlVar = function (i) {

        var str = new URL(window.location.href).searchParams.get(i);
        if (str == null) {
            return '';
        }
        if (str.length > 0) {
            return str;
        }
        return '';
    };


    this.getDateAddMinutes = function (minutes) {
        var d = new Date();
        return new Date(d.setTime(d.getTime() + (minutes * 60 * 1000)));
    };
    this.getDateAddHours = function (hours) {
        var d = new Date();
        return new Date(d.setTime(d.getTime() + (hours * 60 * 60 * 1000)));
    };

    this.alertError = function(msg){
        //setTimeout('new sliceLoader().show("'+ msg +'", slice.list.loader.type.Info, 5);',300);
        new sliceToasts().setText(msg).setStyle('red').setTimeOut(30).show();
    }; 

    this.ActionConfirm = function(pagina,mensagem){

        var confirma = confirm(mensagem)
	    if (confirma){ 
		    window.document.location = pagina;
	    }else{ 
		    return false 
	    } 
    };

    this.toggleView = function(id){
	    f = document.getElementById(id);      
        if (!f) {
           return false;
        }
    
        if(f.style.display == 'none'){
    	    f.style.display = 'block';
        }else{
    	    f.style.display = 'none';
        } 
    };
     
    this.removeDivByPageWidth = function(div,minWidth){
    	var d = document.getElement(div);
        if (d) { 
        	if (window.innerWidth <= minWidth){
        		d.remove();
        	}          	
        }    	
    }



    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
//#endregion

//#region sliceProtectMedia
function sliceProtectMedia() {
    //#region proprieades privadas

    this._status = slice.list.interation.status.None; //define se esta sendo enviado
    this._protect = false;
    //#region sets
    this._setStatus = function (status) {
        this._status = status;
        this._store();
        return this;
    };
    this._getStatus = function () {
        return this._status;
    };

    this.setProtect = function (status) {
        this._protect = status;
        this._store();
        return this;
    };
    this.isProtect = function () {
        return this._protect;
    };

    this._store = function () {
        window._sliceProtectMedia = this;
    };
    this._load = function () {
        var o = window._sliceProtectMedia;
        if (!o) {
            return;
        }
        this._getStatus(o._getStatus());
        this.setProtect(o.isProtect());
    };

    //#endregion

    this._now = function () {
        return Math.ceil(new Date().getTime() / 1000);
    }

    this.parseURL = function (href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };

    this._rand = function () {
        return Math.floor(Math.random() * 1000);
    }

    this._updateURLs = function () {

        var aURLs = document.getElementsByClassName('url-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var isLogged = false;
        if (this.isProtect()) {
            var user = new sliceUser();
            isLogged = user.isLogged();
        } else {
            isLogged = true;
        }

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';

                    if (!isLogged) {
                        sURL = '<span style="color:red;">&laquo; Você deve estar logado para ver este link &raquo;</span>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "";
                }
            }
        }
    }

    this._updateIURLs = function () {

        var aURLs = document.getElementsByClassName('urli-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var isLogged = false;
        if (this.isProtect()) {
            var user = new sliceUser();
            isLogged = user.isLogged();
        } else {
            isLogged = true;
        }

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var iURL = null;

        //for (var n = 0; n != total; n++) {
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {
                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);

                    iURL = nURL.split('--;;--');

                    sURL = '<a href="' + iURL[1] + '" target="_blank" title="' + iURL[0] + '">' + iURL[0] + '</a>';

                    if (!isLogged) {
                        sURL = '<span style="color:red;">&laquo; Você deve estar logado para ver este link &raquo;</span>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "";
                }
            }
        }
    }

    this._updateImages = function () {

        var aURLs = document.getElementsByClassName('image-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var isLogged = false;
        if (this.isProtect()) {
            var user = new sliceUser();
            isLogged = user.isLogged();
        } else {
            isLogged = true;
        }


        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var id = '';

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    //sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';
                    id = this._rand() + '_' + this._rand();

                    sURL = '';
                    sURL += '<div class="article-media">';
                    sURL += '<a href="javascript:void(0)" title="Clique para ver a imagem em tamanho original">';
                    sURL += '<img id="view_image_bx_' + id + '" onclick="new sliceBox().initBoxImage(\'view_image_bx_' + id + '\');" ';
                    sURL += 'src="' + nURL + '"  alt="Clique para ver a imagem em tamanho original" class="media-shadow"></a>';
                    sURL += '</div>';

                    if (!isLogged) {
                       /// sURL = '<div><span style="color:red;">&laquo; Você deve estar logado para ver a imagem &raquo;</span></div>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "";
                }
            }
        }
    }

    this._updateImagesURL = function (){

        var aURLs = document.getElementsByClassName('image-url-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var isLogged = false;
        if (this.isProtect()) {
            var user = new sliceUser();
            isLogged = user.isLogged();
        } else {
            isLogged = true;
        }

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var iURL = null;
        var id = ''; 

        //for (var n = 0; n != total; n++) {
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {
                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);

                    iURL = nURL.split('--;;--');
                    id = this._rand() + '_' + this._rand();

                    sURL = '';
                    sURL += '<div class="article-media">';
                    sURL += '<a href="' + iURL[0] + '" target="_blank" title="imagem"><img class="media-shadow" id="view_image_bx_' + id + '" src="' + iURL[1] + '" alt="imagem" /></a>';
                    sURL += '</div>';

                    if (!isLogged) {
                       // sURL = '<span style="color:red;">&laquo; Você deve estar logado para ver esta imagem &raquo;</span>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "";
                }
            }
        }
    }

    this._updateYoutube = function () {

        var aURLs = document.getElementsByClassName('youtube-protect-sbbcode');
        if (aURLs.length <= 0) {
           return;
        } 
        ///console.log('inicia atualização dos vídeos'); 

        var total = aURLs.length;

        var user = new sliceUser();
        var isLogged = user.isLogged();

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var id = '';
        var elem = null;
        var sVideo = ''; 

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    //sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';
                    id = this._rand() + '_' + this._rand();

                    sURL = '';
                    sURL += '<div class="code_youtube video-container">';
                    sURL += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + nURL + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                    sURL += '</div>';
                     
                    if (!isLogged) {
                        //sURL = '<div><span style="color:red;">&laquo; Você deve estar logado para ver este vídeo &raquo;</span></div>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "";
                    //console.log('iniciou o Vídeo vd_div_'+id); 
                     
                }
            }
        }
    }

    this._updateVideos = function () {

        var aURLs = document.getElementsByClassName('video-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var user = new sliceUser();
        var isLogged = user.isLogged();

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var id = '';
        var aU = null;

        var useReddid = false;

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    //sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';
                    id = this._rand() + '_' + this._rand();

                    aU = nURL.split('/');

                    //console.log(nURL);

                    if (pURL.hostname == 'vimeo.com') {
                        console.log('video do vimeo');
                        nURL = 'https://vimeo.com/' + aU[3];
                    }
                    if (pURL.hostname == 'www.twitch.tv') {
                        console.log('video do twitch');
                    }
                    if (pURL.hostname == 'gfycat.com') {
                        console.log('video do gfycat');
                        nURL = 'https://gfycat.com/ifr/' + aU[3];
                    }

                     
                    sURL = '';    //  width="' + aURLs[n].offsetWidth + '"  height="' + ((aURLs[n].offsetWidth / 100) * 75) + '"
                    sURL += '<div class="code_youtube video-container">';

                    ///iframe basico
                    sURL += '<iframe frameborder="0" height="378" width="620" src="' + nURL + '" webkitallowfullscreen mozallowfullscreen allowfullscreen scrolling="no"></iframe>';

                    sURL += '</div>';

                    if (!isLogged) {
                        //sURL = '<div><span style="color:red;">&laquo; Você deve estar logado para ver este vídeo &raquo;</span></div>';
                    }


                    if (sURL.length > 5) {
                        aURLs[n].innerHTML = sURL;
                    }
                    aURLs[n].className = "";
                }
            }
        }


    }

    this._updateTwitter = function () {

        var aURLs = document.getElementsByClassName('twitter-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var user = new sliceUser();
        var isLogged = user.isLogged();

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var id = '';

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    //sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';
                    id = this._rand() + '_' + this._rand();

                    pURL = nURL.split('/');
                    ///https://twitter.com/okardec/status/1073468444664872960

                    sURL = '';
                    //sURL += '<div class="code_youtube video-container">';
                    sURL += '<blockquote class="twitter-tweet" data-lang="pt">';
                    sURL += '<p lang="pt" dir="ltr">Loading tweet...</p>';
                    sURL += '&mdash; @none <a href="https://twitter.com/' + pURL[3] + '/' + pURL[4] + '/' + pURL[5] + '/">Unknown date</a></blockquote>';
                    //sURL += '</div>';
                    //sURL += '<script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';

                    if (!isLogged) {
                        //sURL = '<div><span style="color:red;">&laquo; Você deve estar logado para ver este tweet &raquo;</span></div>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "twitter-view";
                }
            }
        }


        //if (isLogged) {
        var bDiv = document.getElement('footer_scripts_content');
        if (bDiv) {
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
            bDiv.appendChild(script);
        }
        // }                

    }

    this._updateInstagram = function () {

        var aURLs = document.getElementsByClassName('instagram-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var user = new sliceUser();
        var isLogged = user.isLogged();

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var id = '';

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    //sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';
                    id = this._rand() + '_' + this._rand();

                    sURL = '';
                    //sURL += '<div class="code_youtube video-container">';

                    pURL = nURL.split('/');

                    sURL += '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/' + pURL[4] + '/?utm_source=ig_embed&amp;utm_medium=loading" ';
                    sURL += 'data-instgrm-version="12" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); ';
                    sURL += 'margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">';
                    sURL += '<div style="padding:16px;"><a href="' + nURL + '/?utm_source=ig_embed&amp;utm_medium=loading" ';
                    sURL += 'style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> ';
                    sURL += '<svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"></svg>';
                    sURL += '</div></div></a></div></blockquote>';

                    ///https://www.instagram.com/p/Bs6HXS9hlYb/?utm_source=ig_web_copy_link

                    ///sURL += '<script async src="https://www.instagram.com/embed.js"></script>
                    //sURL += '</div>';

                    if (!isLogged) {
                        //sURL = '<div><span style="color:red;">&laquo; Você deve estar logado para ver este post &raquo;</span></div>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "twitter-view";


                }
            }
        }


        //if (isLogged) {
        var bDiv = document.getElement('footer_scripts_content');
        if (bDiv) {
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', 'https://www.instagram.com/embed.js');
            bDiv.appendChild(script);
        }
        //}

    }

    this._updateFacebook = function () {

        var aURLs = document.getElementsByClassName('facebook-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var user = new sliceUser();
        var isLogged = user.isLogged();

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var id = '';

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    //sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';
                    id = this._rand() + '_' + this._rand();

                    pURL = nURL.split('/');
                    ///https://www.facebook.com/intervencionistasdoriodejaneiro/videos/2204938156437343/

                    sURL = '';

                    sURL += '<div class="fb-post" data-href="' + nURL + '" data-width="' + aURLs[n].offsetWidth + '" data-show-text="true">';
                    sURL += '<blockquote cite="' + nURL + '" ';
                    sURL += 'class="fb-xfbml-parse-ignore">Publicado por <a href="https://www.facebook.com/facebook/">Facebook</a> ';
                    sURL += 'em&nbsp;<a href="' + nURL + '">Unknown date</a></blockquote></div>';


                    if (!isLogged) {
                        //sURL = '<div><span style="color:red;">&laquo; Você deve estar logado para ver este post &raquo;</span></div>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "facebook-view";
                }
            }
        }


        //if (isLogged) {
        var bDiv = document.getElement('footer_scripts_content');
        if (bDiv) {
            var d = document.createElement('div');
            d.setAttribute('id', 'fb-root');
            bDiv.appendChild(d);

            var sp = '';
            sp += '(function (d, s, id) {';
            sp += 'var js, fjs = d.getElementsByTagName(s)[0];';
            sp += 'if (d.getElementById(id)) return;';
            sp += 'js = d.createElement(s); js.id = id;';
            sp += 'js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6";';
            sp += 'fjs.parentNode.insertBefore(js, fjs);';
            sp += "} (document, 'script', 'facebook-jssdk')); ";

            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.innerHTML = sp;
            bDiv.appendChild(script);
        }
        //}

    }

    this._updateReddit = function () {

        var aURLs = document.getElementsByClassName('reddit-protect-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var user = new sliceUser();
        var isLogged = user.isLogged();

        var iU = null;
        var nURL = '';
        var pURL = null;
        var sURL = '';
        var id = '';

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {  

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    nURL = atob(iU[0].innerText);
                    pURL = this.parseURL(nURL);

                    //sURL = '<a href="' + nURL + '" target="_blank" title="' + pURL.hostname + '">' + nURL + '</a>';
                    id = this._rand() + '_' + this._rand();

                    sURL = '';
                    //sURL += '<div class="code_youtube video-container">';

                    pURL = nURL.split('/');

                    sURL += '<blockquote class="reddit-card"><a href="' + nURL + '"> ';
                    sURL += 'Undead redemption confirmed?';
                    sURL += '</a> from <a href="http://www.reddit.com/r/' + pURL[4] + '">r/' + pURL[4] + '</a>';
                    sURL += '</blockquote>';
                    
                    //<script async src="https://embed.redditmedia.com/widgets/platform.js" charset="UTF-8"></script>

                    ///https://www.reddit.com/r/reddeadredemption/comments/fe9ibx/undead_redemption_confirmed/

                   
                    if (!isLogged) {
                        //sURL = '<div><span style="color:red;">&laquo; Você deve estar logado para ver este post &raquo;</span></div>';
                    }

                    aURLs[n].innerHTML = sURL;
                    aURLs[n].className = "reddit-view";


                }
            }
        }
          

        //if (isLogged) {
        var bDiv = document.getElement('footer_scripts_content');
        if (bDiv) {
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('charset', 'UTF-8');
            script.setAttribute('src', 'https://embed.redditmedia.com/widgets/platform.js');
            bDiv.appendChild(script);
        }
        //}

    }

 

    this._updateSlide = function () {

        var aURLs = document.getElementsByClassName('slide-sbbcode');
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;

        var user = new sliceUser();
        var isLogged = user.isLogged();

        var iU = null;
        var imgs = '';
        var aImgs = null;
        var sI = '';
        var nTotal = 0;
        var idIMG = '';

        //for (var n = 0; n != total; n++) { 
        for (var n = total; n >= 0; n--) {
            if (aURLs[n] != undefined) {

                iU = aURLs[n].getElementsByTagName('span');
                if (iU.length >= 1) {

                    ///imgs = atob(iU[0].innerText);
                    imgs = iU[0].innerText;

                    id = this._rand() + '_' + this._rand();

                    aImgs = imgs.split(';;;');

                    nTotal = 0;

                    sI = '';
                    sI += '<div class="slider-container slide-sbbcode-' + id + '">';
                    sI += '<div class="slider">';
                    //**********************
                    for (var n1 = 0; n1 != aImgs.length; n1++) {
                        if (aImgs[n1].length >= 10) {
                            ///************************
                            nTotal = nTotal + 1;
                            idIMG = 'slide-sbbcode-' + id + '-item-' + nTotal;

                            //sI += '<div>' + aImgs[n1] + '</div>'; 
                            sI += '<div class="slider__item">';
                            sI += '<a href="javascript:void(0);" onclick="new sliceBox().initBoxImage(' + "'" + idIMG + "'" + ');"><img id="' + idIMG + '" src="' + aImgs[n1] + '"></a>';
                            sI += '</div>';                                                       

                            ///************************
                        }
                    }
                    sI += '</div>'; ///slider
                    //**********************
                    sI += '<div class="arrows">';
                        sI += '<span class="arrows__item arrows__item_prew">&#10096;</span>';
                        sI += '<span class="arrows__item arrows__item_next">&#10097;</span>';
                    sI += '</div>';
                    //**********************
                    sI += '</div>';

                    setTimeout('slider({name: ".slide-sbbcode-' + id + '",dots: true,numberSlid: true,line: true});');
                     
                    aURLs[n].innerHTML = sI;
                    aURLs[n].className = "";


                    /*var d = document.getElement('slide-sbbcode-bt-a-' + id);
                    if (d) {
                        d.dId = id;
                        d.onclick = function () {
                            $('.carousel.carousel-slider.slide-sbbcode-' + this.dId).carousel('prev');
                        }
                    }
                    var d = document.getElement('slide-sbbcode-bt-p-' + id);
                    if (d) {
                        d.dId = id;
                        d.onclick = function () {
                            $('.carousel.carousel-slider.slide-sbbcode-' + this.dId).carousel('next');
                        }
                    }*/


                }
            }
        }


    }

    this._adjustSlideSize = function (id) {
        /*var d1 = document.getElement('slide-sbbcode-' + id);
        var d2 = document.getElement('slide-sbbcode-' + id + '-item-1');
        if (d1 && d2) {
            if (d1.style.height != d2.height + 'px') {
                d1.style.height = d2.height + 'px';
            }

            //setTimeout('new sliceProtectMedia()._adjustSlideSize("' + id + '");', 500);
        }*/

    }

     

    this._updateSecurityImage = function(){

        var objs = document.getElementsByClassName('sbbcode-sec-img');
        if (objs.length <= 0) {
            return;
        }
         var total = objs.length;
                 
        for (var n = total; n >= 0; n--) {
            if (objs[n] != undefined) {
                             
                if (objs[n].getAttribute('sbbcode-sec-img')!=''){
                    objs[n].src = atob(objs[n].getAttribute('sbbcode-sec-img'));
                    //objs[n].className = '';
                    objs[n].setAttribute('sbbcode-sec-img','');
                    ///objs[n].setAttribute('class','');
                }                   
            }
         } 
    }
    
    this._updateSecurityURL = function(){

        var objs = document.getElementsByClassName('sbbcode-sec-url');
        if (objs.length <= 0) {
            return;
        }
        var total = objs.length;
                 
        for (var n = total; n >= 0; n--) {
            if (objs[n] != undefined) {
                             
                if (objs[n].getAttribute('sbbcode-sec-url')!=''){
                    objs[n].href = atob(objs[n].getAttribute('sbbcode-sec-url'));
                    //objs[n].className = '';
                    objs[n].setAttribute('sbbcode-sec-url','');
                    ///objs[n].setAttribute('class','');
                } 
            } 
         } 
    }
    
    this._updateSecurityTEXT = function(){
 
        var objs = document.getElementsByClassName('sbbcode-sec-text');
        if (objs.length <= 0) {
            return;
        }
        var total = objs.length;
                 
        for (var n = total; n >= 0; n--) {
            if (objs[n] != undefined) {
                             
                if (objs[n].getAttribute('sbbcode-sec-text')!=''){
                    objs[n].innerHTML = atob(objs[n].getAttribute('sbbcode-sec-text'));                    
                    //objs[n].className = '';
                    objs[n].setAttribute('sbbcode-sec-text','');
                    ///objs[n].setAttribute('class','');
                }
            }
         } 
    }

    this._updatePagination = function (){

        var pgDivs = document.getElementsByClassName('news_pagination_div');
        var pgBts = document.getElementsByClassName('news_pagination_bts');
        var pgBtA = document.getElementsByClassName('news_pagination_bts_a'); 
        if (pgDivs.length <= 0 || pgBts.length <= 0 || pgBtA.length <= 0) {
            return;
        }

        var total = pgBtA.length;

        for (var n = total; n >= 0; n--) {
            if (pgBtA[n] != undefined) {

                ////**************

                pgBtA[n].onclick = function () {
                    new sliceProtectMedia().viewNewsPage(this.innerHTML); 
                }
                ////**************
            }
        }


       var bt = document.getElement('news_pagination_bt_next');
       if (bt){
           bt.onclick = function () {
              new sliceProtectMedia().newsPageSet('next'); 
           };
       }
       var bt = document.getElement('news_pagination_bt_prior');
       if (bt){
           bt.onclick = function () {
              new sliceProtectMedia().newsPageSet('prior'); 
           };
       }

    }
    this.cleanNewsPage = function (){
        var pgDivs = document.getElementsByClassName('news_pagination_div');
        var pgBts = document.getElementsByClassName('news_pagination_bts');
        var pgBtA = document.getElementsByClassName('news_pagination_bts_a'); 
        if (pgDivs.length <= 0 || pgBts.length <= 0 || pgBtA.length <= 0) {
            return;
        }

        var total = pgBts.length;
        //varre os botoes e limpa a marcação 
        for (var n = total; n >= 0; n--) {
           if (pgBts[n] != undefined) {
                pgBts[n].className = 'news_pagination_bts waves-effect';                
           } 
        }

        var total = pgDivs.length;
        //varre os botoes e limpa a marcação 
        for (var n = total; n >= 0; n--) {
           if (pgDivs[n] != undefined) {
                pgDivs[n].className = 'news_pagination_div hide';                
           }
        }
    }
    this.viewNewsPage = function (page){

       //console.log(page);  
       this.cleanNewsPage();


       var bt = document.getElement('news_pagination_bt_' + page);
       var div = document.getElement('news_pagination_div_' + page);
       if (!bt || !div){
            return;
       }
        
       bt.className = 'news_pagination_bts active'; 
       div.className = 'news_pagination_div'; 

       
        var d = document.getElementsByClassName('news-content-header');
        if (!d || d.length <= 0 ){
            return;
        } 
        d[0].scrollIntoView();                    
    }

    this.newsPageSet = function (mode){
        
        var pgBtA = document.getElementsByClassName('news_pagination_bts active'); 
        if (pgBtA.length <= 0) {
            console.log('aqui 1');
            return;
        }

       var a = document.getElementsByClassName('news_pagination_bts active')[0].childNodes[0];
       if (!a){
            console.log('aqui 2');
            return;
       }

       var pos = parseInt(a.innerHTML);

       if (mode == 'next'){
            pos = pos + 1;
       }

       if (mode == 'prior'){
            pos = pos - 1; 
       }
       console.log(pos);

       var bt = document.getElement('news_pagination_bt_' + pos);
       if (bt){
         this.viewNewsPage(pos);
       }
    }


            
  this._updateHighlight = function(){
    	
    	var objs = document.getElementsByClassName('slice-highlight');
        if (objs.length <= 0) {
            return;
        }
        var total = objs.length;
          
       // console.log('total  : ' + total );
                          
        for (var n = total; n >= 0; n--) {
            if (objs[n] != undefined) {
            ////**************************   
                var elem = objs[n]; 
                                              
            	if (elem.className == 'slice-highlight'){
            		
            		elem.setAttribute('id','slice-highlight-' + n);
            	 	elem.className = 'slice-highlight init'
            	 	
            	 	
            	 	if (elem.className == 'slice-highlight init'){
            	 		this._updateHiglightObserve(n);
            	 	}
            	 	
            	}                     
            ////*****************************                
            }
         } 
         
    }
  this._updateHiglightObserve = function(id){
    	
    	var elem = document.getElement('slice-highlight-' + id);
        if (!elem){
            return;            
        }
        elem.idItem = id;

        /* metodo do navegador, que detecita se um elemento está visivel ou não  */
        // retorna um array, mas o elemento mais importante é =>   "isIntersecting: true"
        var io = new IntersectionObserver(
        entries => {  
            if (entries[0].isIntersecting){  
                //console.log('div entrou na vista : ' + this.getId() );  
                 var objE = document.getElement('slice-highlight-' + elem.idItem );
                 if (objE && objE.className == 'slice-highlight init'){
                     setTimeout('new sliceProtectMedia()._updateHighlightClass("'+ elem.idItem +'");', 300);	             
                 } 
            } 
            //console.log(entries);
        },{
            /* valores default */
        });  
        // inicia 
        io.observe(elem); 
        
    }            
  this._updateHighlightClass = function(id){
       //console.log('tentou atualizar : ' + id );	
       var elem = document.getElement('slice-highlight-' +id);
       if (elem){ 
         elem.className = 'slice-highlight slice-highlighted';
       }
    }
    


    //#endregion
    //#region propriedades públicas

    //#region gets


    //#endregion

    this.initObserver = function(elementClassName,callback){
        var elem = document.getElementsByClassName(elementClassName);
        if (elem[0]){ 
            var io = new IntersectionObserver(
            entries => {   
                if (entries[0].isIntersecting){  
                ///************          
                   setTimeout(callback,100);                 
                   //console.log('iniciou os Videos do youtube XXXX'); 
                ///************         
                } 
                //console.log(entries);
            },{
                // valores default  
            });  
                // inicia 
            io.observe(elem[0]);
         }   
    }

    this.init = function () {
     
        setTimeout('new sliceProtectMedia()._updateURLs();', 150);
        setTimeout('new sliceProtectMedia()._updateIURLs();', 200);
        //setTimeout('new sliceProtectMedia()._updateImages();', 250);
        //setTimeout('new sliceProtectMedia()._updateImagesURL();', 250);
        //setTimeout('new sliceProtectMedia()._updateYoutube();', 250);
        //setTimeout('new sliceProtectMedia()._updateInstagram();', 300);
        //setTimeout('new sliceProtectMedia()._updateFacebook();', 350);
        //setTimeout('new sliceProtectMedia()._updateVideos();', 400);  
        //setTimeout('new sliceProtectMedia()._updateTwitter();', 800);
        //setTimeout('new sliceProtectMedia()._updateReddit();', 600);

        //setTimeout('new sliceProtectMedia()._updateSlide();', 500);
        //setTimeout('new sliceProtectMedia()._updateSecurityImage();', 300);          
        //setTimeout('new sliceProtectMedia()._updateSecurityURL();', 300);
        //setTimeout('new sliceProtectMedia()._updateSecurityTEXT();', 300);
        
        setTimeout('new sliceProtectMedia()._updatePagination();', 300);
        setTimeout('new sliceProtectMedia()._updateHighlight();', 200);
        

        //itens que carrega script externo passa por aqui
        this.initObserver('youtube-protect-sbbcode','new sliceProtectMedia()._updateYoutube();');
        this.initObserver('instagram-protect-sbbcode','new sliceProtectMedia()._updateInstagram();');
        this.initObserver('facebook-protect-sbbcode','new sliceProtectMedia()._updateFacebook();');
        this.initObserver('twitter-protect-sbbcode','new sliceProtectMedia()._updateTwitter();');
        this.initObserver('reddit-protect-sbbcode','new sliceProtectMedia()._updateReddit();');
        this.initObserver('video-protect-sbbcode','new sliceProtectMedia()._updateVideos();');      
        
        this.initObserver('image-protect-sbbcode','new sliceProtectMedia()._updateImages();'); 
        this.initObserver('image-url-protect-sbbcode','new sliceProtectMedia()._updateImagesURL();');  
        
        this.initObserver('slide-sbbcode','new sliceProtectMedia()._updateSlide();');   
        
        this.initObserver('sbbcode-sec-img','new sliceProtectMedia()._updateSecurityImage();'); 
        this.initObserver('sbbcode-sec-url','new sliceProtectMedia()._updateSecurityURL();'); 
        this.initObserver('sbbcode-sec-text','new sliceProtectMedia()._updateSecurityTEXT();'); 

    };
    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}


//#endregion 

//#region sliceModal
function sliceModal() {
    //#region proprieades privadas
    this._id = null;
    this._view = false;
    this._title = 'Titulo';
    this._subtitle = '';
    this._content = '';
    this._w = 0;
    this._h = 0;

    this._useOptions = false;
    this._optionsContent = '';
    this._closeText = "Fechar";
    this._sendText = "Enviar";
    this._useSendButton = false;
    this._submitAction = function () { }

    //#region sets
    this.setSubmitAction = function (action) {
        this._submitAction = action;
        //this._store();
        return this;
    }
    this._getSubmitAction = function () {
        return this._submitAction;
    };

    this._store = function () {
        window._sliceModal = this;
    };
    this._load = function () {
        var o = window._sliceModal;
        if (!o) {
            return;
        }
        this.setId(o.getId());
    };
    //#endregion

    this._mountHTML = function () {

        var s = "";

        var style = '';
        if (this.getHeight() > 0 && this.getWidth() > 0) {   //height: ' + this.getHeight() + 'px; 
            style = 'style="max-height:' + this.getHeight() + 'px; !important;	width: ' + this.getWidth() + 'px;"';
        }

        s += '<div id="slice_modal" class="modal modal-fixed-footer" ' + style + '>';
        s += '<div class="modal-content">';
        ///***************
        s += '<div class="div-title" id="modal-title">';
        s += '<div class="title">' + this.getTitle() + '</div>';
        if (this.getSubTitle() != '') {
            s += '<div class="sub-title">' + this.getSubTitle() + '</div>';
        }
        s += '</div>';

        ///***************
        s += '<div class="div-content" id="modal-content">';
        s += this.getContent();
        s += '</div>';
        ///***************
        s += '</div>';

        s += '<div class="modal-footer" id="modal-footer">';

        if (this.getUseSendButton()) {
            s += '<a href="javascript:void(0);" class="waves-effect waves-grey btn-flat" id="modal_bt_send">' + this.getSendText() + '</a>';
        }

        s += '<a href="javascript:void(0);" class="waves-effect waves-grey btn-flat" id="modal_bt_close">' + this.getCloseText() + '</a>';

        s += '</div>';


        if (this.getUseOptions()) {
            var styleOpt = '';
            if (this.getSubTitle() != '') {
                styleOpt = ' btn-modal-options-2';
            }
            s += '<a class="dropdown-trigger btn-flat btn-modal-options ' + styleOpt + '" href="#" data-target="dropdown_modal_opt"><i class="material-icons">more_horiz</i></a>';
            s += '<ul id="dropdown_modal_opt" class="dropdown-content btn-modal-options-menu">' + this.getOptionsContent() + '</ul>';
        }

        s += '</div>';


        ///

        new sliceContainer('footer_scripts_content').write(s);

        var d = document.getElement('modal_bt_close');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj.close();
                return false;
            }
        }
        var d = document.getElement('modal_bt_send');
        if (d) {
            d._submitAction = this._getSubmitAction();
            d.onclick = function () {
                this._submitAction();
                return false;
            }
        }

        if (this.getUseOptions()) {
            $('.dropdown-trigger').dropdown({ alignment: 'right' });
        }

    }

    this._destroi = function () {
        new sliceContainer('slice_modal').remove();
    }

    //#endregion
    //#region propriedades públicas

    //#region sets
    this.setWidth = function (i) {
        this._w = i;
        //this._store();
        return this;
    };
    this.getWidth = function () {
        return this._w;
    };
    this.setHeight = function (i) {
        this._h = i;
        //this._store();
        return this;
    };
    this.getHeight = function () {
        return this._h;
    };


    this.setView = function (i) {
        this._view = i;
        //this._store();
        return this;
    };
    this.isView = function () {
        return this._view;
    };

    this.setId = function (i) {
        this._id = i;
        //this._store();
        return this;
    };
    this.getId = function () {
        return this._id;
    };

    this.setTitle = function (i) {
        this._title = i;
        return this;
    };
    this.getTitle = function () {
        return this._title;
    };

    this.setSubTitle = function (i) {
        this._subtitle = i;
        return this;
    };
    this.getSubTitle = function () {
        return this._subtitle;
    };


    this.setContent = function (i) {
        this._content = i;
        return this;
    };
    this.getContent = function () {
        return this._content;
    };

    this.setCloseText = function (i) {
        this._closeText = i;
        return this;
    };
    this.getCloseText = function () {
        return this._closeText;
    };

    this.setSendText = function (i) {
        this._sendText = i;
        return this;
    };
    this.getSendText = function () {
        return this._sendText;
    };
    this.setUseSendButton = function (i) {
        this._useSendButton = i;
        return this;
    };
    this.getUseSendButton = function () {
        return this._useSendButton;
    };


    this.setUseOptions = function (i) {
        this._useOptions = i;
        return this;
    };
    this.getUseOptions = function () {
        return this._useOptions;
    };
    this.setOptionsContent = function (i) {
        this._optionsContent = i;
        return this;
    };
    this.getOptionsContent = function () {
        return this._optionsContent;
    };
    //#endregion



    this.init = function () {

        this._mountHTML();
        $('.modal').modal();
        return this;

    };

    this.show = function () {
        $('.modal').modal('open');
        this.setView(true);
    };

    this.close = function () {
        $('.modal').modal('close');
        setTimeout('new sliceModal()._destroi();', 500);
        this.setView(false);
    };


    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
//#endregion

//#region sliceToasts
function sliceToasts() {
    //#region proprieades privadas
    this._id = null;
    this._style = '';
    this._msg = '';
    this._time = 5;

    this._store = function () {
        window._sliceToasts = this;
    };
    this._load = function () {
        var o = window._sliceToasts;
        if (!o) {
            return;
        }
        this.setId(o.getId());
    };
    
    //#endregion
    //#region propriedades públicas

    this.setStyle = function (i) {
        this._style = i;
        //this._store();
        return this;
    };
    this.getStyle = function () {
        return this._style;
    };


    this.setId = function (i) {
        this._id = i;
        //this._store();
        return this;
    };
    this.getId = function () {
        return this._id;
    };

    this.setText = function (i) {
        this._msg = i;
        //this._store();
        return this;
    };
    this.getText = function () {
        return this._msg;
    };

    this.setTimeOut = function (i) {
        this._time = i;
        //this._store();
        return this;
    };
    this.getTimeOut = function () {
        return this._time;
    };

    this.show = function () {

        /*
        M.Toast.dismissAll();

        var style = 'blue-grey';

        if (this.getStyle() == 'red') {
            style = 'deep-orange accent-4';
        }
        if (this.getStyle() == 'green') {
            style = 'light-green darken-3';
        }
        if (this.getStyle() == 'orange') {
            style = 'orange darken-2';
        }

        var time = 1000 * this.getTimeOut();

        M.toast({ html: this.getText(), classes: style, displayLength: time });
        */
        return this;
    };

    this.close = function () {
        ///M.Toast.dismissAll();

    };

    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
 //#endregion
 
//#region sliceFormCodeBar
function sliceFormCodeBar(formIdOrObject, textAreaId) {
    /// <summary>Anexa a barra com botões para adicionar o sliceCode em um campo TextArea de um formulário.</summary>
    /// <param name="formIdOrObject" type="Mixed">O objeto ou id do formulário que possui um campo TextArea.</param>
    //#region propriedades privadas
    this._toolBarId = 'gRToolbar';
    this._smileyId = 'gRSmiley';
    this._paletteId = 'gRPalette';

    this._textAreaId = '';
    this._formID = '';

    this._paletteTimeId = null;
    this._paletteEvent = function () { }
    this._smileyTimeId = null;
    this._smileyEvent = function () { }
    this._formObj = null;
    this._ignoreTags = new Array();
    this._setIgnoreTags = function (ignoreTags) {
        this._ignoreTags = ignoreTags;
    };
    this._getIgnoreTags = function () {
        return this._ignoreTags;
    };
    this._getToolBarId = function () {
        return this._toolBarId;
    };
    this._getPaletteId = function () {
        return this._paletteId;
    };
    this._getSmileyId = function () {
        return this._smileyId;
    };
    this._setFormObj = function (formObj) {
        this._formObj = formObj;
    };
    this._getFormObj = function () {
        return this._formObj;
    };
    this._setPaletteEvent = function (paletteEvent) {
        this._paletteEvent = paletteEvent;
    };
    this._getPaletteEvent = function () {
        return this._paletteEvent;
    };
    this._setPaletteTimerId = function (paletteTimerId) {
        this._paletteTimeId = paletteTimerId;
    };
    this._getPaletteTimerId = function () {
        return this._paletteTimeId;
    };
    this._setSmileyEvent = function (smileyEvent) {
        this._smileyEvent = smileyEvent;
    };
    this._getSmileyEvent = function () {
        return this._smileyEvent;
    };
    this._setSmileyTimerId = function (smileyTimerId) {
        this._smileyTimeId = smileyTimerId;
    };
    this._getSmileyTimerId = function () {
        return this._smileyTimeId;
    };

    this._setTextAreaId = function (i) {
        this._textAreaId = i;

        this._toolBarId = 'gRToolbar_' + i;
        this._smileyId = 'gRSmiley_' + i;
        this._paletteId = 'gRPalette_' + i;
    }
    this._getTextAreaId = function () {
        return this._textAreaId;
    }

    this._setFormId = function (i) {
        this._formID = i;
    }
    this._getFormId = function () {
        return this._formID;
    }


    this._getTextAreaObj = function () {
        var o = this._getFormObj();
        var d = o.getElementsByTagName('textarea');
        //return d ? d[0] : null;

        ///************************
        var limit = d.length;
        item = null;
        for (var i = 0; i < limit; i++) {
            if (d[i].id == this._getTextAreaId()) {
                item = d[i];
            }
        }

        return item;

        ///***************************
    };

    this._hasTextArea = function () {
        return this._getTextAreaObj() != null;
    };

    this._store = function () {
        window._sliceFormCodeBar = this;
    };
    this._load = function () {
        var o = window._sliceFormCodeBar;
        if (!o) {
            return;
        }
        this._setFormObj(o._getFormObj());
        this._setTextAreaId(o._getTextAreaId());
        this._setPaletteTimerId(o._getPaletteTimerId());
        this._setPaletteEvent(o._getPaletteEvent());
        this._setSmileyTimerId(o._getSmileyTimerId());
        this._setSmileyEvent(o._getSmileyEvent());
    };

    this._toolBarAppend = function () {
        //se já existir, encerra
        if (new sliceContainer(this._getToolBarId()).exists()) {
            return;
        }
        var d = document.createElement('div');
        d.setAttribute('id', this._getToolBarId());
        d.className = 'scb scbCcontainer';
        this._getTextAreaObj().parentNode.insertBefore(d, this._getTextAreaObj());
        this._showButton();
        this._paletteCreate();
        this._smileyCreate();
    };

    this._showButton = function () {
        var a = new Array();
        a.push('slice.list.code.tag.basic.B;Negrito;b;');
        a.push('slice.list.code.tag.basic.I;Itálico;i;');
        a.push('slice.list.code.tag.basic.U;Sublinhado;u');
        a.push('slice.list.code.tag.basic.S;Rasurado;s');
        a.push('-');
        a.push('slice.list.code.tag.special.Left;Alinhar a Esquerda;b_left');
        a.push('slice.list.code.tag.special.Center;Alinhar Centralizado;b_center');
        a.push('slice.list.code.tag.special.Right;Alinhar a Direita;b_right');
        a.push('-');
        a.push('slice.list.code.tag.special.T1;Título principal;t1');
        a.push('slice.list.code.tag.special.T2;Título secundário;t2');
        a.push('-');


        a.push('slice.list.code.tag.special.Table;Inserir tabela;table');

        a.push('slice.list.code.tag.special.List;Inserir lista;list');
        a.push('slice.list.code.tag.special.List_N;Inserir numeração;list_n');
        a.push('slice.list.code.tag.special.Url;Inserir link;url');
        a.push('-');
        // 'slice.list.code.tag.special.Email;Inserir e-mail;email',
        //'-',
        a.push('slice.list.code.tag.special.Img;Inserir imagem;img');
        a.push('slice.list.code.tag.special.Youtube;Inserir vídeo do Youtube;youtube');



        //'slice.list.code.tag.special.Flash;Inserir um conteúdo em flash;flash',
        a.push('slice.list.code.tag.special.Video;Inserir vídeo;b_video');
        a.push('-');
        a.push('slice.list.code.tag.special.Slide;Inserir Slide;b_slide');
        a.push('slice.list.code.tag.special.Alerta;Inserir Alerta;b_alert');
        a.push('slice.list.code.tag.special.Aviso;Inserir Aviso;b_aviso');
        a.push('slice.list.code.tag.special.Page;Inserir Paginação;b_page');



        a.push('-');
        a.push('slice.list.code.tag.special.Twitter;Inserir Tweet;b_twitter');
        a.push('slice.list.code.tag.special.Facebook;Inserir algo do Facebook;b_face');
        a.push('slice.list.code.tag.special.Instagram;Inserir post do Instagram;b_instagram');
        //'slice.list.code.tag.special.Hr;Régua horizontal;hr',

        a.push('-');

        //'slice.list.code.tag.special.Code;Inserir código;code',

        a.push('slice.list.code.tag.special.Tag;Inserir Tag;b_tag');


        a.push('slice.list.code.tag.special.Quote;Inserir citação;quote');
        a.push('slice.list.code.tag.special.Spoiler;Inserir spoiler;spoiler');
        a.push('-');
        a.push('color');
		a.push('-');
        a.push('slice.list.code.tag.special.Highlight;Inserir Destaque;highlight');
        
        //'smileys'

        var s = '';
        var b = new Array();
        var item = new Array();
        for (var n = 0; n != a.length; n++) {
            //splinter?
            if (a[n] == '-') {
                b.push('<div class="splitter"></div>');
                continue;
            }
            //cor
            if (a[n] == 'color') {
                s = '';
                s += '<div class="button" id="button_color">';
                s += '<div id="sc_float_menu" class="button color" title="Cor da fonte">'; //onclick="new sliceCodeBar().paletteShrink(this);"
                s += '<ul><li><div class="palletContent">---</div><ul>';
                s += '<li><div class="palette">' + this._getPaletteCode() + '</div></li>';
                s += '</ul></li></ul>';
                s += '</div>';
                s += '</div>'; //button
                b.push(s);
                continue;
            }
            //smileys
            if (a[n] == 'smileys') {
                s = '';
                s += '<div class="button" id="button_smiley">';
                s += '<div class="button smileys" title="Inserir Smileys">';  //onclick="new sliceCodeBar().smileyShrink(this);"
                s += '<ul><li><div class="palletContent">---</div><ul>';
                s += '<li><div class="smiley_list">' + this._getSmileyCode() + '</div></li>';
                s += '</ul></li></ul>';
                s += '</div>';
                s += '</div>'; //button
                b.push(s);
                continue;
            }
            item = a[n].split(';');
            s = '';
            s += '<div class="button" id="button_' + item[2] + '">';
            s += '<div class="button ' + item[2] + '" title="' + item[1] + '" onclick="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ').click(' + item[0] + ');"></div>';
            s += '</div>'; //button

            b.push(s);
        }
        s = b.join('');
        new sliceContainer(this._getToolBarId()).write(s);
        //remover botoes
        for (var n = 0; n != this._getIgnoreTags().length; n++) {
            new sliceContainer('button_' + this._getIgnoreTags()[n]).remove();
        }
    };
    this._getPaletteCode = function () {
        //preenchimento
        var a = new Array(
			'#FFFFFF', '#CCCCCC', '#C0C0C0', '#999999', '#666666', '#333333', '#000000',
			'#FCCCCC', '#FF6666', '#FF0000', '#CC0000', '#990000', '#660000', '#330000',
			'#FFCC99', '#FF9966', '#FF9900', '#FF6600', '#CC6600', '#993300', '#663300',
			'#FFFF99', '#FFFF66', '#FFCC66', '#FFCC33', '#CC9933', '#996633', '#663333',
			'#FFFFCC', '#FFFF33', '#FFFF00', '#FFCC00', '#999900', '#666600', '#333300',
			'#99FF99', '#66FF99', '#33FF33', '#33CC00', '#009900', '#006600', '#003300',
			'#99FFFF', '#33FFFF', '#66CCCC', '#00CCCC', '#339999', '#336666', '#003333',
			'#CCFFFF', '#66FFFF', '#33CCFF', '#3366FF', '#3333FF', '#000099', '#000066',
			'#CCCCFF', '#9999FF', '#6666CC', '#6633FF', '#6600CC', '#333399', '#330099',
			'#FFCCFF', '#FF99FF', '#CC66CC', '#CC33CC', '#993399', '#663366', '#330033'
		);
        var s = '';
        for (var n = 0; n != a.length; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 7; i++) {
                if (a[n]) {
                    s += '<div class="item" style="background-color:' + a[n] + '" onclick="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ').click(slice.list.code.tag.special.Color,\'' + a[n] + '\')" onmouseover="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._colorOnMouseOver();" onmouseout="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._colorOnMouseOut();"></div>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        return s;
    };
    this._getSmileyCode = function () {
        //preenchimento
        var b = new sliceSmiley().getSmileys();
        var a = [
            b[12], b[5], b[1], b[2], b[3], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15], b[16],
            b[17], b[18], b[19], b[20], b[21], b[22], b[23], b[27], b[28], b[30], b[33], b[34], b[25], b[26]
        ];

        var s = '';
        var total = a.length;
        for (var n = 0; n != total; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 5; i++) {
                if (a[n]) {
                    s += '<span title="' + a[n].title + '" class="smiley ' + a[n].className + '" onclick="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ').click(slice.list.code.tag.special.Smiley,\'' + a[n].shortCut + '\')" onmouseover="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._smileyOnMouseOver();" onmouseout="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._smileyOnMouseOut();">|</span>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        return s;
    };
    this._paletteCreate = function () {
        if (new sliceContainer(this._getPaletteId()).exists()) {
            return;
        }

        var d = document.createElement('div');
        d.setAttribute('id', this._getPaletteId());
        d.className = 'palette';

        with (d.style) {
            display = 'none';
        }

        document.getElement(this._getToolBarId()).appendChild(d);
        //document.body.appendChild(d);
        //preenchimento
        var a = new Array(
			'#FFFFFF', '#CCCCCC', '#C0C0C0', '#999999', '#666666', '#333333', '#000000',
			'#FCCCCC', '#FF6666', '#FF0000', '#CC0000', '#990000', '#660000', '#330000',
			'#FFCC99', '#FF9966', '#FF9900', '#FF6600', '#CC6600', '#993300', '#663300',
			'#FFFF99', '#FFFF66', '#FFCC66', '#FFCC33', '#CC9933', '#996633', '#663333',
			'#FFFFCC', '#FFFF33', '#FFFF00', '#FFCC00', '#999900', '#666600', '#333300',
			'#99FF99', '#66FF99', '#33FF33', '#33CC00', '#009900', '#006600', '#003300',
			'#99FFFF', '#33FFFF', '#66CCCC', '#00CCCC', '#339999', '#336666', '#003333',
			'#CCFFFF', '#66FFFF', '#33CCFF', '#3366FF', '#3333FF', '#000099', '#000066',
			'#CCCCFF', '#9999FF', '#6666CC', '#6633FF', '#6600CC', '#333399', '#330099',
			'#FFCCFF', '#FF99FF', '#CC66CC', '#CC33CC', '#993399', '#663366', '#330033'
		);
        var s = '';
        for (var n = 0; n != a.length; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 7; i++) {
                if (a[n]) {
                    s += '<div class="item" style="background-color:' + a[n] + '" onclick="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ').click(slice.list.code.tag.special.Color,\'' + a[n] + '\')" onmouseover="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._colorOnMouseOver();" onmouseout="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._colorOnMouseOut();"></div>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        new sliceContainer(this._getPaletteId()).write(s);
    };
    this._paletteShow = function () {
        new sliceContainer(this._getPaletteId()).show();
    };
    this._paletteHide = function () {
        new sliceContainer(this._getPaletteId()).hide();
        //restaurar evento
        document.onmouseup = this._getPaletteEvent();
    };
    this._colorOnMouseOut = function () {
        clearTimeout(this._getPaletteTimerId());
        this._setPaletteTimerId(self.setTimeout('new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._paletteHide()', 1000));
        this._store();
    };
    this._colorOnMouseOver = function () {
        clearTimeout(this._getPaletteTimerId());
        this._setPaletteTimerId(null);
        this._store();
    };
    this._smileyCreate = function () {
        if (new sliceContainer(this._getSmileyId()).exists()) {
            return;
        }

        var d = document.createElement('div');
        d.setAttribute('id', this._getSmileyId());
        d.className = 'smiley_list';

        with (d.style) {
            display = 'none';
        }

        document.getElement(this._getToolBarId()).appendChild(d);
        //document.body.appendChild(d);
        //preenchimento
        var b = new sliceSmiley().getSmileys();
        var a = [
            b[12], b[5], b[1], b[2], b[3], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15], b[16],
            b[17], b[18], b[19], b[20], b[21], b[22], b[23], b[27], b[28], b[30], b[33], b[34], b[25], b[26]
        ];

        var s = '';
        var total = a.length;
        for (var n = 0; n != total; n++) {
            s += '<div class="line">';
            for (var i = 0; i != 5; i++) {
                if (a[n]) {
                    s += '<span title="' + a[n].title + '" class="smiley ' + a[n].className + '" onclick="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ').click(slice.list.code.tag.special.Smiley,\'' + a[n].shortCut + '\')" onmouseover="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._smileyOnMouseOver();" onmouseout="new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._smileyOnMouseOut();">|</span>';
                }

                n++;
                if (n == a.length) {
                    break;
                }
            }
            n--;
            s += '</div>';
            if (n == a.length) {
                break;
            }
        }
        new sliceContainer(this._getSmileyId()).write(s);
    };
    this._smileyShow = function () {
        new sliceContainer(this._getSmileyId()).show();
    };
    this._smileyHide = function () {
        new sliceContainer(this._getSmileyId()).hide();
        //restaurar evento
        document.onmouseup = this._getSmileyEvent();
    };
    this._smileyOnMouseOut = function () {
        clearTimeout(this._getSmileyTimerId());
        this._setSmileyTimerId(self.setTimeout('new sliceFormCodeBar(' + "'" + this._getFormId() + "','" + this._getTextAreaId() + "'" + ')._smileyHide()', 1000));
        this._store();
    };
    this._smileyOnMouseOver = function () {
        clearTimeout(this._getSmileyTimerId());
        this._setSmileyTimerId(null);
        this._store();
    },

    this._findPosition = function (obj) {
        var curleft = curtop = 0;
        if (obj.offsetParent) {
            curleft = obj.offsetLeft
            curtop = obj.offsetTop
            while (obj = obj.offsetParent) {
                curleft += obj.offsetLeft
                curtop += obj.offsetTop
            }
        }
        return [curleft, curtop];
    };
    this._rangeSurround = function (text1, text2) {
        var textarea = this._getTextAreaObj();
        // Can a text range be created?
        if (typeof (textarea.caretPos) != "undefined" && textarea.createTextRange) {
            var caretPos = textarea.caretPos, temp_length = caretPos.text.length;

            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text1 + caretPos.text + text2 + ' ' : text1 + caretPos.text + text2;

            if (temp_length == 0) {
                caretPos.moveStart("character", -text2.length);
                caretPos.moveEnd("character", -text2.length);
                caretPos.select();
            }
            else
                textarea.focus(caretPos);
        }
        // Mozilla text range wrap.
        else if (typeof (textarea.selectionStart) != "undefined") {
            var begin = textarea.value.substr(0, textarea.selectionStart);
            var selection = textarea.value.substr(textarea.selectionStart, textarea.selectionEnd - textarea.selectionStart);
            var end = textarea.value.substr(textarea.selectionEnd);
            var newCursorPos = textarea.selectionStart;
            var scrollPos = textarea.scrollTop;

            textarea.value = begin + text1 + selection + text2 + end;

            if (textarea.setSelectionRange) {
                if (selection.length == 0)
                    textarea.setSelectionRange(newCursorPos + text1.length, newCursorPos + text1.length);
                else
                    textarea.setSelectionRange(newCursorPos, newCursorPos + text1.length + selection.length + text2.length);
                textarea.focus();
            }
            textarea.scrollTop = scrollPos;
        }
        // Just put them on the end, then.
        else {
            textarea.value += text1 + text2;
            textarea.focus(textarea.value.length - 1);
        }
    };
    this._rangeReplace = function (text) {
        var textarea = this._getTextAreaObj();
        // Attempt to create a text range (IE).
        if (typeof (textarea.caretPos) != "undefined" && textarea.createTextRange) {
            var caretPos = textarea.caretPos;

            caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
            caretPos.select();
        }
        // Mozilla text range replace.
        else if (typeof (textarea.selectionStart) != "undefined") {
            var begin = textarea.value.substr(0, textarea.selectionStart);
            var end = textarea.value.substr(textarea.selectionEnd);
            var scrollPos = textarea.scrollTop;

            textarea.value = begin + text + end;

            if (textarea.setSelectionRange) {
                textarea.focus();
                textarea.setSelectionRange(begin.length + text.length, begin.length + text.length);
            }
            textarea.scrollTop = scrollPos;
        }
        // Just put it on the end.
        else {
            textarea.value += text;
            textarea.focus(textarea.value.length - 1);
        }
    };
    this._appendTextAreaEvent = function () {
        var text = this._getTextAreaObj();
        text.onchange = function () { new sliceFormCodeBar(this._getFormId(), this._getTextAreaId())._storeCaret(); };
        text.onkeyup = function () { new sliceFormCodeBar(this._getFormId(), this._getTextAreaId())._storeCaret(); };
        text.onclick = function () { new sliceFormCodeBar(this._getFormId(), this._getTextAreaId())._storeCaret(); };
        text.onselect = function () { new sliceFormCodeBar(this._getFormId(), this._getTextAreaId())._storeCaret(); };
    };
    this._storeCaret = function () {
        var text = this._getTextAreaObj();
        // Only bother if it will be useful.
        if (typeof (text.createTextRange) != "undefined") {
            text.caretPos = document.selection.createRange().duplicate();
        }
    };
    //#endregion
    //#region propriedades públicas
    this.paletteShrink = function (obj) {
        /// <summary>Exibe ou oculta a paleta de cores.</summary>
        /// <param name="obj" type="Object">A referência ao objeto em que a paleta deve ficar embaixo.</param>
        var d = document.getElement(this._getPaletteId());
        if (d.style.display == "") {
            this._paletteHide();
            return;
        }
        //guardar evento
        this._setPaletteEvent(document.onmouseup);
        document.onmouseup = function () { new sliceFormCodeBar(this._getFormId(), this._getTextAreaId())._paletteHide() }
        //posicionar
        //alert(obj.parentNode);
        var p = this._findPosition(obj);
        var p1 = new Array(0, 0);
        var pt;
        //var g = obj;
        //logica gvziana, pegar o pai mais externo para gerar a posição absoluta
        /*while(true){
        g = g.parentNode;
        pt = this._findPosition(g);
        if (pt[0]==0 && pt[1]==0){
        break;
        }
        p1 = pt;
        }*/

        d.style.left = p[0] - p1[0] - 23 + 'px';
        d.style.top = p[1] - p1[1] + 5 + 'px';
        this._paletteShow();
    };
    this.smileyShrink = function (obj) {
        /// <summary>Exibe ou oculta a paleta de cores.</summary>
        /// <param name="obj" type="Object">A referência ao objeto em que a paleta deve ficar embaixo.</param>
        var d = document.getElement(this._getSmileyId());
        if (d.style.display == "") {
            this._smileyHide();
            return;
        }
        //guardar evento
        this._setPaletteEvent(document.onmouseup);
        document.onmouseup = function () { new sliceFormCodeBar(this._getFormId(), this._getTextAreaId())._smileyHide() }
        //posicionar
        //alert(obj.parentNode);
        var p = this._findPosition(obj);
        var p1 = new Array(0, 0);
        var pt;
        //var g = obj;
        //logica gvziana, pegar o pai mais externo para gerar a posição absoluta
        /*while(true){
        g = g.parentNode;
        pt = this._findPosition(g);
        if (pt[0]==0 && pt[1]==0){
        break;
        }
        p1 = pt;
        }*/

        d.style.left = p[0] - p1[0] - 23 + 'px';
        d.style.top = p[1] - p1[1] + 5 + 'px';
        this._smileyShow();
    };
    this.click = function (tag, value) {
        /// <summary>Ação ao clicar em um botão.</summary>
        /// <param name="tag" type="String">A tag, utilize os lists slice.list.code.tag.basic e slice.list.code.tag.special para listagem</param>
        /// <param name="value" type="String">Opcional. </param>
        switch (tag) {
            case slice.list.code.tag.special.Hr:
                this._rangeReplace('[hr]');
                break;
            case slice.list.code.tag.special.Page:
                this._rangeReplace('[page]');
                break;
            case slice.list.code.tag.special.Color:
                this._rangeSurround('[' + tag.toLowerCase() + '=' + value + ']', '[/' + tag.toLowerCase() + ']');
                this._paletteHide();
                break;
            case slice.list.code.tag.special.Smiley:
                this._rangeReplace('' + value + '');
                this._smileyHide();
                break;
            case slice.list.code.tag.special.List:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nItem 1 \nItem 2 \nItem 3 \n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.List_N:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nItem 1 \nItem 2 \nItem 3 \n', '[/' + tag.toLowerCase() + ']');
                break;    
            case slice.list.code.tag.special.Table:
                //this._rangeSurround('[' + tag.toLowerCase() + ']\nTítulo 1 // Título 2 \nCélula 1-A // Célula 2-A \nCélula 1-B // Célula 2-B \n', '[/' + tag.toLowerCase() + ']');
                this._rangeSurround('[' + tag.toLowerCase() + ']\n[tr]\n[th]Titulo Coluna 1[/th]\n[th]Titulo Coluna 2[/th]\n[/tr]\n[tr]\n[td]Linha 1 - Coluna 1[/td]\n[td]Linha 2 - Coluna 1[/td]\n[/tr]\n[tr]\n[td]Linha 2 - Coluna 1[/td]\n[td]Linha 2 - Coluna 2[/td]\n[/tr]\n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.Alerta:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nTITULO DO ALERTA \nDescrição do alerta \n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.Aviso:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nTITULO DO AVISO \nDescrição do aviso \n', '[/' + tag.toLowerCase() + ']');
                break;
            case slice.list.code.tag.special.Slide:
                this._rangeSurround('[' + tag.toLowerCase() + ']\nLink da imagem \nLink da imagem \nLink da imagem \n', '[/' + tag.toLowerCase() + ']');
                break;
            default:
                this._rangeSurround('[' + tag.toLowerCase() + ']', '[/' + tag.toLowerCase() + ']');
                break;
        }
    };
    this.ignoreTag = function (tag) {
        /// <summary>Ignore uma tag, ao fazer isso o botão correspondente não aparecerá na caixa.</summary>
        /// <param name="tag" type="String">Uma tag básica ou especial, utilize os lists slice.list.code.tag.basic e slice.list.code.tag.special para listagem</param>
        this._getIgnoreTags().push(tag);
        return this;
    };
    this.apply = function () {
        /// <summary>Aplica/anexa a barra ao formulário indicado no método construtor.</summary>
        if (!this._hasTextArea()) {
            return;
        }
        this._toolBarAppend();
    };


    this.remove = function () {
        //se existir, remove 
        if (new sliceContainer(this._getToolBarId()).exists()) {
            new sliceContainer(this._getToolBarId()).remove();
        }
    };

    //#endregion
    //#region construtor
    if (formIdOrObject && textAreaId) {
        this._setFormObj(document.forms[formIdOrObject] ? document.forms[formIdOrObject] : formIdOrObject);
        this._setTextAreaId(textAreaId);
        this._setFormId(formIdOrObject);
        this._store();
    } else {
        this._load();
    }
    //#endregion
}
//#endregion

//#region sliceImageLazy 
function sliceImageLazy(){
    this._image = '';
    this._id = '';
    this._isLoaded = false;

    this._setIsLoaded = function (i){
        this._isLoaded = i;
        return this;
    } 
    this._getIsLoaded = function (){
        this._isLoaded;
    }
      
    this.setId = function (i) {
        this._id = i;
        return this;
    };
    this.getId = function () {
        return this._id;
    };
    
    this.setImage = function (i) {
        this._image = i;
        return this; 
    };
    this.getImage = function () {
        return this._image;
    };
    
    this._store = function () {
       window._sliceImageLazy = this;        
    };
    this._load = function () {
        var o = window._sliceImageLazy;
        if (!o) {
            return;
        }
        this.setImage(o.getImage()); 
        this.setId(o.setId());  
    }; 


    this.isVisible = function(elem){
           
        if (!elem){
            return false;
        } 

	    var distance = elem.getBoundingClientRect();
	    return ( 
		    distance.top >= 0 && distance.left >= 0 &&
		    distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
		    distance.right <= (window.innerWidth || document.documentElement.clientWidth)
	    );   

    };

    this.onView = function(){

        var elem = document.getElement(this.getId());
        if (!elem){
            elem = document.getElementsByClassName(this.getId())[0];
            if (!elem){
                return;
            } 
        } 
        
        //var image = document.querySelector('[data-image]');

        /*
        if(this.isVisible(elem)){  
            elem.setAttribute('src', elem.getAttribute('slice-lz-src') );
            elem.setAttribute('slice-lz-src','');         
            document.removeEventListener("scroll", new sliceImageLazy().setId(this.getId()).onView() );
        } */

    };

    this.adjust = function(){

        var elem = document.getElement(this.getId());
        if (!elem){
            elem = document.getElementsByClassName(this.getId())[0];
            if (!elem){
                return;
            } 
        }  
        
        if (elem.hasAttribute('slice-lz-src') ){  
            elem.setAttribute('src', elem.getAttribute('slice-lz-src') );
            elem.setAttribute('slice-lz-src',''); 
            elem.removeAttribute('slice-lz-src');             
        } 

    };
    
    this.fadeIn = function(id){
    	var elem = document.getElement(id);
        if (!elem){
        	return;
        }
        
        var classN = elem.className;
		classN = new sliceString(classN).str_replace('slice-lz-in', '');
		classN = new sliceString(classN).str_replace('slice-lz-out', '');

		elem.className = classN + ' slice-lz-in';
    	
    }
    this.init = function() {
        
        var elem = document.getElement(this.getId());
        if (!elem){
            elem = document.getElementsByClassName(this.getId())[0];
            if (!elem){
                return;
            }  
        }
       
        if (!elem.hasAttribute('slice-lz-src') ){
            return;
        } 
         
        /* metodo do navegador, que detecita se um elemento está visivel ou não  */
        // retorna um array, mas o elemento mais importante é =>   "isIntersecting: true"
        var io = new IntersectionObserver(
        entries => {  
            if (entries[0].isIntersecting){  
                //console.log('div entrou na vista : ' + this.getId() );  
                 if (elem.hasAttribute('slice-lz-src') ){
                 	    
                 	/*var classN = elem.className;
					classN = new sliceString(classN).str_replace('slice-lz-in', '');
					classN = new sliceString(classN).str_replace('slice-lz-out', '');
					elem.className = classN + ' slice-lz-out';
					*/
					
                    elem.setAttribute('src', elem.getAttribute('slice-lz-src') );
                    elem.setAttribute('slice-lz-src',''); 
                    elem.removeAttribute('slice-lz-src');  

                    //setTimeout('new sliceImageLazy("' + this.getId() + '").fadeIn();',500);                   
                } 
            } 
            //console.log(entries);
        },{
            /* valores default */
        });  
        // inicia 
        io.observe(elem); 
                  
        //console.log('aqui.... 2'); 

        ///document.addEventListener("scroll", new sliceImageLazy().setId(this.getId()).onView() );
                
    };


}; 
//#endregion 

 
//#region sliceUser 
function sliceUser() {
    /// <summary>Classe para manipular o usuário que está navegando no club: login, logff, key</summary>
    //#region propriedades privadas
    this._id = 0;
    this._name = '';
    this._userlogin = '';
    this._avatar = '';
    this._url = '';
    this._email = '';
    this._checked = false;
    this._key = 'myKey';
    this._moderator = false;
    this._admin = false;
    this._idStatus = 0;
    this._storeMode = 'both'; //'cookie' ou 'storage' ou 'both';

    this._useCompartilhe = false;

    this._userStatus = null; 
    
    this._status = slice.list.interation.status.None; //define se esta sendo enviado

    //#region sets
    this._setUserStatus = function (i) {
        this._userStatus = i;
        this._store(); 
        return this;
    };
    this._getUserStatus = function (i) {
        return this._userStatus;
    };


    this._setStatus = function (status) {
        this._status = status;
        this._store();
        return this;
   };
    this._getStatus = function () {
        return this._status;
   };

    this._setId = function (id) {
        this._id = id;
    };
    this._setKey = function (key) {
        this._key = key;
    };
    this._setName = function (name) {
        this._name = name;
    };
    this._setUserLogin = function (name) {
        this._userlogin = name;
    };
    this._setURL = function (i) {
        this._url = i;
    };
    this._setAvatar = function (avatar) {
        this._avatar = avatar;
    };
    this._setEmail = function (email) {
        this._email = email;
    };
    this._setPainel = function (painel) {
        this._painel = painel;
    };
    this._setStoreMode = function (storeMode) {
        this._storeMode = storeMode;
    };
    this._getStoreMode = function () {
        return this._storeMode;
    };
    this._setModerator = function (moderator) {
        this._moderator = moderator;
    };
    this._setAdmin = function (admin) {
        this._admin = admin;
    };
    this._setChecked = function (checked) {
        this._checked = checked;
        return this;
    };
    this._isChecked = function () {
        return this._checked;
    };
    this._setIdStatus = function (id) {
        this._idStatus = id;
    };
    this.getIdStatus = function () {
        return this._idStatus;
    };
    this._store = function () {
        /// <summary>Armazena o usuário e chave</summary>
        if (!this.isLogged()) {
            return;
        }
        //armazena o objeto todo
        window._sliceUser = this;
        //if (this.isModerator()) {
            this._setStoreMode('both');
        //}
        if (this._getStoreMode() == 'cookie' || this._getStoreMode() == 'both') {
            //escreve os cookies
            var cookie = new sliceCookie('userid', this.getId());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('userkey', this.getKey());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('username', this.getName());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('userlogin', this.getUserLogin());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('userurl', this.getURL());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('useravatar', this.getAvatar());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('useremail', this.getEmail());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('usermoderator', this.isModerator() ? 1 : 0);
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('useradmin', this.isAdmin() ? 1 : 0);
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            // 
            cookie = new sliceCookie('userStatus', this._getUserStatus());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
            //
            cookie = new sliceCookie('userIdStatus', this.getIdStatus());
            cookie.setExpires(1, slice.list.cookie.timeUnit.Months);
            cookie.setPath('/').write();
        }
        if (this._getStoreMode() == 'storage' || this._getStoreMode() == 'both') {
            var o = new Object();
            o = {
                id: this.getId(),
                key: this.getKey(),
                url: this.getURL(),
                login:this.getUserLogin(), 
                name: this.getName(),
                avatar: this.getAvatar(),
                email: this.getEmail(),
                moderator: this.isModerator(),
                admin: this.isAdmin(),
                checked: this._isChecked(),
                userStatus: this._getUserStatus(),
                userIdStatus: this.getIdStatus()
            }
            var storage = new sliceStorage(slice.list.storage.method.Local);
            storage.setField('login', o);
        }

    };
    this._load = function () {
        if (this._getStoreMode() == 'cookie') {
            //via cookie
            var cookie = new sliceCookie('userid');
            if (cookie.read()) {
                this._setId(cookie.getValue());
            }
            cookie = new sliceCookie('userkey');
            if (cookie.read()) {
                this._setKey(cookie.getValue());
            }
            cookie = new sliceCookie('username');
            if (cookie.read()) {
                this._setName(cookie.getValue());
            }
            cookie = new sliceCookie('userlogin');
            if (cookie.read()) {
                this._setName(cookie.getUserLogin());
            }            
            cookie = new sliceCookie('userurl');
            if (cookie.read()) {
                this._setURL(cookie.getValue());
            }
            cookie = new sliceCookie('useravatar');
            if (cookie.read()) {
                this._setAvatar(cookie.getValue());
            }
            cookie = new sliceCookie('useremail');
            if (cookie.read()) {
                this._setEmail(cookie.getValue());
            }
            cookie = new sliceCookie('usermoderator');
            if (cookie.read()) {
                this._setModerator(cookie.getValue() == 1);
            }
            cookie = new sliceCookie('useradmin');
            if (cookie.read()) {
                this._setAdmin(cookie.getValue() == 1);
            }

            cookie = new sliceCookie('userStatus');
            if (cookie.read()) {
                this._setUserStatus(cookie.getValue() == 1);
            }
            
            cookie = new sliceCookie('userIdStatus');
            if (cookie.read()) {
                this._setIdStatus(cookie.getValue() == 1);
            }
        } else {
            //store
            var storage = new sliceStorage(slice.list.storage.method.Local);
            if (storage.issetField('login')) {
                var login = storage.getField('login');
                this._setId(login.id);
                this._setKey(login.key);
                this._setName(login.name);
                this._setUserLogin(login.login);
                this._setURL(login.url);
                this._setAvatar(login.avatar);
                this._setEmail(login.email);
                this._setModerator(login.moderator);
                this._setAdmin(login.admin);
                this._setChecked(login.checked);
                this._setUserStatus(login.userStatus); 
                this._setIdStatus(login.userIdStatus); 
            }
        }
        var o = window._sliceUser;
        if (o) {
            this._setId(o.getId());
            this._setKey(o.getKey());
            this._setUserLogin(o.getUserLogin());
            this._setName(o.getName());
            this._setURL(o.getURL());
            this._setAvatar(o.getAvatar());
            this._setEmail(o.getEmail());
            this._setModerator(o.isModerator());
            this._setAdmin(o.isAdmin());
            this._setChecked(o._isChecked());

            this._setStatus(o._getStatus());
            this._setUserStatus(o._getUserStatus());
            this._setIdStatus(o.getIdStatus());
        }
    };
    this._dispose = function () {
        ///<summary>Libera os recursos. Deve ser chamado pelo método logoff apenas.</summary>
        this._setId(0);
        this._setKey('myKey');
        this._setName('');
        this._setUserLogin('');
        this._setURL('');
        this._setAvatar('');
        this._setEmail('');
        this._setModerator('');
        this._setAdmin('');
        this._setChecked(false);
        this._setUserStatus(null);
		this._setIdStatus(0);
		
        window._sliceUser = null;
        var a = ['userid', 'userkey', 'username', 'userlogin','userurl', 'useravatar', 'usermoderator', 'useradmin', 'useremail'];
        for (var n = 0; n != a.length; n++) {
            new sliceCookie(a[n]).setPath('/').expire();
        }
        new sliceStorage(slice.list.storage.method.Local).unsetField('login');
    };
    //#endregion

    //#region forms de logins
    this._login = function () {
        var d = document.getElement('form_user');
        if (!d) {
            return;
        }

        new sliceContainer('form-msg-error').write('').hide();

        if (d.user.value.length < 3) {
            //new sliceLoader().show('Informe seu usuário corretamente', slice.list.loader.type.Info, 5);
            new sliceToasts().setText('Inform your user correctly!').setStyle('red').show();
            d.user.focus();
            return;
        }
        if (d.password.value.length < 3) {
            //new sliceLoader().show('Informe sua senha corretamente', slice.list.loader.type.Info,5);            
            new sliceToasts().setText('Enter your password correctly!').setStyle('red').show();
            d.password.focus();
            return;
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/post/login');
        o.addPostVar('user', d.user.value);
        o.addPostVar('password', d.password.value);
        o.obj = this;
        o.onSubmit = function () {
            //this.obj._showLoadingLogin();
            //new sliceLoader().show('Efetuando o login', slice.list.loader.type.Progress);

            new sliceToasts().setText('Logging in. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                 
                new sliceToasts().setText('It was not possible to login. ' + this.getErrorDescription()).setStyle('red').show();
                console.log('It was not possible to login. ' + this.getErrorDescription());

                new sliceContainer('form-msg-error').write(this.getErrorDescription()).show();

                 
                return;
            }
            

            new sliceToasts().setText('Login successfully.').setStyle('green').show();

            new sliceStorage(slice.list.storage.method.Local).unsetContent();
            this.obj._setId(this.response.details.id);
            this.obj._setUserLogin(this.response.details.login);
            this.obj._setKey(this.response.details.key);
            this.obj._setName(this.response.details.name);
            this.obj._setURL(this.response.details.url);
            this.obj._setEmail(this.response.details.email);
            this.obj._setAvatar(this.response.details.avatar.path);
            this.obj._setModerator(this.response.details.isModerator);
            this.obj._setAdmin(this.response.details.isAdmin); 
            this.obj._setIdStatus(this.response.details.idStatus);
            this.obj._store();

            this.obj._login_painel();
            //refresh
            //console.log("usuario logado");
            //return;

            var urlgo = new sliceBasics().getUrlVar('urlgo');
            if (urlgo != "") {
                window.location.href = urlgo;
            } else {
                //window.location.href = this.obj._getUserLink();
                window.location.href =  window.location.protocol + '//' + window.location.host + '/';
            }


        }
        o.send();
    };
    this._logoff = function () {
        ///<summary>Efetua o logoff do usuário.</summary>
        if (!this.isLogged()) {
            this._login_form();
            //new sliceUser()._googleSingOut();
            //new sliceUser()._facebookLogout();
            return;
        }

        
        //new sliceUser()._facebookLogout();
        
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/post/logoff');
        //o.addPostVar('timesend', new Date().getTime());      
        o.obj = this;
        o.onSubmit = function () {
            new sliceToasts().setText('Logging out of the system').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText('It was not possible to log out. ' + this.getErrorDescription()).setStyle('red').show();
                console.log('It was not possible to log out. ' + this.getErrorDescription());
                return;
            }

            new sliceToasts().setText('Logoff OK!').setStyle('normal').setTimeOut(5).show();

            var u = new sliceUser();
            u._dispose();
            new sliceStorage(slice.list.storage.method.Local).unsetContent();
            u._login_form();

            new sliceUser()._googleSingOut();
            new sliceUser()._facebookLogout();

            setTimeout('window.location.reload()', 1000); 
        }
        o.send();
        

    }

    this._requestNewPass = function () {
        var d = document.getElement('form_user');
        if (!d) {             
            return;
        }

        new sliceContainer('form-msg-error').write('').hide();

        if (d.username.value.length < 3) {
            new sliceToasts().setText('Inform your user correctly!').setStyle('red').show();
            d.username.focus();
            return;
        }
        if (d.email.value.length < 3) {
            new sliceToasts().setText('Enter your email correctly!').setStyle('red').show();
            d.email.focus();
            return;
        }
                 

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/request/newpass');
        o.addPostVar('username', d.username.value);
        o.addPostVar('email', d.email.value);
        o.obj = this;
        o.onSubmit = function () {
            //this.obj._showLoadingLogin();
            //new sliceLoader().show('Efetuando o login', slice.list.loader.type.Progress);

            new sliceToasts().setText('Sending order. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                console.log('An error has occurred: ' + this.getErrorDescription());

                new sliceContainer('form-msg-error').write(this.getErrorDescription()).show();

                return;
            }

            new sliceToasts().setText('A new password has been sent to your email.').setStyle('green').setTimeOut(10).show();

            new sliceContainer('form-msg-error').write('A new password has been sent to your email. <br> Email may take a few minutes to arrive!').show();

            new sliceContainer('div-bt-request').write('<a class="btn-floating btn-small waves-effect waves-light green darken-2"><i class="material-icons">check</i></a>');


        }
        o.send();
    };
    this._login_painelL__OLD = function () {
        var d = document.getElement('form_user_login_1');
        if (!d) {
            //return false;
        }

        var s = '';
        var s1 = '';

        //s1 += '<div class="user-text-menu"><span class="hide-on-small-only">Bem-vindo</span> <a href="' + this._getUserLink() + '">' + this.getName() + '</a></div>';
        s1 += '<div class="user-icons-menu">';
        s1 += '<span class="user-icons-text hide-on-med-and-down">Hello</span> <a class="user-icons-name truncate hide-on-med-and-down" href="' + this._getUserLink() + '">' + this.getName() + '</a>';
        //s1 += '<a href="' + this._getUserLink() + 'amigos/"><i class="material-icons " data-position="left"title="Amigos" id="ico-m-friend-1">people</i></a>';
        //s1 += '<a href="' + this._getMessageHomeLink() + '"><i class="material-icons " data-position="left"title="Mensagens" id="ico-m-mail-1">email</i></a>';
        if (this._useCompartilhe){
            s1 += '<a href="' + window.location.protocol + '//' + window.location.host + '/share/"><i class="material-icons  light-green-text text-accent-4" data-position="left"title="Share" id="ico-m-compartilhe-2">create</i></a>';
        }
        s1 += '<a href="' + this._getConfigLink('') + '"><i class="material-icons " data-position="left"title="Settings" id="ico-m-config-1">settings</i></a>';
        s1 += '<a href="javascript:void(0);"><i class="material-icons " data-position="left"title="Log out" id="btUserLogoff1">power_settings_new</i></a>';
        s1 += '</div>';
        new sliceContainer('form_user_login_1').write(s1);

        //******

        s1 = '';
        //s1 += '<div class="user-text-menu"><span class="hide-on-small-only">Bem-vindo</span> <a href="' + this._getUserLink() + '">' + this.getName() + '</a></div>';
        s1 += '<div class="user-icons-menu user-icons-menu-bottom">'; 
        s1 += '<span class="user-icons-text hide-on-small-only">Bem-vindo</span> <a class="user-icons-name" href="' + this._getUserLink() + '">' + this.getName() + '</a>';
       // s1 += '<a href="' + this._getUserLink() + 'amigos/"><i class="material-icons " data-position="left"title="Amigos" id="ico-m-friend-2">people</i></a>';
       // s1 += '<a href="' + this._getMessageHomeLink() + '"><i class="material-icons " data-position="left"title="Mensagens" id="ico-m-mail-2">email</i></a>';
        if (this._useCompartilhe){
            s1 += '<a href="' + window.location.protocol + '//' + window.location.host + '/share/"><i class="material-icons  light-green-text text-accent-4" data-position="left"title="Share" id="ico-m-compartilhe-2">create</i></a>';
        }
        s1 += '<a href="' + this._getConfigLink('') + '"><i class="material-icons " data-position="left"title="Settings" id="ico-m-config-2">settings</i></a>';
        s1 += '<a href="javascript:void(0);"><i class="material-icons " data-position="left"title="Log out" id="btUserLogoff2">power_settings_new</i></a>';
        s1 += '</div>';
        new sliceContainer('form_user_login_2').write(s1);

        //*****

        var b = document.getElement('btUserLogoff1');
        if (b) {
            b.obj = this;
            b.onclick = function () {
                this.obj.logoff();
            }
        }
        var b = document.getElement('btUserLogoff2');
        if (b) {
            b.obj = this;
            b.onclick = function () {
                this.obj.logoff();
            }
        }


        s = '';
        s += '<li>';
        s += '<div class="user-view">';
        s += '<div class="background"><img src="' + window.location.protocol + '//' + window.location.host + '/misc/images/bg_menu.png"></div>';
        s += '<a href="' + this._getUserLink() + '"><img id="menu-user-avt" class="circle z-depth-2" src="' + this.getAvatar() + '?' + new Date().getTime() + '"></a>';
        s += '<a href="' + this._getUserLink() + '"><span class="white-text name">' + this.getName() + '</span></a>';
        s += '<a href="javascript:void(0);"><span class="white-text email">ID: <em>#' + this.getId() + '</em></span></a>';
        s += '</div>';
        s += '</li>';

        //s += '<li><a href="' + this._getUserLink() + '"><i class="material-icons">person_pin</i>Perfil</a></li>';
        //s += '<li><a href="' + this._getUserLink() + 'amigos/"><i class="material-icons">people</i>Amigos<span id="ico-mf-friend"></span></a></li>';

        //s += '<li><div class="divider"></div></li>';
        //s += '<li><a class="subheader">Opções</a></li>';
        //s += '<li><a href="' + this._getMessageHome() + '"><i class="material-icons">email</i>Mensagens<span id="ico-mf-mail"></span></a></li>';  //<span class="new badge red darken-3" data-badge-caption="novo(s)">4</span>
        //s += '<li><a class="waves-effect" href="' + this._getConfigLink('') + '"><i class="material-icons">settings</i>Configurações</a></li>';
        
        if (this._useCompartilhe){
            s += '<li><a class="waves-effect" href="' + window.location.protocol + '//' + window.location.host + '/share/"><i class="material-icons light-green-text text-accent-4">create</i>Share</a></li>';
        }

        new sliceContainer('slide-out-div').write(s);

       
        s = '';
        s += '<li><div class="divider"></div></li>';
        s += '<div class="menu-sub-item"><a class="waves-effect" href="' + window.location.protocol + '//' + window.location.host + '/my-posts/"><i class="material-icons light-green-text text-accent-4">library_books</i>Your posts</a></div>';
        s += '<div class="menu-sub-item"><a class="waves-effect" href="' + window.location.protocol + '//' + window.location.host + '/my-videos/"><i class="material-icons light-green-text text-accent-4">video_library</i>Your videos</a></div>';
        new sliceContainer('other-menu-left-div').write(s);
        
        s = '';
        s +='<li class="divider" tabindex="-1"></li>';
        s += '<li><a href="' + window.location.protocol + '//' + window.location.host + '/my-posts/" class="waves-effect waves-light"><i class="material-icons light-green-text text-accent-4">library_books</i>Your posts</a></li>'; 
        s += '<li><a href="' + window.location.protocol + '//' + window.location.host + '/my-videos/" class="waves-effect waves-light"><i class="material-icons light-green-text text-accent-4">video_library</i>Your videos</a></li>'; 
        new sliceContainer('other-menu-top-div').write(s);
        
        
        s = '';
        s += '<li><div class="divider"></div></li>';
        s += '<li><a class="subheader">Opções</a></li>';
        s += '<li><a class="waves-effect" href="' + this._getConfigLink('') + '"><i class="material-icons">settings</i>Settings</a></li>';
        s += '<li><a class="waves-effect" href="javascript:void(0);" id="btUserLogoff3"><i class="material-icons">power_settings_new</i>Log out</a></li>';

        new sliceContainer('slide-out-div2').write(s);

        



        var b = document.getElement('btUserLogoff3');
        if (b) {
            b.obj = this;
            b.onclick = function () {
                this.obj.logoff();
            }
        }




    };
    this._login_form__OLD = function () {
        var d = document.getElement('form_user_login_1');
        if (!d) {
            return false;
        }

        var s = '';
        s = '<span class="hide-on-med-and-down">You are not logged in.</span> <a href="javascript:void(0);" id="btLogin1">Login</a> or <a href="javascript:void(0);" id="btRegister1">Register.</a>';
        new sliceContainer('form_user_login_1').write(s);

        s = '<span class="hide-on-small-only">You are not logged in.</span> <a href="javascript:void(0);" id="btLogin2">Login</a> or <a href="javascript:void(0);" id="btRegister2">Register.</a>';
        new sliceContainer('form_user_login_2').write(s);

        var d = document.getElement('btLogin1');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._goLoginPage();
            }
        }
        var d = document.getElement('btLogin2');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._goLoginPage();
            }
        }

        var d = document.getElement('btRegister1');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._goRegisterPage();
            }
        }
        var d = document.getElement('btRegister2');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._goRegisterPage();
            }
        }


        s = '';
        s += '';
        s += '<li>';
        s += '<div class="user-view">';
        s += '<div class="background"><img src="' + window.location.protocol + '//' + window.location.host + '/misc/images/bg_menu.png"></div>';
        s += '</div>';
        s += '</li>';

        s += '<li><a class="subheader">Attention!</a></li>';
        s += '<li class="li_info"><span class="red-text darken-3"><strong>You are not logged in.</strong></span><br> To use all options on the site you must login.</li>';
        s += '<li><a class="waves-effect waves-light btn indigo darken-2" id="btLogin3">Login!</a></li>';

        s += '<div style="display:none;">';
        s += '<li><div class="divider"></div></li>';

        s += '<li><a class="subheader">Register!</a></li>';
        s += '<li class="li_info">If you do not have a login, you can also participate by creating your registration!</li>';
        s += '<li><a class="waves-effect waves-light btn green darken-3" id="btRegister3">Register!</a></li>';
        s += '</div>'; 
        new sliceContainer('slide-out-div').write(s);

        //console.log("o usuario NAO esta logado")

        
        var d = document.getElement('btLogin3');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._goLoginPage();
            }
        }
                        
        var d = document.getElement('btRegister3');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._goRegisterPage();
            }
        }
                       

         
    };


    this._login_painel = function () {
        var d = document.getElement('form_user_login_1');
        if (!d) {
            //return false;
        }

        var s = '';
        var s1 = '';

        s1 += ' | <span class="user-icons-text hide-on-med-and-down">Hello</span> <a class="user-icons-name hide-on-med-and-down" href="javascript:void(0);">' + this.getName() + '</a>';
        s1 += ' - <a href="javascript:void(0);" id="btUserLogoff1">Logout</a>';
        new sliceContainer('form_user_login_1').write(s1);

        //******

        s1 = '';
        s1 += ' | <span class="user-icons-text hide-on-med-and-down">Hello</span> <a class="user-icons-name hide-on-med-and-down" href="javascript:void(0);">' + this.getName() + '</a>';
        s1 += ' - <a href="javascript:void(0);" id="btUserLogoff2">Logout</a>';
        new sliceContainer('form_user_login_2').write(s1);

        //*****

        var b = document.getElement('btUserLogoff1');
        if (b) {
            b.obj = this;
            b.onclick = function () {
                this.obj.logoff();
            }
        }
        var b = document.getElement('btUserLogoff2');
        if (b) {
            b.obj = this;
            b.onclick = function () {
                this.obj.logoff();
            }
        }

         
    };

    this._login_form = function () {
        var d = document.getElement('form_user_login_1');
        if (!d) {
            return false;
        }

        var s = '';
        s = ' | <a href="javascript:void(0);" id="btLogin1">Login</a>';
        new sliceContainer('form_user_login_1').write(s);

        s = ' | <a href="javascript:void(0);" id="btLogin2">Login</a>';
        new sliceContainer('form_user_login_2').write(s);

        var d = document.getElement('btLogin1');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj._goLoginPage();
            }
        }
        var d = document.getElement('btLogin2');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj._goLoginPage();
            }
        }

        var d = document.getElement('btRegister1');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj._goRegisterPage();
            }
        }
        var d = document.getElement('btRegister2');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj._goRegisterPage();
            }
        }


        s = '';
        s += '';
        s += '<li>';
        s += '<div class="user-view">';
        s += '<div class="background"><img src="' + window.location.protocol + '//' + window.location.host + '/misc/images/bg_menu.png"></div>';
        s += '</div>';
        s += '</li>';

        s += '<li><a class="subheader">Attention!</a></li>';
        s += '<li class="li_info"><span class="red-text darken-3"><strong>You are not logged in.</strong></span><br> To use all options on the site you must login.</li>';
        s += '<li><a class="waves-effect waves-light btn indigo darken-2" id="btLogin3">Login!</a></li>';

        s += '<div style="display:none;">';
        s += '<li><div class="divider"></div></li>';

        s += '<li><a class="subheader">Register!</a></li>';
        s += '<li class="li_info">If you do not have a login, you can also participate by creating your registration!</li>';
        s += '<li><a class="waves-effect waves-light btn green darken-3" id="btRegister3">Register!</a></li>';
        s += '</div>'; 
        new sliceContainer('slide-out-div').write(s);

        //console.log("o usuario NAO esta logado")

        
        var d = document.getElement('btLogin3');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj._goLoginPage();
            }
        }
                        
        var d = document.getElement('btRegister3');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj._goRegisterPage();
            }
        }
                       

         
    };


    this._goLoginPage = function () {

        var url = window.location.protocol + '//' + window.location.host + '/performing-login/';

        var go = '';

        var str = new sliceBasics().getUrlVar('urlgo');
        if (str == "") {
            url += '?urlgo=' + encodeURI(window.location.href);
        } else {
            url += '?urlgo=' + str; 
        }

        window.location.href = url; //?urlgo=' + encodeURI(window.location.href);
    }
    this._goRegisterPage = function () {
        window.location.href = window.location.protocol + '//' + window.location.host + '/new-register/';
    }

    this._getLoginLink = function () {
        return window.location.protocol + '//' + window.location.host + '/performing-login/';
    }
    this._getRegistroLink = function () {
        return window.location.protocol + '//' + window.location.host + '/new-register/';
    }
    this._getNovaSenhaLink = function () {
        return window.location.protocol + '//' + window.location.host + '/recover-password/';
    }
    this._getUserLink = function () {
        return window.location.protocol + '//' + window.location.host + '/posts?u=' + this.getUserLogin();
       // return this.getURL();
    }
    this._getMessageHomeLink = function () { 
        return window.location.protocol + '//' + window.location.host + '/mensagens/';
    }
    this._getMessageLink = function () {
        return window.location.protocol + '//' + window.location.host + '/mensagens/recebidas/';
    }
    this._getMessageHome = function () {
        return window.location.protocol + '//' + window.location.host + '/mensagens/';
    }

    this._getMessageSendLink = function () {
        return window.location.protocol + '//' + window.location.host + '/mensagens/enviadas/';
    }
    this._getMessageTrashLink = function () {
        return window.location.protocol + '//' + window.location.host + '/mensagens/lixeira/';
    }
    this._getConfigLink = function (s) {
        return window.location.protocol + '//' + window.location.host + '/settings/' + s;
    }

    this.getFormLogin = function () {
        var d = document.getElement('form_login');
        if (!d) {
            return false;
        }

        if (this.isLogged()) {
            window.location.href = this._getUserLink();
            return;
        }

        var s = '';

        s += '<div class="form-content">';
        s += '<form method="post" id="form_user" name="form_user" enctype="multipart/form-data">';

        s += '<div class="form-title">Realizando Login</div>';
        s += '<div class="form-sub-title">Form de login somente para Administração e Equipe do Site</div>';
        
        s += '<div class="form-container">';
        ///********************************

            s += '<div class="form-input">';
            s += '<div class="form-input-title">Nome de Usuário</div>';
            s += '<div class="form-input-field"><input id="user" name="user" type="text"></div>';            
            s += '</div>';

            s += '<div class="form-input">';
            s += '<div class="form-input-title">Senha do Usuário</div>';
            s += '<div class="form-input-field"><input id="password" name="password" type=""></div>';            
            s += '</div>';
                                          
        ///********************************
        s += '</div>'; ///form-container

        s += '<div class="form-error" style="display:none" id="form-msg-error"></div>';

        s += '<div class="form-action">';
            s += '<a href="javascript:void(0);" class="bt-send" id="btLoginSend" >Login</a>';
        s += '</div>';
                
        s += '</form>';
        s += '</div>'; ///form-content


        /*
        s += '<div id="form_services_bts" class="form_services_bts row">';
        s += '<div id="btGoogleDiv" class="col s12 m6 l6">'; ////1 
        s += '<div class="divLoginBts"><div id="gSignIn"></div></div>';
        s += '</div>'; ////1 

        s += '<div id="btFaceDiv" class="col s12 m6 l6">'; /////2
        s += '<div class="divLoginBts"><div id="fSignIn"></div></div>';
        s += '</div>'; /////2
        s += '</div>';
        */



        /*
        s += '<div class="form_infos">';
        s += '<p>You do not have an account on Space Ero? <a href="' + this._getRegistroLink() + '">Register!</a></p>';
        s += '<p>Forgot your password? Try to <a href="' + this._getNovaSenhaLink() + '">recover</a>.</p>';
        s += '</div>';
        */

        new sliceContainer('form_login').write(s);

        this._adjustBtSigSize(); 
        setTimeout('new sliceUser()._adjustBtSigSize();', 1000);

        var form = document.getElement('form_user');
        if (!form) {
            return;
        }
        form.obj = this;
        form.onsubmit = function () {
            form.obj._login();
        }

        var d = document.getElement('btLoginSend');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._login();
            }
        }


        var b = document.getElement('gSignIn');
        if (b) {
            //this._initGoogleSignScript();
            ///cria o script para iniciar o metodo
            //setTimeout('new sliceUser()._renderGoogleSign()', 700);
            ///************
        }


        var b = document.getElement('fSignIn');
        if (b) {
           // this._initFacebookScript();
           // this._initFacebookBt();
            ///cria o script para iniciar o metodo
            //setTimeout('new sliceUser()._renderGoogleSign()', 700);
            ///************
        }

    }
    this._adjustBtSigSize = function () {
        //form_services_bts
        //btGoogleDiv
        //btFaceDiv

        var d1 = document.getElement('form_services_bts');
        var d2 = document.getElement('btGoogleDiv');
        var d3 = document.getElement('btFaceDiv');
        if (!d1 || !d2 || !d3) {
            return;
        }

        var c = 'col s6 m6 l6';

        if (d1.clientWidth <= 468) {
            c = 'col s12 m12 l12';
        }

        d2.className = c;
        d3.className = c; 

        setTimeout('new sliceUser()._adjustBtSigSize();', 500);
    }
    
    this.getFormRegistro = function () {
        var d = document.getElement('form_login');
        if (!d) {
            return false;
        }

        if (this.isLogged()) {
            window.location.href = this._getUserLink();
            return;
        }

        var s = '';

        s += '<div class="card form_content">';

        s += '<form method="post" id="form_user" name="form_user" enctype="multipart/form-data">';

        s += '<div class="card-content">';
        s += '<span class="card-title">Creating a new account on Space Ero</span>';
        ///********************************

        s += '<div class="form-content">';
        s += '<div class="input-field sub-title">'; 
        s += 'Create an account to use all the features of Space Ero.<br>';
        s += 'To create your account you must be logged into one of the services below, right after, enter your login, and confirm your password.';
        s += '</div>';

        //************
        s += '<div id="form_services_bts_1" class="input-field form_services_bts row">';
        s += '<div id="btGoogleDiv" class="col s12">'; ////1 
        s += '<div class="divLoginBts"><div id="gSignIn"></div></div>';
        s += '</div>'; ////1 

        s += '<div id="btFaceDiv" class="col s12">'; /////2
        s += '<div class="divLoginBts"><div id="fSignIn"></div></div>';
        s += '</div>'; /////2
        s += '</div>';
        ///*****************


        s += '<div class="input-field center-align" style="display:none;" id="user-data-view">';       
        s += '</div>';

        ///**********
        
        s += '<div class="input-field">';
        s += '<input id="username" name="username" type="text" class="validate">';
        s += '<label for="username">Enter a login for your account</label>';
        s += '</div>';

        s += '<div class="input-field">';
        s += '<input id="password" name="password" type="password" class="validate">';
        s += '<label for="password">Enter a security password</label>';
        s += '</div>';

        s += '<div class="input-field">';
        s += '<input id="password_n" name="password_n" type="password" class="validate">';
        s += '<label for="password_n">Confirm the security password</label>';
        s += '</div>';

        s += '<div class="input-field sub-title" style="display:none" id="form-msg-error"></div>';

        s += '</div>';

        ///********************************
        s += '</div>';

        s += '<div class="card-action" id ="div-bt-request">';
        s += '<a href="javascript:void(0);" class="waves-effect waves-light btn green darken-3" id="btNewUserSend">Create an account</a>';
        s += '</div>';

        s += '</form>';

        s += '</div>';

        s += '<div class="form_infos">';
        s += '<p><span class="red-text"><strong>Attention:</strong></span>When you register on the website, you are automatically <a href="https://www.madinfinite.com/termos-de-uso/" target="_blank">accepting the terms of use</a>.<br><br></p>';

        s += '<p>Already have a registration? <a href="' + this._getLoginLink() + '">Login!</a></p>';
        s += '<p>Forgot your password? Try to  <a href="' + this._getNovaSenhaLink() + '">recover</a></p>';
        s += '</div>';

        new sliceContainer('form_login').write(s);
         
        window._sliceUserNewCheckAcc = 0;

        var b = document.getElement('gSignIn');
        if (b) {
            this._initGoogleSignScript();
            ///cria o script para iniciar o metodo
            setTimeout('new sliceUser()._renderGoogleSignNewUser()', 700);
            ///************
        }


        var b = document.getElement('fSignIn');
        if (b) {
            this._initFacebookScript();
            this._initFacebookBtNewUser();
            ///cria o script para iniciar o metodo
            //setTimeout('new sliceUser()._renderGoogleSign()', 700);
            ///************
        }


        var form = document.getElement('form_user');
        if (!form) {
            return;
        }
        form.obj = this;
        form.onsubmit = function () {
            form.obj._sendRequestAddNewUser();
        }

        var d = document.getElement('btNewUserSend');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._sendRequestAddNewUser();
            }
        }


    }

    this._sendRequestAddNewUser = function () {
        //console.log('clicou no botao de enviar');
        var form = document.getElement('form_user');
        if (!form) {
            //console.log('1');
            return;
        }

        var btSend = document.getElement('btNewUserSend');
        if (!btSend) {
            //console.log('2');
            return;
        }

        if (btSend.className == 'waves-effect waves-light btn green darken-3 disabled') {
            //console.log('3');
            return;
        }

        new sliceContainer('form-msg-error').write('').hide();

        if (window._sliceUserNewCheckAcc == undefined || window._sliceUserNewCheckAcc <= 0) {
            new sliceToasts().setText('You must log in to Google or Facebook before continuing.').setStyle('red').show();
            return;
        }
        if (form.username.value.length < 5) {
            new sliceToasts().setText('Enter your login correctly. It must be at least 4 characters.').setStyle('red').show();
            return;
        }
        if (form.password.value.length < 6) {
            new sliceToasts().setText('Enter your password correctly. It must be at least 6 characters long.').setStyle('red').show();
            return;
        }
        if (form.password.value != form.password_n.value) {
            new sliceToasts().setText('Confirm your password correctly').setStyle('red').show();
            return;
        }

        //console.log('4');

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/post/user-send-add-new');
        o.addPostVar('user', form.username.value);
        o.addPostVar('password', form.password.value);

        o.addPostVar('type_acc', window._sliceUserNewCheckAcc);

        if (window._sliceUserNewCheckAcc == 1) {
            var googleData = this._googleGetUserData();
            if (googleData == null) {
                console.log('Ex001c');
                return;
            }
            o.addPostVar('g_email', googleData.emails[0].value);
            o.addPostVar('g_id', googleData.id);
            o.addPostVar('g_givenName', googleData.name.givenName);
            o.addPostVar('g_familyName', googleData.name.familyName);
            o.addPostVar('g_full_name', googleData.displayName);
            o.addPostVar('g_gender', googleData.gender);

            if (!googleData.image.isDefault) {
                o.addPostVar('g_image', googleData.image.url);
            }
            if (googleData.placesLived != undefined) {
                o.addPostVar('g_placesLived', googleData.placesLived[0].value);
            }
            o.addPostVar('st', new sliceString(window.btoa(googleData.id + 'gv' + googleData.emails[0].value)).str_replace('=', 't') + 'a' + new sliceString().rand(100, 999));
        }
        if (window._sliceUserNewCheckAcc == 2) {
            var faceData = this._getFacebookUserData();
            if (faceData == null) {
                console.log('Ex001d');
                return;
            }
            o.addPostVar('f_email', faceData.email);
            o.addPostVar('f_id', faceData.id);
            o.addPostVar('f_first_name', faceData.first_name);
            o.addPostVar('f_last_name', faceData.last_name);
            o.addPostVar('f_full_name', faceData.first_name + ' ' + faceData.last_name);
            o.addPostVar('f_gender', faceData.gender);

            //if (!faceData.picture.data.is_silhouette) {
            o.addPostVar('f_image', faceData.picture.data.url);
            //} 
            if (faceData.locale != undefined) {
                o.addPostVar('f_locale', faceData.locale);
            }
            o.addPostVar('st', new sliceString(window.btoa(faceData.id + 'gv' + faceData.email)).str_replace('=', 't') + 'a' + new sliceString().rand(100, 999));
        }

        o.obj = this;
        o.btSend = btSend;
        o.onSubmit = function () {
            this.btSend.setAttribute('class', 'waves-effect waves-light btn green darken-3 disabled');
            new sliceToasts().setText('Sending data. Wait!').setStyle('normal').setTimeOut(50).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                this.btSend.setAttribute('class', 'waves-effect waves-light btn green darken-3');

                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                new sliceContainer('form-msg-error').write(this.getErrorDescription()).show();
                //new sliceUser()._googleSingOut(); 
                return;
            }

            new sliceToasts().setText('Your registration was successful!').setStyle('normal').setTimeOut(5).show();
            new sliceContainer('form-msg-error').write('Your registration was successful!').show();

            new sliceStorage(slice.list.storage.method.Local).unsetContent();
            this.obj._setId(this.response.details.id);
            this.obj._setKey(this.response.details.key);
            this.obj._setName(this.response.details.name);
            this.obj._setURL(this.response.details.url);
            this.obj._setEmail(this.response.details.email);
            this.obj._setAvatar(this.response.details.avatar.path);
            this.obj._setModerator(this.response.details.isModerator);
            this.obj._setAdmin(this.response.details.isAdmin);
            this.obj._setIdStatus(this.response.details.idStatus);
            this.obj._store();

            new sliceContainer('div-bt-request').write('<a class="btn-floating btn-small waves-effect waves-light green darken-2"><i class="material-icons">check</i></a>');

            //refresh
            //window.location.href = this.obj._getUserLink();
            window.location.href =  window.location.protocol + '//' + window.location.host + '/settings/';
        }
        o.send();
    };

    
    this.getFormRecuperarSenha = function () {
        var d = document.getElement('form_login');
        if (!d) {
            return false;
        }

        if (this.isLogged()) {
            window.location.href = this._getUserLink();
            return;
        }

        var s = '';

        s += '<div class="card form_content">';

        s += '<form method="post" id="form_user" name="form_user" enctype="multipart/form-data">';

        s += '<div class="card-content">';
        s += '<span class="card-title">Recover Password</span>';
        ///********************************

        s += '<div class="form-content">';
        s += '<div class="input-field sub-title">';
        s += 'If your password has been entered, just enter your <strong> username </strong> and the <strong> email used in your account </strong> and we will send you a new password in your email!';
        s += '</div>';

        s += '<div class="input-field">';
        s += '<input id="username" name="username" type="text" class="validate">';
        s += '<label for="username">Enter your account login</label>';
        s += '</div>';

        s += '<div class="input-field">';
        s += '<input id="email" name="email" type="email" class="validate">';
        s += '<label for="email">E-mail used in the account</label>';
        s += '</div>';

        s += '<div class="input-field sub-title" style="display:none" id="form-msg-error"></div>';

        s += '</div>';

        ///********************************
        s += '</div>';

        s += '<div class="card-action" id="div-bt-request">';
        s += '<a href="javascript:void(0);" class="waves-effect waves-light btn indigo darken-2" id="btRequestNewPass">Send email</a>';
        s += '</div>';

        s += '</form>';

        s += '</div>';

        s += '<div class="form_infos">';
        s += '<p><span class="red-text"><strong>Attention:</strong></span> We will send a message in the registration email to your account! If you don\'t see it in a few minutes, check your spam box. If after one day the email does not arrive, contact us.<br><br></p>';
        s += '<p>Don\'t have a Space Ero account? <a href="' + this._getRegistroLink() + '">Register!</a></p>';
        s += '<p>Already have a registration? <a href="' + this._getRegistroLink() + '">Log in!</a></p>';
        s += '</div>';

        new sliceContainer('form_login').write(s);


        var form = document.getElement('form_user');
        if (!form) {
            return;
        }
        form.obj = this;
        form.onsubmit = function () {
            form.obj._requestNewPass();
        } 

        var d = document.getElement('btRequestNewPass');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._requestNewPass();
            }
        }


    }
    //#endregion

    //#region metodos do google e face

    this._initGoogleSignScript = function () {

        var divBody = document.getElement("body");
        if (!divBody) {
            return;
        }

        //so cria se o script não estiver na pagina
        var d = document.getElement("google-signin-scp");
        if (!d) {
            ///cria a metatag
            var meta = document.createElement('meta');
            meta.name = "google-signin-client_id";
            meta.content = "888265508412-7b1pqsmlptlhv5ssv01jkb7i3q80s6o6.apps.googleusercontent.com";
            document.getElementsByTagName('head')[0].appendChild(meta);

            ///cria o script da api         
            var scp = document.createElement('script');
            scp.type = 'text/javascript';
            scp.id = "google-signin-scp";
            scp.src = "https://apis.google.com/js/client:platform.js?onload=renderButton";
            divBody.appendChild(scp);
        } 

    }
    this._renderGoogleSign = function () {

        var bDiv = document.getElement('gSignIn');
        if (!bDiv) {
            return;
        }

        bDiv.style.display = "block";

        var onSuccess = function onSuccess(googleUser) {
            var profile = googleUser.getBasicProfile();
            gapi.client.load('plus', 'v1', function () {
                var request = gapi.client.plus.people.get({
                    'userId': 'me'
                });
                //apos logar executa este metodo         
                request.execute(function (resp) {
                    window._sliceGlDt = resp;
                    new sliceUser()._sendLoginWithGoogle(resp);
                });
            });
        }
        var onFailure = function onFailure(error) {            
            //new sliceToasts().setText(error).setStyle('red').setTimeOut(5).show();
            console.log("Error signing in with Google: " + error)
        }

        gapi.signin2.render('gSignIn', {
            'scope': 'profile email',
            'width': 225,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });

        setTimeout('new sliceUser()._adjustGoogleBT()', 300);
        
    }
    this._adjustGoogleBT = function () {
        if (document.getElementsByClassName('abcRioButtonContents')[0] != null) {
            document.getElementsByClassName('abcRioButtonContents')[0].childNodes[0].innerHTML = "Logar com o Google";
        } else {
            setTimeout('new sliceUser()._adjustGoogleBT()', 300);
        }
    }

    this._googleSingOut = function () {
        this._initGoogleSignScript();

        ///cria o script para iniciar o metodo          
        setTimeout('new sliceUser()._googleLogoff()', 300);
        ///************
    }
    this._googleLogoff = function () {

        //new sliceContainer('footer_scripts_content').create('external_script_itens', '');

        var bDiv = document.getElement('gSignIn');
        if (!bDiv) {
            new sliceContainer('gSignIn').create('footer_scripts_content', '');
        }
        var onSuccess = function onSuccess(googleUser) {
            var profile = googleUser.getBasicProfile();
            gapi.client.load('plus', 'v1', function () {
                var request = gapi.client.plus.people.get({
                    'userId': 'me'                    
                });
                //apos logar executa este metodo         
                request.execute(function (resp) {
                    var auth2 = gapi.auth2.getAuthInstance();
                    auth2.signOut().then(function () {
                        window._sliceGlDt = null;
                        console.log('Deslogou do Google');
                    });
                });
            });
        }
        var onFailure = function onFailure(error) {
            //new sliceToasts().setText(error).setStyle('red').setTimeOut(5).show();
            console.log("Erro ao fazer o logoff do Google: "+ error)
        }

        gapi.signin2.render('gSignIn', {
            'scope': 'profile email',
            'width': 200,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });



    }
    this._googleGetUserData = function () {
        return (window._sliceGlDt !== undefined ? window._sliceGlDt : null);
    }
    this._sendLoginWithGoogle = function (googleData) {
        if (!googleData || googleData == undefined) {
            //new sliceLoader().show('Ocorreu um erro ao logar com a sua conta do Google', slice.list.loader.type.Info, 5);
            new sliceToasts().setText('There was an error logging in with your Google account').setStyle('red').setTimeOut(5).show();
            console.log('Erro g003');
            this._googleLogoff();
            setTimeout('window.location.reload();', 1000);
            return
        }

        new sliceContainer('form-msg-error').write('').hide();

        //console.log('Logou-se na conta do google');
        //console.log('aqui ---');
        //console.log(googleData);

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/post/google-login');
        o.addPostVar('g_email', googleData.emails[0].value);
        o.addPostVar('g_id', googleData.id);
        o.addPostVar('g_givenName', googleData.name.givenName);
        o.addPostVar('g_familyName', googleData.name.familyName);
        o.addPostVar('g_full_name', googleData.displayName);
        o.addPostVar('g_gender', googleData.gender);

        if (!googleData.image.isDefault) {
            o.addPostVar('g_image', googleData.image.url);
        }
        if (googleData.placesLived != undefined) {
            o.addPostVar('g_placesLived', googleData.placesLived[0].value);
        }
        o.addPostVar('g_st', new sliceString(window.btoa(googleData.id + 'gv' + googleData.emails[0].value)).str_replace('=', 't') + 'a' + new sliceString().rand(100, 999));
        o.obj = this;
        o.onSubmit = function () {
            new sliceToasts().setText('Logging in. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                var error = this.getErrorDescription();
                if (error == 'g001') {
                    new sliceToasts().setText('Your Google account was found at registration. But it was not linked correctly!').setStyle('red').setTimeOut(5).show();
                    //new sliceLoader().show('Sua conta Google foi localizada no cadastro. Mas não foi vinculada corretamente!', slice.list.loader.type.Info, 5);
                    this.obj._initGoogleLink();
                    return;
                }
                //new sliceLoader().show('Não foi possivel realizar o login. ' + error, slice.list.loader.type.Info, 5);
                new sliceToasts().setText('Could not login.' + error).setStyle('red').setTimeOut(30).show();
                new sliceContainer('form-msg-error').write(error).show();

                this.obj._googleSingOut();
                this.obj.getFormLogin();
                return;
            }
            //new sliceLoader().show('Login efetuado com sucesso', slice.list.loader.type.Info, 5);
            new sliceToasts().setText('Login successfully').setStyle('green').setTimeOut(5).show();

            new sliceStorage(slice.list.storage.method.Local).unsetContent();
            this.obj._setId(this.response.details.id);
            this.obj._setKey(this.response.details.key);
            this.obj._setName(this.response.details.name);
            this.obj._setUserLogin(this.response.details.login);
            this.obj._setURL(this.response.details.url);
            this.obj._setEmail(this.response.details.email);
            this.obj._setAvatar(this.response.details.avatar.path);
            this.obj._setModerator(this.response.details.isModerator);
            this.obj._setAdmin(this.response.details.isAdmin);
             this.obj._setIdStatus(this.response.details.idStatus);
            this.obj._store();
            //refresh
            //window.location.reload();

            this.obj._login_painel();

            var urlgo = new sliceBasics().getUrlVar('urlgo');
            if (urlgo != "") {
                window.location.href = urlgo;
            } else {
                //window.location.href = this.obj._getUserLink();
                window.location.href =  window.location.protocol + '//' + window.location.host + '/';
            }

        }
        o.send();

    }
         
    this._initGoogleLink = function () {

        var googleData = this._googleGetUserData();
        if (googleData == null) {
            new sliceToasts().setText('There was an error logging into your Google account').setStyle('red').setTimeOut(5).show();
            console.log('Erro g001');
            console.log(googleData);
            this._googleSingOut();
            setTimeout('window.location.reload();', 1000);
            return;
        }

        var d = document.getElement('form_login');
        if (!d) {
            return false;
        }

        if (this.isLogged()) {
            window.location.href = this._getUserLink();
            return;
        }
        
        var s = '';
        s += '<div class="form-fl-field"><img class="circle z-depth-2" src="' + new sliceString(googleData.image.url).str_replace('?sz=50', '?sz=100') + '"></div>';
        s += '<div class="form-fl-field">' + googleData.name.givenName + '<br><em>' + googleData.emails[0].value + '</em></div>';

        new sliceContainer('form_login').write(this._getLinkFormHTML(s));



        var form = document.getElement('form_user');
        if (!form) {
            return;
        }
        form.obj = this;
        form.onsubmit = function () {
            form.obj._sendGoogleLinkRequest();
        }

        var d = document.getElement('btLinkSend');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._sendGoogleLinkRequest();
            }
        }


    }
    this._sendGoogleLinkRequest = function () {
        var googleData = this._googleGetUserData();
        if (googleData == null) {
            new sliceToasts().setText('There was an error logging into your Google account').setStyle('red').setTimeOut(5).show();
            console.log('Erro g002');
            console.log(googleData);
            this._googleSingOut()
            setTimeout('window.location.reload();', 1000);
            return;
        }

        new sliceContainer('form-msg-error').write('').hide();

        var fname = document.getElement('gf_user');
        var fpass = document.getElement('gf_password');
        if (!fname || !fpass) {
            return;
        }

        if (fname.value.length < 3) {
            new sliceToasts().setText('Enter your login correctly').setStyle('red').setTimeOut(5).show();
            return;
        }
        if (fpass.value.length < 3) {
            new sliceToasts().setText('Enter your password correctly').setStyle('red').setTimeOut(5).show();
            return;
        }

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/post/google-link-login');
        o.addPostVar('gv_user', fname.value);
        o.addPostVar('gv_password', fpass.value);

        o.addPostVar('g_email', googleData.emails[0].value);
        o.addPostVar('g_id', googleData.id);
        o.addPostVar('g_givenName', googleData.name.givenName);
        o.addPostVar('g_familyName', googleData.name.familyName);
        o.addPostVar('g_full_name', googleData.displayName);
        o.addPostVar('g_gender', googleData.gender);

        if (!googleData.image.isDefault) {
            o.addPostVar('g_image', googleData.image.url);
        }
        if (googleData.placesLived != undefined) {
            o.addPostVar('g_placesLived', googleData.placesLived[0].value);
        }
        o.addPostVar('g_st', new sliceString(window.btoa(googleData.id + 'gv' + googleData.emails[0].value)).str_replace('=', 't') + 'a' + new sliceString().rand(100, 999));
        o.obj = this;
        o.onSubmit = function () {
            //this.obj._showLoadingLogin();           
            new sliceToasts().setText('Linking accounts. Wait').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                var error = this.getErrorDescription();
                new sliceToasts().setText('Could not perform Link. ' + error).setStyle('red').setTimeOut(3).show();
                new sliceContainer('form-msg-error').write(error).show();
                this.obj._googleSingOut();                
                return;
            }
        
            new sliceToasts().setText('Linking successfully').setStyle('green').setTimeOut(3).show();

            new sliceStorage(slice.list.storage.method.Local).unsetContent();
            this.obj._setId(this.response.details.id);
            this.obj._setKey(this.response.details.key);
            this.obj._setName(this.response.details.name);
            this.obj._setURL(this.response.details.url);
            this.obj._setEmail(this.response.details.email);
            this.obj._setAvatar(this.response.details.avatar.path);
            this.obj._setModerator(this.response.details.isModerator);
            this.obj._setAdmin(this.response.details.isAdmin);
            this.obj._setIdStatus(this.response.details.idStatus);
            this.obj._store();
            //refresh
            //window.location.reload();

            this.obj._login_painel();
            //refresh
            //console.log("usuario logado");

            var urlgo = new sliceBasics().getUrlVar('urlgo');
            if (urlgo != "") {
                window.location.href = urlgo;
            } else {
                window.location.href = this.obj._getUserLink();
            }

        }
        o.send();

    }
    
    this._getLinkFormHTML = function (uContent) {

        var s = '';

        s += '<div class="card form_content">';

        s += '<form method="post" id="form_user" name="form_user" enctype="multipart/form-data">';

        s += '<div class="card-content">';
        s += '<span class="card-title">Link Space Ero + Google Account</span>';
        ///********************************

        s += '<div class="form-content">';

        s += '<div class="input-field sub-title">An account on Space Ero was found with the same email as your Google account! Use this email to link both.</div>';

        //**********
        s += '<div class="input-field center-align">';
        s += uContent;
        s += '</div>';
        //***********

        s += '<div class="input-field">';
        s += '<input id="gf_user" name="gf_user" type="text" class="validate">';
        s += '<label for="gf_user">Enter your Space Ero login</label>';
        s += '</div>';

        s += '<div class="input-field">';
        s += '<input id="gf_password" name="gf_password" type="password" class="validate">';
        s += '<label for="gf_password">Inform your password</label>';
        s += '</div>';

        s += '<div class="input-field sub-title" style="display:none" id="form-msg-error"></div>';

        s += '</div>';

        ///********************************
        s += '</div>';

        s += '<div class="card-action">';
        s += '<a href="javascript:void(0);" class="waves-effect waves-light btn indigo darken-2" id="btLinkSend" >Link Accounts</a>';
        s += '</div>';

        s += '</form>';

        s += '</div>'; ///form_content



        s += '<div class="form_services_bts row">';
        s += '<div class="col s12 m6">'; ////1 
        s += '<div id="gSignIn"></div>';
        s += '</div>'; ////1 

        s += '<div class="col s12 m6">'; /////2
        s += '<div id="fSignIn"></div>';
        s += '</div>'; /////2
        s += '</div>';



        s += '<div class="form_infos">';
        s += '<p><span class="red-text"><strong>Attention:</strong></span> Account linking can only be done once! <br><br></p>';
        s += '<p>Make sure the Login and Password are correct for your Space Ero account.<br><br></p>';
        s += '<p>When you link your account, it will be automatically activated.<br><br></p>';

        s += '<p>Remember your password? <a href="' + this._getLoginLink() + '">Login</a>.</p>';
        s += '<p>Forgot your password? Try to <a href="' + this._getNovaSenhaLink() + '">recover</a>.</p>';
        s += '<p>Don\'t have a Space Ero account? <a href="' + this._getRegistroLink() + '">Register!</a></p>';


        s += '</div>';

        return s;
    }

    this._initFacebookScript = function () {
        ///script inicial
        window.fbAsyncInit = function () {
            if (typeof FB == 'undefined') {
                return;
            }
            FB.init({
                appId: '599503820244763',
                xfbml: true,
                version: 'v2.8'
            });
            FB.AppEvents.logPageView();
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        } (document, 'script', 'facebook-jssdk'));
        ////*********


    }
    this._initFacebookBt = function () {

        var b = document.getElement('fSignIn');
        if (!b) {
            return;
        }
         
        b.className = 'z-depth-2';
        b.innerHTML = 'Log in with Facebook';
        b.style.display = "block";

        b.obj = this;
        b.onclick = function () {
            this.obj._onclickFacebookInitLogin();
        }

    }
    this._getFacebookUserData = function () {
        return (window._sliceFkDt !== undefined ? window._sliceFkDt : null);
    }
    this._requestFacebookUserData = function () {
        if (typeof FB == 'undefined') {
            return;
        }
        FB.api('/me', { locale: 'en_US', fields: 'id,first_name,last_name,email,link,gender,locale,picture' },
        function (response) {
            window._sliceFkDt = response;
        });
    }
    this._isFacebookLoged = function () {
        if (typeof FB == 'undefined') {
            return;
        }
        var connected = false;
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                //display user data                 
                connected = true;
            }
        });

        return connected;
    }
    this._initFacebookLogin = function () {
        if (typeof FB == 'undefined') {
            return;
        }
        FB.login(function (response) {
            if (response.authResponse) {
                //seta os dados do usuario
                new sliceUser()._requestFacebookUserData();
            } else {               
                new sliceToasts().setText('An error occurred while logging into your Facebook account').setStyle('red').setTimeOut(5).show();
            } 
        }, { scope: 'email' });
    }
    this._facebookLogout = function () {
        if (typeof FB == 'undefined') {
            return;
        }
        FB.logout(function () {
            console.log('Deslogou do Facebook');
            window._sliceFkDt = null;
        });
    }

    this._onclickFacebookInitLogin = function () {
        if (typeof FB == 'undefined') {
            return;
        }
        FB.login(function (response) {
            if (response.authResponse) {
                console.log('Logou-se na conta do Facebook');
                //seta os dados do usuario 
                var u = new sliceUser();
                u._requestFacebookUserData();
                setTimeout('new sliceUser()._sendLoginWithFacebook()', 1000);
                //u._sendLoginWithFacebook();

            } else {                
                new sliceToasts().setText('An error occurred while logging into your Facebook account').setStyle('red').setTimeOut(5).show();
                console.log('Erro f001');
            }
        }, { scope: 'email' });
    }
    this._sendLoginWithFacebook = function () {

        var faceData = this._getFacebookUserData();
        if (faceData == null) {             
            new sliceToasts().setText('An error occurred while logging into your Facebook account').setStyle('red').setTimeOut(5).show();
            console.log('Erro f002');
            console.log(faceData);
            this._facebookLogout();
            setTimeout('window.location.reload();', 1000);
            return;
        }

        new sliceContainer('form-msg-error').write('').hide();

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/post/facebook-login');
        o.addPostVar('f_email', faceData.email);
        o.addPostVar('f_id', faceData.id);
        o.addPostVar('f_first_name', faceData.first_name);
        o.addPostVar('f_last_name', faceData.last_name);
        o.addPostVar('f_full_name', faceData.first_name + ' ' + faceData.last_name);
        o.addPostVar('f_gender', faceData.gender);

        //if (!faceData.picture.data.is_silhouette) {
        o.addPostVar('f_image', faceData.picture.data.url);
        //} 
        if (faceData.locale != undefined) {
            o.addPostVar('f_locale', faceData.locale);
        }
        o.addPostVar('f_st', new sliceString(window.btoa(faceData.id + 'gv' + faceData.email)).str_replace('=', 't') + 'a' + new sliceString().rand(100, 999));
        o.obj = this;
        o.onSubmit = function () {
            //this.obj._showLoadingLogin();           
            new sliceToasts().setText('Logging in. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                var error = this.getErrorDescription();
                if (error == 'g001') {                   
                    new sliceToasts().setText('Your Facebook account was found in the register. But it was not linked correctly!').setStyle('red').setTimeOut(5).show();
                    this.obj._initFacebookLink();
                    return;
                }
                new sliceToasts().setText('It was not possible to login. ' + error).setStyle('red').setTimeOut(5).show();
                new sliceContainer('form-msg-error').write(error).show();

                this.obj._facebookLogout();
                //this.obj._showFormLoginText();
                return;
            }
            new sliceToasts().setText('Login successfully').setStyle('green').setTimeOut(5).show();            
            new sliceStorage(slice.list.storage.method.Local).unsetContent();
            this.obj._setId(this.response.details.id);
            this.obj._setKey(this.response.details.key);
            this.obj._setName(this.response.details.name);
            this.obj._setUserLogin(this.response.details.login);
            this.obj._setURL(this.response.details.url);
            this.obj._setEmail(this.response.details.email);
            this.obj._setAvatar(this.response.details.avatar.path);
            this.obj._setModerator(this.response.details.isModerator);
            this.obj._setAdmin(this.response.details.isAdmin);
            this.obj._setIdStatus(this.response.details.idStatus);
            this.obj._store();
            //refresh
            //window.location.reload();

            this.obj._login_painel();

            var urlgo = new sliceBasics().getUrlVar('urlgo');
            if (urlgo != "") {
                window.location.href = urlgo;
            } else {
                //window.location.href = this.obj._getUserLink();
                window.location.href =  window.location.protocol + '//' + window.location.host + '/';
            }
        }
        o.send();

    }
            
    this._initFacebookLink = function () {

        var faceData = this._getFacebookUserData();
        if (faceData == null) {
            console.log('Dados do facebook não setados');
            return;
        }

        var d = document.getElement('form_login');
        if (!d) {
            return false;
        }

        if (this.isLogged()) {
            window.location.href = this._getUserLink();
            return;
        }

        var s = '';
        s += '<div class="form-fl-field"><img class="circle z-depth-2" src="' + faceData.picture.data.url + '"></div>';
        s += '<div class="form-fl-field">' + faceData.first_name + '<br><em>' + faceData.email + '</em></div>';

        new sliceContainer('form_login').write(this._getLinkFormHTML(s));

        var form = document.getElement('form_user');
        if (!form) {
            return;
        }
        form.obj = this;
        form.onsubmit = function () {
            form.obj._sendFacebookLinkRequest();
        }

        var d = document.getElement('btLinkSend');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                d.obj._sendFacebookLinkRequest();
            }
        }

    }  
    this._sendFacebookLinkRequest = function () {
        var faceData = this._getFacebookUserData();
        if (faceData == null) {
            new sliceToasts().setText('An error occurred while logging into your Facebook account').setStyle('red').setTimeOut(5).show();
            console.log(faceData);
            this._facebookLogout(); 
            setTimeout('window.location.reload();', 1000);
            return;
        }

        new sliceContainer('form-msg-error').write('').hide();

        var fname = document.getElement('gf_user');
        var fpass = document.getElement('gf_password');
        if (!fname || !fpass) {
            return;
        }


        if (fname.value.length < 3) {
            new sliceToasts().setText('Enter your login correctly').setStyle('red').setTimeOut(5).show();
            return;
        }
        if (fpass.value.length < 3) {
            new sliceToasts().setText('Enter your password correctly').setStyle('red').setTimeOut(5).show();
            return;
        }


        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/post/facebook-link-login');
        o.addPostVar('gv_user', fname.value);
        o.addPostVar('gv_password', fpass.value);

        o.addPostVar('f_email', faceData.email);
        o.addPostVar('f_id', faceData.id);
        o.addPostVar('f_first_name', faceData.first_name);
        o.addPostVar('f_last_name', faceData.last_name);
        o.addPostVar('f_full_name', faceData.first_name + ' ' + faceData.last_name);
        o.addPostVar('f_gender', faceData.gender);

        //if (!faceData.picture.data.is_silhouette) {
        o.addPostVar('f_image', faceData.picture.data.url);
        //} 
        if (faceData.locale != undefined) {
            o.addPostVar('f_locale', faceData.locale);
        }
        o.addPostVar('f_st', new sliceString(window.btoa(faceData.id + 'gv' + faceData.email)).str_replace('=', 't') + 'a' + new sliceString().rand(100, 999));
        o.obj = this;
        o.onSubmit = function () {
            //this.obj._showLoadingLogin();            
            new sliceToasts().setText('Linking accounts. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                var error = this.getErrorDescription();
                new sliceToasts().setText('Could not perform Link. ' + error).setStyle('red').setTimeOut(5).show();
                new sliceContainer('form-msg-error').write(error).show();
                this.obj._facebookLogout();                
                return;
            }
             
            new sliceToasts().setText('Linking successfully').setStyle('normal').setTimeOut(5).show();
            new sliceStorage(slice.list.storage.method.Local).unsetContent();
            this.obj._setId(this.response.details.id);
            this.obj._setKey(this.response.details.key);
            this.obj._setName(this.response.details.name);
            this.obj._setURL(this.response.details.url);
            this.obj._setEmail(this.response.details.email);
            this.obj._setAvatar(this.response.details.avatar.path);
            this.obj._setModerator(this.response.details.isModerator);
            this.obj._setAdmin(this.response.details.isAdmin);
             this.obj._setIdStatus(this.response.details.idStatus);
            this.obj._store();
            //refresh 
            //window.location.reload();

            this.obj._login_painel();
            //refresh
            //console.log("usuario logado");

            var urlgo = new sliceBasics().getUrlVar('urlgo');
            if (urlgo != "") {
                window.location.href = urlgo;
            } else {
                window.location.href = this.obj._getUserLink();
            }

        }
        o.send();

    }
    
    /***
    atualiza o form com os dados do usuario logado
    */
    this._updateFormNewUserData = function (type) {

        var d = document.getElement('user-data-view');
        if (!d) {
            return;
        }
        var form = document.getElement('form_user');
        if (!form) {
            return;
        }
        var s = '';

        //atualiza com os dados do google
        if (type == 1) {
            var googleData = this._googleGetUserData();
            if (googleData == null) {
                new sliceToasts().setText('There was an error logging into your Google account').setStyle('red').setTimeOut(5).show();
                console.log('Erro g00x2');
                return;
            }
            window._sliceUserNewCheckAcc = 1;

            s = '';
            s += '<div class="form-fl-field"><img class="circle z-depth-2" src="' + new sliceString(googleData.image.url).str_replace('?sz=50', '?sz=100') + '"></div>';
            s += '<div class="form-fl-field">' + googleData.name.givenName + '<br><em>' + googleData.emails[0].value + '</em></div>';
            d.innerHTML = s;
            d.style.display = "block";

            var e = googleData.emails[0].value.split("@");
            form.username.value = e[0];

            M.updateTextFields();
            return;
        }


        //atualiza com os dados do face
        var faceData = this._getFacebookUserData();
        if (faceData == null) {
            new sliceToasts().setText('There was an error logging into your Facebook account').setStyle('red').setTimeOut(5).show();
            console.log('Erro f00x2');
            return;
        }
        window._sliceUserNewCheckAcc = 2;
        s = '';
        s += '<div class="form-fl-field"><img class="circle z-depth-2" src="' + faceData.picture.data.url + '"></div>';
        s += '<div class="form-fl-field">' + faceData.first_name + '<br><em>' + faceData.email + '</em></div>';
        d.innerHTML = s;
        d.style.display = "block";


        var e = faceData.email.split("@");
        form.username.value = e[0];

        M.updateTextFields();
    }

    this._renderGoogleSignNewUser = function () {

        var bDiv = document.getElement('gSignIn');
        if (!bDiv) {
            return;
        }

        bDiv.style.display = "block";

        var onSuccess = function onSuccess(googleUser) {
            var profile = googleUser.getBasicProfile();
            gapi.client.load('plus', 'v1', function () {
                var request = gapi.client.plus.people.get({
                    'userId': 'me'
                });
                //apos logar executa este metodo         
                request.execute(function (resp) {
                    window._sliceGlDt = resp;
                    new sliceUser()._updateFormNewUserData(1);
                });
            });
        }
        var onFailure = function onFailure(error) {
            //new sliceToasts().setText(error).setStyle('red').setTimeOut(5).show();
            console.log("Erro ao fazer o login do Google: " + error)
        }

        gapi.signin2.render('gSignIn', {
            'scope': 'profile email',
            'width': 225,
            'height': 50,
            'longtitle': true, 
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });

        setTimeout('new sliceUser()._adjustGoogleBT()', 300);

    }
         
    this._initFacebookBtNewUser = function () {

        var b = document.getElement('fSignIn');
        if (!b) {
            return;
        }

        b.className = 'z-depth-2';
        b.innerHTML = 'Log in with Facebook';
        b.style.display = "block";

        b.obj = this;
        b.onclick = function () {
            this.obj._onclickFacebookInitNewUser();
        }

    }
    this._onclickFacebookInitNewUser = function () {
        if (typeof FB == 'undefined') {
            return;
        }
        FB.login(function (response) {
            if (response.authResponse) {
                console.log('Logged in to Facebook account');
                //seta os dados do usuario 
                var u = new sliceUser();
                u._requestFacebookUserData();
                setTimeout('new sliceUser()._updateFormNewUserData(2);', 1000);
                //u._sendLoginWithFacebook();

            } else {
                new sliceToasts().setText('An error occurred while logging into your Facebook account').setStyle('red').setTimeOut(5).show();
                console.log('Erro f00x3');
            }
        }, { scope: 'email' });
    }

    
    //#endregion
    
    //#region configs

    this._getHomeConfigHTML = function () {
        var s = '';

        s += '<div class="row center-align config-home">';
        //****************

        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + this._getConfigLink('profile/') + '" class="a_bt"><i class="medium material-icons">mode_edit</i><br>Update Profile</a>';
        s += '</div>';

        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + this._getConfigLink('avatar/') + '" class="a_bt"><i class="medium material-icons">photo_camera</i><br>Change Avatar</a>';
        s += '</div>';

        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + this._getConfigLink('safety/') + '" class="a_bt"><i class="medium material-icons">security</i><br>Password Change</a>';
        s += '</div>';

        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + this._getConfigLink('email-change/') + '" class="a_bt"><i class="medium material-icons">mail_outline</i><br>Email change</a>';
        s += '</div>';

        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + this._getConfigLink('link-account/') + '" class="a_bt"><i class="medium material-icons">people</i><br>Link Accounts</a>';
        s += '</div>';

        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + this._getConfigLink('delete-account/') + '" class="a_bt"><i class="medium material-icons">delete_forever</i><br>Delete Account</a>';
        s += '</div>';

        
        ///***********
        s += '<div class="hr"></div>';
        
        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + window.location.protocol + '//' + window.location.host + '/my-posts/" class="a_bt"><i class="medium material-icons">library_books</i><br>Your posts</a>';
        s += '</div>';
        
        s += '<div class="col s12 m4 l4">';
        s += '<a href="' + window.location.protocol + '//' + window.location.host + '/meus-vídeos/" class="a_bt"><i class="medium material-icons">video_library</i><br>Your videos</a>';
        s += '</div>';
        
        //****************
        s += '</div>';

        
        new sliceContainer('config-container').write(s);
    }

    ///*************

    this._getConfigPerfilHTML = function () {
            
        var s = '';
        var myDate = new Date();

        s += '<div class="row config-home form_config_user">';
        //****************
                
        s += '<form id="form_edit_basic" name="form_edit_basic" method="post" enctype="multipart/form-data">';

        s += '<div class="row"><div class="col s12 user-edit-det-title">Use this form to update your personal data</div></div>';

        s += '<div class="row">';
        s += '<div class="input-field col s12 m4 l4">';
        s += '<div class="user-edit-det">Do you want to enter your gender?</div>';
        s += '<div>';
        s += '<select id="gender" name="gender">';
        s += '<option value="0">Not informed</option>';
	    s+= '<option value="1">Male</option>';
        s+= '<option value="2">Female</option>';
        s+= '<option value="3">Others</option>';
        s += '</select>';
        s += '</div>';
        s += '</div>';
        s += '</div>';
        //*********

        s += '<div class="row">';
        s += '<div class="input-field col s12 user-edit-det">Date of birth</div>';
        s += '<div class="input-field col s4 m2 l1">';
        s += '<div class="user-edit-det">Day</div>';
        s += '<div><input id="birth_day" name="birth_day" type="number" max="31" min="1" class="validate" ></div>';
        s += '</div>';
        s += '<div class="input-field col s4 m2 l1">';
        s += '<div class="user-edit-det">Monty</div>';
        s += '<div><input id="birth_month" name="birth_month" type="number" max="12" min="1" class="validate" ></div>';
        s += '</div>';
        s += '<div class="input-field col s4 m4 l2">';
        s += '<div class="user-edit-det">Year</div>';
        s += '<div><input id="birth_year" name="birth_year" type="number" max="' + myDate.getFullYear() + '" min="1930" class="validate" ></div>';
        s += '</div>';
        s += '</div>';
        ///*******

        s += '<div class="row">';
        s += '<div class="input-field col s12 m12 l8">';
        s += '<div class="user-edit-det">Enter your location</div>';
        s += '<div><input id="location" name="location" type="text" class="validate" ></div>';
        s += '</div>';
        s += '</div>';
        ///********

        s += '<div class="row">';
        s += '<div class="input-field col s12 m12 l8">';
        s += '<div class="user-edit-det">Personal Text</div>';
        s += '<div><input id="personal_text" name="personal_text" type="text" class="validate" data-length="100" maxlength="100"></div>';
        s += '</div>';
        s += '</div>';
        ///*******

       /* s += '<div class="row">';
        s += '<div class="input-field col s12 m5 l3">';
        s += '<div class="user-edit-det">Nome do site pessoal</div>';
        s += '<div><input id="website_title" name="website_title" type="text" class="validate"></div>';
        s += '</div>';
        s += '<div class="input-field col s12 m7 l9">';
        s += '<div class="user-edit-det">Endereço do site pessoal</div>';
        s += '<div><input id="website_url" name="website_url" type="text" class="validate"></div>';
        s += '</div>';
        s += '</div>';*/
        ///*******

        /*s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Assinatura do fórum</div>';
        s += '<div><textarea id="signature" name="signature" class="materialize-textarea" rows="5" placeholder="Sua assinatura, pode usar bbCode "></textarea></div>';
        s += '</div>';
        s += '</div>';*/
        ///*******

       
        ///***********************
        ///***********************
        ///***********************

        s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">About me</div>';
        s += '<div><textarea id="about" name="about" class="materialize-textarea" rows="5" placeholder="Fale algo sobre você" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';


       /* s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Games Favoritos</div>';
        s += '<div><textarea id="fav_games" name="fav_games" class="materialize-textarea" rows="5" placeholder="Quais seus games favoritos?" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';*/


       /* s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Filmes Favoritos</div>';
        s += '<div><textarea id="fav_movies" name="fav_movies" class="materialize-textarea" rows="5" placeholder="Quais seus filmes favoritos?" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';*/

         
        /*s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Músicas Favoritas</div>';
        s += '<div><textarea id="fav_music" name="fav_music" class="materialize-textarea" rows="5" placeholder="Quais suas músicas favoritas?" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';*/


        /*s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Animes Favoritos</div>';
        s += '<div><textarea id="fav_animes" name="fav_animes" class="materialize-textarea" rows="5" placeholder="Quais seus animes favoritos?" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';*/


        /*s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Esportes Favoritos</div>';
        s += '<div><textarea id="fav_sports" name="fav_sports" class="materialize-textarea" rows="5" placeholder="Quais seus esportes favoritos?" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';*/


        /*s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Séries e Programas Favoritos</div>';
        s += '<div><textarea id="fav_series" name="fav_series" class="materialize-textarea" rows="5" placeholder="Quais suas séries favoritas?" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';*/


       /* s += '<div class="row">';
        s += '<div class="input-field col s12">';
        s += '<div class="user-edit-det">Livros Favoritos</div>';
        s += '<div><textarea id="fav_book" name="fav_book" class="materialize-textarea" rows="5" placeholder="Quais seus livros favoritos?" data-length="350" maxlength="350"></textarea></div>';
        s += '</div>';
        s += '</div>';*/

        ///***********************
        ///***********************
        ///***********************



        s += '<div class="row">';
        s += '<div class="modal-form-line col s12 m12 l12">';
        s += '<div class="form-check-box">';

        s += '<div class="form-check-box-title form-confirm">';
        s += '<div><strong>Before updating read carefully: </strong></div>';
        s += '<div>- Make sure all data is correct, before sending.</div>';
        s += '</div>';

        s += '</div>';
        s += '</div>';
        s += '</div>';


        s += '<div class="row">';
        s += '<div class="form-options">';
            s += '<a class="waves-effect waves-light btn grey darken-1" id="btCancel">Back</a>';
            s += '<a class="waves-effect waves-light btn green darken-1" id="btSubmit1">Update the data</a>';            
        s += '</div>'; 
        s += '</div>';

        s += '</form>';

        //**************** 
        s += '</div>';

        
        new sliceContainer('config-container').write(s);

        var bt = document.getElement('btCancel');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                window.location.href = window.location.protocol + '//' + window.location.host + '/settings/';
            } 
        }

        M.updateTextFields();
        $('select').formSelect();
        $('input#personal_text, textarea#about, textarea#fav_games, textarea#fav_movies, textarea#fav_music, textarea#fav_animes, textarea#fav_sports, textarea#fav_series, textarea#fav_book').characterCounter();
         
        this._getPessoalData('perfil'); 

    }
    this._sendUpdate = function () {
        var f = document.getElement('form_edit_basic');
        if (!f) {
            return; 
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/send/update');
        o.addPostVar('location', f.location.value)
        .addPostVar('gender', f.gender.value)
        .addPostVar('birth_year', f.birth_year.value)
        .addPostVar('birth_month', f.birth_month.value)
        .addPostVar('birth_day', f.birth_day.value)
        //.addPostVar('website_url', f.website_url.value)
        //.addPostVar('website_title', f.website_title.value)
        .addPostVar('personal_text', f.personal_text.value)
        //.addPostVar('signature', f.signature.value)
           
        .addPostVar('about', f.about.value)
        /*.addPostVar('fav_games', f.fav_games.value)
        .addPostVar('fav_movies', f.fav_movies.value)
        .addPostVar('fav_music', f.fav_music.value)
        .addPostVar('fav_animes', f.fav_animes.value)
        .addPostVar('fav_sports', f.fav_sports.value)
        .addPostVar('fav_series', f.fav_series.value)
        .addPostVar('fav_book', f.fav_book.value)*/
        ;
         
        //****
        o.obj = this;
        o.form = f;
        o.onSubmit = function () {
           new sliceToasts().setText("Sending information. Wait.").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                return;
            }           
            new sliceToasts().setText("Your data has been successfully updated.").setStyle('green').setTimeOut(5).show();
        };
        o.send();
    };
    
    this._getPessoalData = function (type) {
        if (!this.isLogged()) {
            new sliceToasts().setText('You are not logged in. Log in to edit your profile.').setStyle('red').show();
            return;
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/get/data');
        o.obj = this;
        o.getType = type;
        o.onSubmit = function () {
            new sliceToasts().setText('Retrieving user data.').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText('We were unable to recover your data. ' + this.getErrorDescription()).setStyle('red').show();
                return;
            }
            new sliceToasts().close();

            switch (this.getType) {
                case 'perfil':
                    this.obj._updatePerfilForm(this.response.details);
                    break;
                case 'vinculo':
                    this.obj._getConfigSyncHTML(this.response.details);
                    break;
            }
        }
        o.send();
    };

    this._updatePerfilForm = function (o) {
        var f = document.forms['form_edit_basic'];
        if (!f) {
            console.log('aqui xx111');
            return;
        }
        f.personal_text.value = o.personal_text;
        f.gender.value = o.gender;
        f.birth_day.value = o.birthdate.day;
        f.birth_month.value = o.birthdate.month;
        f.birth_year.value = o.birthdate.year;
        f.location.value = o.location;
        f.personal_text.value = o.personal_text
        //f.website_title.value = o.website.title;
        //f.website_url.value = o.website.path;
        //f.signature.value = new sliceString(new sliceString(o.signature).str_replace("\n", 'LnLn')).replaceNewLine();

        f.about.value = new sliceString(new sliceString(o.about).str_replace("\n", 'LnLn')).replaceNewLine();

        /*f.fav_games.value = new sliceString(new sliceString(o.favorite.game).str_replace("\n", 'LnLn')).replaceNewLine();
        f.fav_movies.value = new sliceString(new sliceString(o.favorite.movie).str_replace("\n", 'LnLn')).replaceNewLine();
        f.fav_music.value = new sliceString(new sliceString(o.favorite.music).str_replace("\n", 'LnLn')).replaceNewLine();
        f.fav_animes.value = new sliceString(new sliceString(o.favorite.anime).str_replace("\n", 'LnLn')).replaceNewLine();
        f.fav_sports.value = new sliceString(new sliceString(o.favorite.sport).str_replace("\n", 'LnLn')).replaceNewLine();
        f.fav_series.value = new sliceString(new sliceString(o.favorite.tv).str_replace("\n", 'LnLn')).replaceNewLine();
        f.fav_book.value = new sliceString(new sliceString(o.favorite.book).str_replace("\n", 'LnLn')).replaceNewLine();*/

        M.textareaAutoResize($('#signature,#about'));
        //M.textareaAutoResize($('#fav_games,#fav_movies,#fav_music'));
        //M.textareaAutoResize($('#fav_animes,#fav_sports,#fav_series,#fav_book'));

        //$('select').material_select();

        //evitar caracteres especiais e letras
        f.birth_day.onkeypress = function () {
            !(/^[0-9]*$/i).test(f.birth_day.value) ? f.birth_day.value = f.birth_day.value.replace(/[^0-9]/ig, '') : null;
        }
        f.birth_day.onblur = function () {
            !(/^[0-9]*$/i).test(f.birth_day.value) ? f.birth_day.value = f.birth_day.value.replace(/[^0-9]/ig, '') : null;
        }
        f.birth_month.onkeypress = function () {
            !(/^[0-9]*$/i).test(f.birth_month.value) ? f.birth_month.value = f.birth_month.value.replace(/[^0-9]/ig, '') : null;
        }
        f.birth_month.onblur = function () {
            !(/^[0-9]*$/i).test(f.birth_month.value) ? f.birth_month.value = f.birth_month.value.replace(/[^0-9]/ig, '') : null;
        }
        f.birth_year.onkeypress = function () {
            !(/^[0-9]*$/i).test(f.birth_year.value) ? f.birth_year.value = f.birth_year.value.replace(/[^0-9]/ig, '') : null;
        }
        f.birth_year.onblur = function () {
            !(/^[0-9]*$/i).test(f.birth_year.value) ? f.birth_year.value = f.birth_year.value.replace(/[^0-9]/ig, '') : null;
        }


        var bt = document.getElement('btSubmit1');
        bt.obj = this;
        bt.onclick = function () {
            this.obj._sendUpdate();
            return false;
        }

        M.updateTextFields();


        $('select').formSelect();

    };
        
        ///*************

    this._getConfigAvatarHTML = function () {

        var myDate = new Date();
        var s = '';

        s += '<div class="row config-home form_config_user">';
        //****************

        s += '<form name="form_edit_avatar" id="form_edit_avatar" method="post" enctype="multipart/form-data" action="javascript:void(0)">';

        s += '<div class="row"><div class="col s12 user-edit-det-title">Use this form to change your avatar</div></div>';

        s += '<div class="row" id="form-avat-ct">';
        ///********
        s += '<div class="col s12 m2 l2" style="text-align: center;"><img src="' + this.getAvatar() + '?' + myDate.getTime() + '" id="user-avatar" style="max-width:100%; margin-bottom:20px;"></div>';
        ///******** 
        s += '<div class="col s12 m10 l10">';
        s += '<div class="user-edit-det">Shipping from your PC</div>';
        s += '<div class="file-field input-field">';
        s += '<div class="btn">';
        s += '<span>Choose</span>';
        s += '<input type="file" name="avatar_local" id="avatar_local">';
        s += '</div>';
        s += '<div class="file-path-wrapper">';
        s += '<input class="file-path validate" type="text">';
        s += '</div>';
        s += '</div>';
        s += '</div>';
        //***********
        /*s += '<div class=" col s12 m5 l5">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Informar a url remota</div>';
        s += '<div><input id="avatar_remote" name="avatar_remote" type="text" class="validate" placeholder="http://"></div>';
        s += '</div>';
        s += '</div>';*/
        ///*************
        s += '</div>';



        s += '<div class="row">';
        s += '<div class="modal-form-line col s12 m12 l12">';
        s += '<div class="form-check-box">';

        s += '<div class="form-check-box-title form-confirm">';
        s += '<div><strong>Before updating the avatar read carefully: </strong></div>';
        s += '<div>- The avatar will be resized to 130x130 px.</div>';
        s += '<div>- Do not use inappropriate or indecent images, if you do, it may be removed, and your account will be banned.</div>';
        //s += '<div>- Seu avatar não está sendo exibido o corrreto? Clique <a href="javascript:void(0);" id="force-avatar">aqui para corrigir</a>.</div>';
        s += '<div id="avatar-send-text"></div>';
        s += '</div>';

        s += '</div>';
        s += '</div>';
        s += '</div>';


        s += '<div class="row">';
        s += '<div class="form-options">';
        s += '<a class="waves-effect waves-light btn grey darken-1" id="btCancel">Back</a>';
        s += '<a class="waves-effect waves-light btn green darken-1" id="btSubmit2">Update Avatar</a>';
        s += '</div>';
        s += '</div>';

        s += '</form>';

        //****************
        s += '</div>';

        M.updateTextFields();
        new sliceContainer('config-container').write(s);

        var bt = document.getElement('btCancel');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                window.location.href = window.location.protocol + '//' + window.location.host + '/settings/';
            } 
        }


        var f = document.getElement('form_edit_avatar');
        if (!f) {
            return;
        }

        //f.avatar_remote.focus();

        var bt = document.getElement('btSubmit2');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                this.obj._sendAvatarUpdate();
            } 
        }

        var bt = document.getElement('force-avatar');
        if (bt) {
            //bt.obj = this;
            bt.onclick = function () {
                bt.href = window.location.protocol + '//' + window.location.host + '/updateAvatar.php';
                bt.target = '_blank';
            }
        }




    };

    this._sendAvatarUpdate = function () {
        var form = document.getElement('form_edit_avatar');
        if (!form) {
            return;
        }


        if (form.avatar_local.length < 10) { // || form.avatar_remote.length < 10) {
            new sliceToasts().setText("You must enter an avatar.").setStyle('red').show();
            //form.avatar_local.focus;
            return;
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/avatar/update');
        //o.addPostVar('avatar_remote', form.avatar_remote.value);
        o.addPostVar('avatar_local', form.avatar_local, slice.list.request.fieldType.File);
        o.obj = this;
        //o.form = f;
        o.onSubmit = function () {
            new sliceToasts().setText("Sending information. Wait.").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').setTimeOut(5).show();
                //new sliceContainer('form-avat-ct').write('<strong>Ocorreu um erro ao enviar o avatar.</strong><br><span style="color:red">Por segurança você terá que atualizar a página para tentar enviar novamente.</span>');
                //setTimeout('window.location.href = window.location.href', 1000); 
               new sliceUser()._getConfigAvatarHTML();
                return;
            }

            new sliceToasts().setText("Your avatar has been updated.").setStyle('green').setTimeOut(5).show();
            //var s = '';
            //s += '<strong>Seu avatar foi atualizado.</strong><br><span style="color:red">Caso seu avatar não apareça no painel, é devido ao cache de seu navegador. <br>Aguarde até que ele atualize ou faça-o manualmente.</span><br />';
            //new sliceContainer('avatar-send-text').write(s);

            //this.response.details
            this.obj._setAvatar(this.response.details.avatar.path);
            this.obj._store();
            
            var avPath = this.obj.getAvatar() + '?' + new Date().getTime();
            var img = document.getElement('user-avatar');
            if (img) {
                img.src = avPath;
            }
            var img2 = document.getElement('menu-user-avt');
            if (img2) {
                img2.src = avPath;
            }
            new sliceUser()._getConfigAvatarHTML();


        };

        o.send();

    };
    
    ///*************
    
    this._getConfigSenhaHTML = function () {

        var s = '';

        s += '<div class="row config-home form_config_user">';
        //****************

        s += '<form name="form_edit_pass" id="form_edit_pass" method="post" enctype="multipart/form-data" action="javascript:void(0)">';

        s += '<div class="row"><div class="col s12 user-edit-det-title">Update your password using this form</div></div>';

        s += '<div class="row">';

        ///********       
        s += '<div class=" col s12 m4">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Enter new password <br><em>At least 4 characters</em></div>';
        s += '<div><input id="password1" name="password1" type="password" class="validate"></div>';
        s += '</div>';
        s += '</div>';
        ///********       
        s += '<div class=" col s12 m4">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Confirm the new password <br> <em> Confirm correctly </em></div>';
        s += '<div><input id="password2" name="password2" type="password" class="validate"></div>';
        s += '</div>';
        s += '</div>';
        ///******** 
        s += '<div class=" col s12 m4">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Enter the current/old password <br> <em> Your password must be different from the new one </em></div>';
        s += '<div><input id="password3" name="password3" type="password" class="validate"></div>';
        s += '</div>';
        s += '</div>';
        ///*************
        s += '</div>';

        s += '<div class="row">';
        s += '<div class="form-options">';
        s += '<a class="waves-effect waves-light btn grey darken-1" id="btCancel">Back</a>';
        s += '<a class="waves-effect waves-light btn green darken-1" id="btSubmit4">Update Password</a>';
        s += '</div>';
        s += '</div>';

        s += '</form>';

        //****************
        s += '</div>';

        M.updateTextFields();
        new sliceContainer('config-container').write(s);

        var bt = document.getElement('btCancel');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                window.location.href = window.location.protocol + '//' + window.location.host + '/settings/';
            } 
        }

        var f = document.forms['form_edit_pass'];
        if (!f) {
            return;
        }
        var bt = document.getElement('btSubmit4');
        bt.obj = this;
        bt.onclick = function () {
            this.obj._sendPasswordChangeRequest();
        }

    };

    this._sendPasswordChangeRequest = function () {
        var f = document.getElement('form_edit_pass');
        if (!f) {
            return;
        }
        if (f.password1.value.length < 5) {
            new sliceToasts().setText('The password does not appear to be valid.').setStyle('red').show();
            f.password1.focus();
            return false;
        }
        if (f.password1.value != f.password2.value) {
            new sliceToasts().setText('You must confirm the password correctly.').setStyle('red').show();
            f.password2.focus();
            return false;
        }
        if (f.password3.value.length < 5) {
            new sliceToasts().setText('You must enter your current password correctly.').setStyle('red').show();
            f.password3.focus();
            return false;
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/password/change_request');
        o.addPostVar('new_password', f.password1.value).addPostVar('old_password', f.password3.value);
        o.obj = this;
        o.form = f;
        o.onSubmit = function () {
            new sliceToasts().setText("Sending information. Wait.").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                return;
            }
            new sliceToasts().setText("Your password has been successfully modified.").setStyle('green').show();
            new sliceUser()._getConfigSenhaHTML(); 
        };
        o.send();
    };
    
    ///*************

    this._getConfigMailHTML = function () {

        var s = '';
         
        s += '<div class="row config-home form_config_user">';
        //****************

        s += '<form name="form_edit_email" id="form_edit_email" method="post" enctype="multipart/form-data" action="javascript:void(0)">';

        s += '<div class="row"><div class="col s12 user-edit-det-title">Currently your registration email is <b><span id="user-mail-f">' + this.getEmail() + '</spa></b>, however you can request a change. ';
        //s += '<a href="https://redirect.madinfinite.com/forum/topic?92194" target="_blank">More information</a></div></div>';

        s += '<div class="row">';

        ///********       
        s += '<div class=" col s12 m6">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Enter new email</div>';
        s += '<div><input id="new_email" name="new_email" type="text" class="validate"></div>';
        s += '</div>';
        s += '</div>';
        ///********       
        s += '<div class=" col s12 m6">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Confirm the exchange by entering your password</div>';
        s += '<div><input id="user_pass" name="user_pass" type="password" class="validate"></div>';
        s += '</div>';
        s += '</div>';
        ///*************
        s += '</div>';


        s += '<div class="row">';
        s += '<div class="form-options">';
        s += '<a class="waves-effect waves-light btn grey darken-1" id="btCancel">Back</a>';
        s += '<a class="waves-effect waves-light btn green darken-1" id="btSubmit3">Update Email</a>';
        s += '</div>';
        s += '</div>';

        s += '</form>';

        //****************
        s += '</div>';

        M.updateTextFields();
        new sliceContainer('config-container').write(s);

        var bt = document.getElement('btCancel');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                window.location.href = window.location.protocol + '//' + window.location.host + '/settings/';
            } 
        }

        var f = document.forms['form_edit_email'];
        if (!f) {
            return;
        }
        var bt = document.getElement('btSubmit3');
        bt.obj = this;
        bt.onclick = function () {
            this.obj._sendEmailChangeRequest();
        }
        f.new_email.focus();

    };

    this._sendEmailChangeRequest = function () {
        var f = document.getElement('form_edit_email');
        if (!f) {
            return;
        }
        if (f.user_pass.value.length < 5) {
            new sliceToasts().setText('Enter your password to be able to change the email').setStyle('red').show();
            f.user_pass.focus();
            return false;
        }
        if (f.new_email.value.length < 5 || f.new_email.value.indexOf('@') == -1) {
            new sliceToasts().setText('E-mail does not appear to be valid').setStyle('red').show();
            f.new_email.focus();
            return false;
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/email/change_request');
        o.addPostVar('new_email', f.new_email.value);
        o.new_mail = f.new_email.value;
        o.addPostVar('user_pass', f.user_pass.value);
        o.obj = this;
        o.form = f;
        o.onSubmit = function () {
            new sliceToasts().setText("Sending information. Wait.").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                this.obj._setChecked(false)._store();
                return;
            }
            new sliceToasts().setText("Your exchange and email request was sent successfully.").setStyle('green').show();

            this.obj._setChecked(false)._store();
            this.obj._setEmail(this.new_mail);
            //var s = '';
            //s += '<strong>A solicitação de troca de email foi enviada.</strong><br>A mudança pode levar alguns segundos para ser finalizada.';
            //
            new sliceContainer('user-mail-f').write(this.new_mail);
            new sliceUser()._getConfigMailHTML();
        };
        o.send();
    };

    ///*************
    
    this._getConfigDelUserHTML = function () {

        var s = '';
         
        s += '<div class="row config-home form_config_user">';
        //****************

        s += '<form name="form_edit_del" id="form_edit_del" method="post" enctype="multipart/form-data" action="javascript:void(0)">';

        s += '<div class="row"><div class="col s12 user-edit-det-title">When you delete your account, all your data will be deleted along with your profile, photos and other related content.</div></div>';

        s += '<div class="row">';

        ///********       
        s += '<div class=" col s12 m6">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Enter your password to confirm the deletion</div>';
        s += '<div><input id="password" name="password" type="password" class="validate"></div>';
        s += '</div>';
        s += '</div>';
        ///********       
        s += '<div class=" col s12 m6">';
        s += '<div class="input-field">';
        s += '<div class="user-edit-det">Are you sure of the exclusion?</div>';

        s += '<div style="margin-top: 20px;"><label>';
        s += '<input type="checkbox" class="filled-in"  id="user_remove" value="ON" name="user_remove"/>';
        s += '<span>I\'m sure, I WANT TO DELETE my account.</span>';
        s +='</label></div>';
         
        s += '</div>';
        s += '</div>';

        ///*************
        s += '</div>';


        s += '<div class="row">';
        s += '<div class="modal-form-line col s12 m12 l12">';
        s += '<div class="form-check-box">';

        s += '<div class="form-check-box-title form-confirm">';
        s += '<div><strong>Before deleting please read carefully: </strong></div>';
        s += '<div>- All user data will be deleted and there is no way back to this option.</div>';
        s += '<div>- No other user or moderator has access to this option to assist you, so if you are trying to really delete the account, know that all responsibility is yours.</div>';
        s += '</div>';

        s += '</div>';
        s += '</div>';
        s += '</div>';


        s += '<div class="row">';
        s += '<div class="form-options">';
        s += '<a class="waves-effect waves-light btn grey darken-1" id="btCancel">Back</a>';
        s += '<a class="waves-effect waves-light btn red darken-1" id="btSubmit6">Delete account</a>';
        s += '</div>';
        s += '</div>';

        s += '</form>';
               
        //****************
        s += '</div>';

        M.updateTextFields();
        $('select').formSelect();
        new sliceContainer('config-container').write(s);

        var bt = document.getElement('btCancel');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                window.location.href = window.location.protocol + '//' + window.location.host + '/settings/';
            } 
        }
         
        var b = document.getElement('btSubmit6');
        if (b) {
            b.obj = this;
            b.onclick = function () {
                this.obj._sendRemoveRequest();
            }
        }
        

    };

    this._sendRemoveRequest = function () {
        var f = document.getElement('form_edit_del');
        if (!f) {
            return;
        }
        if (f.password.value.length < 5) {           
            new sliceToasts().setText('The password does not appear to be valid.').setStyle('red').show();
            f.password.focus();
            return false;
        }
        if (!f.user_remove.checked) {
            new sliceToasts().setText('You must confirm your intention to remove the account.').setStyle('red').show();
            return false;
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/remove/request');
        o.addPostVar('user_remove', f.user_remove.value).addPostVar('password', f.password.value);
        o.obj = this;
        o.form = f;
        o.onSubmit = function () {
            new sliceToasts().setText("Submitting removal request. Wait!").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                return;
            }           
            new sliceToasts().setText("Your account was removed correctly.").setStyle('green').show();
            new sliceUser().logoff();
        };
        o.send();
    };

    ///*************

    this._initFormSync = function () {
        this._getPessoalData('vinculo'); 
    }

    this._getConfigSyncHTML = function (o) {

        var s = '';

        s += '<div class="row config-home form_config_user">';
        //****************

        s += '<form name="form_edit_sync" id="form_edit_sync" method="post" enctype="multipart/form-data" action="javascript:void(0)">';

        s += '<div class="row"><div class="col s12 user-edit-det-title">Use the options below to link your Space Ero account with other available accounts.</div></div>';

        s += '<div class="row form_services_bts">';

        ///********       
        s += '<div class=" col s12 m6">';
        s += '<div class="input-field" style="text-align: center;" id="g_div_sinc">';
        if (o.links.id_google > 0) {
            s += '<div class="user-edit-det" style="color:#000;"><strong>Google</strong> account is already linked with email: ' + o.links.mail_google + '</div>';
            s += '<div class="user-edit-det"><a href="javascript:void(0)" id="remove_sync_g">Remove Link with Google</a></div>';
        } else {
            ///exibe o form            
            s += '<div id="gSignIn">xxx</div>';
        }
        s += '</div>';
        s += '</div>';
        ///********       
        s += '<div class=" col s12 m6">';
        s += '<div class="input-field" style="text-align: center;" id="f_div_sinc">';
        if (o.links.id_facebook > 0) {
            s += '<div class="user-edit-det" style="color:#000;"><strong>Facebook</strong> account is already linked with email: <strong>' + o.links.mail_facebook + '</strong></div>';
            s += '<div class="user-edit-det"><a href="javascript:void(0)" id="remove_sync_f">Remove Link with Facebook</a></div>';
        } else {
            ///exibe o form            
            s += '<div id="fSignIn">xxx</div>';
        }
        s += '</div>';
        s += '</div>';
        ///*************
        s += '</div>';


        s += '<div class="row" style="margin-top:100px;">';
        s += '<div class="modal-form-line col s12 m12 l12">';
        s += '<div class="form-check-box">';

        s += '<div class="form-check-box-title form-confirm">';
       s+= '<div> <strong> Here are some details about linking accounts: </strong> </div>';
         s+= '<div> - Your registration is more secure and is activated automatically if it hasn\'t already been. </div>';
         s+= '<div> - Your login to the site is much faster and can be done with just one click. </div>';
         s+= '<div> - No information from your social network will be used on Space Ero, only basic data for linking. </div>';
        s += '</div>';

        s += '</div>';
        s += '</div>';
        s += '</div>';


        s += '<div class="row">';
        s += '<div class="form-options">';
        s += '<a class="waves-effect waves-light btn grey darken-1" id="btCancel">Back</a>';
         s += '</div>';
        s += '</div>';


        s += '</form>';

        //****************
        s += '</div>';
         

        M.updateTextFields();        
        new sliceContainer('config-container').write(s);


        var bt = document.getElement('btCancel');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                window.location.href = window.location.protocol + '//' + window.location.host + '/settings/';
            } 
        }


        var bt = document.getElement('remove_sync_g');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                this.obj._sendRemoveSync(1);
            } 
        }
        var bt = document.getElement('remove_sync_f');
        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                this.obj._sendRemoveSync(2);
            }
        }
         
        this._initFacebookBtSync();
        this._renderGoogleSignSync();
       
    };
    
    this._sendRemoveSync = function (id_sync) {
        var f = document.getElement('form_edit_sync');
        if (!f) {
            return;
        }

        var confirma = confirm('Are you sure you want to remove the link?')
        if (!confirma) {
            return;
        }

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/remove/sync');
        o.addPostVar('id_sync', id_sync);
        o.obj = this;
        o.form = f;
        o.tpSync = id_sync;
        o.onSubmit = function () {
           new sliceToasts().setText("Submitting link removal request " + (this.tpSync == 1 ? ' as Google' : ' as Facebook') + ". Wait.").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                return;
            }
            new sliceToasts().setText("Your account unlinked correctly. The whole process can take a few minutes!").setStyle('green').show();

            if (this.tpSync == 1) {
                setTimeout("new sliceContainer('g_div_sinc').write('Your <strong> Google </strong> account was unlinked correctly.');", 500);
            }
            if (this.tpSync == 2) {
                setTimeout("new sliceContainer('f_div_sinc').write('Your <strong> Facebook </strong> account was unlinked correctly.');", 500);
            }

        };
        o.send();
    };

    this._renderGoogleSignSync = function () {
        this._initGoogleSignScript(); 

        var bDiv = document.getElement('gSignIn');
        if (!bDiv) {
            return;
        }

        bDiv.style.display = "block";

        var onSuccess = function onSuccess(googleUser) {
            var profile = googleUser.getBasicProfile();
            gapi.client.load('plus', 'v1', function () {
                var request = gapi.client.plus.people.get({
                    'userId': 'me'
                });
                //apos logar executa este metodo         
                request.execute(function (resp) {
                    window._sliceGlDt = resp;
                    new sliceUser()._initSincyAcc(1);
                });
            });
        }
        var onFailure = function onFailure(error) {
            //new sliceToasts().setText(error).setStyle('red').show();
            console.log("Erro ao fazer o login do Google: " + error)
        }

        gapi.signin2.render('gSignIn', {
            'scope': 'profile email',
            'width': 300,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });

        var b = document.getElement('gSignIn');
        if (b) {
            b.style.margin = "5px auto";
            b.style.width = "300px";
        }

        setTimeout('new sliceUser()._adjustGoogleBT()', 300);
    }

    this._initFacebookBtSync = function () {
        this._initFacebookScript();

        var b = document.getElement('fSignIn');
        if (!b) {
            return;
        }

        //b.className = 'box-social-bt box-facebook-bt';
        b.className = 'z-depth-2';
        b.innerHTML = 'Log in with Facebook';
        b.style.display = "block";
        b.style.margin = "5px auto";
        b.style.width = "300px";

        b.obj = this;
        b.onclick = function () {
            this.obj._onclickFacebookInitSync();
        }

    }
    this._onclickFacebookInitSync = function () {
        if (typeof FB == 'undefined') {
            return;
        }
        FB.login(function (response) {
            if (response.authResponse) {
                console.log('Logou-se na conta do Facebook');
                //seta os dados do usuario 
                var u = new sliceUser();
                u._requestFacebookUserData();
                setTimeout('new sliceUser()._initSincyAcc(2);', 1000);

            } else {               
                new sliceToasts().setText('An error occurred while logging into your Facebook account').setStyle('red').show();
                console.log('Erro f00x3');
            }
        }, { scope: 'email' });
    }

    this._initSincyAcc = function (type) {

        var s = '';
        var id = '';
        var email = '';
        var image = '';

        //atualiza com os dados do google
        if (type == 1) {
            var googleData = this._googleGetUserData();
            if (googleData == null) {
                new sliceToasts().setText('There was an error logging into your Google account').setStyle('red').show();
                console.log('Erro g00x36');
                return;
            }

            id = googleData.id;
            email = googleData.emails[0].value;
            image = googleData.image.url;
        }
        if (type == 2) {

            //atualiza com os dados do face
            var faceData = this._getFacebookUserData();
            if (faceData == null) {
                new sliceToasts().setText('An error occurred while logging into your Facebook account').setStyle('red').show();
                console.log('Erro f00x56');
                return;
            }
            id = faceData.id;
            email = faceData.email;
            image = faceData.picture.data.url;
        }

        var f = document.getElement('form_edit_sync');
        if (!f) {
            return;
        }

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/add/sync');
        o.addPostVar('id_sync', type).addPostVar('id', id).addPostVar('email', email).addPostVar('image', image);
        o.obj = this;
        o.form = f;
        o.tpSync = type;
        o.onSubmit = function () { 
            new sliceToasts().setText("Submitting link request " + (this.tpSync == 1 ? ' as Google' : ' as Facebook') + ". Wait.").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) { 
                new sliceLoader().show(this.getErrorDescription(), slice.list.loader.type.Info, 5);
                return;
            }
            new sliceToasts().setText("Your account linked correctly.").setStyle('green').show();


            if (this.tpSync == 1) {
                new sliceUser()._googleSingOut();
                setTimeout("new sliceContainer('g_div_sinc').write('Your <strong> Google </strong> account was linked correctly.');", 500);
            }
            if (this.tpSync == 2) {
                new sliceUser()._facebookLogout();
                setTimeout("new sliceContainer('f_div_sinc').write('Your <strong> Facebook </strong> account was linked correctly.');", 500);
            }
        };
        o.send();

    }  

    ///*************


    //#endregion

    //#region banimento do usuario

    this._initBanUser = function (idUserView, uName, uAvatar) {
        console.log('11111111111');

        if (!this.isLogged()) {
            new sliceToasts().setText('You are not logged in. Log in to perform this operation.').setStyle('red').show();
            return;
        }
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/ban/reasons');
        o.addPostVar('id_user', idUserView);
        o.obj = this;
        o.idUserView = idUserView;
        o.uName = uName;
        o.uAvatar = uAvatar;
        o.onSubmit = function () {
            new sliceToasts().setText('Getting started. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                return;
            }
            new sliceToasts().close();

            var req = null;
            if (this.response.details != null && this.response.details != undefined) {
                req = this.response.details;
            } 
            this.obj._showBanUserForm(req, this.idUserView, this.uName, this.uAvatar);

        }
        o.send();
    }

    this._showBanUserForm = function (obj, idUserView, userNameView, userImageView) {

        var user = new sliceUser();
        if (!user.isLogged()) {
            //new sliceLoader().show('Somente usuários logados podem remover.', slice.list.loader.type.Info, 5);
            return;
        }

        var modalTitle = 'Banir Usuário';
        var modalSubTitle = 'Opções para banir ' + userNameView;

        var s = '';
        ///*************
        s += '<div class="message-view">';

        s += '<div class="message-view-title">';  //mesage-view-title
        s += '<div class="image"><img src="' + userImageView + '" alt="' + userNameView + '" class="circle z-depth-1"></div>';

        s += '<div class="user" style="top:20px;">';
        s += '<div class="name"><strong>' + userNameView + '</strong> <span><em>ID #' + idUserView + '</em></span></div>';
        //s += '<div class="title">' + msgObj.title + '</div>';
        //s += '<div class="time">Usuário que será banido</div>';
        s += '</div>';

        s += '</div>'; //mesage-view-title


        //// conteudo
        s += '<div class="message-view-content">';
        ///*********

        s += '<form method="post" id="form_ban" name="form_ban" enctype="multipart/form-data">';

        s += '<div class="input-field">';
        s += '<input id="reason" name="reason" type="text" class="validate">';
        s += '<label for="reason">Informe o motivo que o usuário será banido</label>';
        s += '</div>';

        s += '<div class="input-field">';
        //s += '<label>Duração do banimento</label>';
        s += '<select id="duration" name="duration" class="browser-default" >';
        s += '<option value="0" disabled selected>Escolha a duração</option>';
        s += '<option value="1">1 dia</option>';
        s += '<option value="3">3 dias</option>';
        s += '<option value="7">1 semana</option>';
        s += '<option value="14">2 semanas</option>';
        s += '<option value="30">1 mês</option>';
        s += '<option value="60">2 meses</option>';
        s += '<option value="180">Pra largar de ser besta (6 meses)</option>';
        s += '<option value="36000">Eterno!</option>';
        s += '</select>';

        s += '</div>';




        ///*******

        s += '<div class="message-form-msg">';
        s += '<div class="msg-f-line"><span class="red-text">Atenção:</span> O usuário será banido imediatamente, e redeberá uma mensagem pelo e-mail.</div>';
        s += '</div>';

        s += '<div class="ban-user-list">';
        s += '<div class="ban-user-list-title">Banimentos do usuário</div>';
        if (obj == null) {
            s += '<div class="ban-user-list-content"><div class="item-none">O usuário não possui banimento!</div></div>';
        } else {
            ///****************
            s += '<div class="ban-user-list-content">';

            s += '<div class="item item-sub-title">';
            s += '<div class="mod">Moderador</div>';
            s += '<div class="duration">Duração</div>';
            s += '<div class="reason">Motivo</div>';
            s += '<div class="time">Dia</div>';
            s += '</div>';

            ///console.log(obj); 
            var total = obj.item.length;
            for (var n = 0; n != total; n++) {
                var item = obj.item[n];
                s += '<div class="item">';
                s += '<div class="mod">' + item.moderator.name + '</div>';
                s += '<div class="duration">' + item.duration + ' dia(s)</div>';
                s += '<div class="reason">' + item.reason + '</div>';
                s += '<div class="time"><time datetime="' + item.time.rfc + '">' + item.time.rfc + ' [OnlyTime]</time></div>';
                s += '</div>';
            }

            s += '</div>'; //ban-user-list-content
            ///****************
        }
        s += '</div>'; //ban-user-list


        s += '</form>';

        ///*********
        s += '</div>';


        s += '</div>'; //message-view
        ///*************


        new sliceModal()
             .setTitle(modalTitle)
             .setSubTitle(modalSubTitle)
             .setContent(s)
        //.setWidth(310)
        //.setHeight(210)
            .setCloseText("Cancelar")

            .setSendText("Banir")
            .setUseSendButton(true)
        .setSubmitAction(function () { new sliceUser()._sendUserBan(idUserView); })

            .setUseOptions(false)
        //.setOptionsContent(sC)

            .init().show();


        $('select').formSelect();
        M.updateTextFields();
        new sliceTime().update();

    }

    this._sendUserBan = function (idUserBan) {
    
        var form = document.getElement('form_ban');
        if (!form) {
            return;
        }

        if (form.reason.length < 10) {  
            new sliceToasts().setText("Você deve informar o motivo corretamente.").setStyle('red').show();
            //form.avatar_local.focus;
            return;
        }
        if (form.duration.length <= 0) {
            new sliceToasts().setText("Escolha a duração.").setStyle('red').show();
            //form.avatar_local.focus;
            return;
        }

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/send/ban');
        //o.addPostVar('avatar_remote', form.avatar_remote.value);
        o.addPostVar('reason', form.reason.value);
        o.addPostVar('duration', form.duration.value);
        o.addPostVar('id_user', idUserBan);
        o.obj = this;
        //o.form = f;
        o.onSubmit = function () {
            new sliceToasts().setText("Sending information. Wait.").setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').setTimeOut(5).show();
                new sliceUser()._getConfigAvatarHTML();
                return;
            } 

            new sliceToasts().setText("O usuário foi banido corretamente!").setStyle('green').setTimeOut(5).show();

            new sliceModal().close();            
        };

        o.send();

    }

    this._removeUserAvatar = function (idUserView) {

        var confirma = confirm('Are you sure you want to remove the user\'s avatar?')
        if (!confirma) {
            return;
        }

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/avatar/remove');
        o.addPostVar('id_user', idUserView);
        o.obj = this;
        o.onSubmit = function () {
             new sliceToasts().setText("Submitting removal request. Wait.").setTimeOut(30).setStyle('normal').show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) { 
                new sliceToasts().setText(this.getErrorDescription()).setStyle('red').show();
                return;
            }
            new sliceToasts().setText("The user's avatar was removed correctly!").setStyle('normal').show();
            
            setTimeout("window.location.href = window.location.href", 1000); 

             
        };
        o.send();

    }
    //#endregion
    
    //#region recupera informacoes atualizadas

    this._removeStatusCount = function (type) {
        var items = this._getUserStatus();
        
        switch (type) {
            case 'messages':
                if (items.messages.unread > 0) {
                    items.messages.unread = items.messages.unread - 1;
                }
                break; 
            case 'friends':
                if (items.friends.request > 0) {
                    items.friends.request = items.friends.request - 1;
                }
                break;
        } 
        
        this._setUserStatus(items);
    }

    this._getUserLastStatus = function () {
        if (!this.isLogged()) {
            ///new sliceToasts().setText('Você não está logado!').setStyle('red').show();
            console.log('Você não está logado!');
            return;
        }

        var items = this._getUserStatus();
        if (items != undefined && items.requestDate != undefined && new Date(items.requestDate) >= new Date() ) {
            console.log('não chegou o momento de atualizar: ' + items.requestDate);
            this._adjustMsgs();
            return;
        }

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/user/last/updates');
        o.obj = this;
        o.onSubmit = function () {
            console.log("Recuperando dados do usuário...");
            //new sliceToasts().setText('Recuperando dados do usuário.').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {
                //new sliceToasts().setText('Não foi possivel recuperar os seus dados. ' + this.getErrorDescription()).setStyle('red').show();
                console.log('ocorreu um erro ao recuperar o status: ' + this.getErrorDescription());
                return;
            }

            var st = this.response.details;

            if (st.is_banned) {
                new sliceToasts().setText('You are banned!').setStyle('red').show();
                setTimeout('new sliceUser().logoff();', 3000);
                return;
            }

            st.requestDate = new sliceBasics().getDateAddMinutes(30);

            this.obj._setUserStatus(st);
            this.obj._store();
            this.obj._adjustMsgs();

        }
        o.send();
    };

    this._alertMsg = function () {

        var items = this._getUserStatus();
        if (items == null || items == undefined) {
            return;
        }
        if (items.friends.request == 0 && items.messages.unread == 0) {
            console.log('para aqui...');
            return;
        }

        var d = null;
        var style = 'material-icons ';

        d = document.getElement('ico-m-friend-1');
        if (d && items.friends.request > 0) {
            if (d.className == 'material-icons ') {
                d.className = 'material-icons  red-text';
            } else {
                d.className = 'material-icons ';
            }
        }
        d = document.getElement('ico-m-friend-2');
        if (d && items.friends.request > 0) {
            if (d.className == 'material-icons ') {
                d.className = 'material-icons  red-text';
            } else {
                d.className = 'material-icons ';
            }
        }

        ///***********

        d = document.getElement('ico-m-mail-1');
        if (d && items.messages.unread > 0) {
            if (d.className == 'material-icons ') {
                d.className = 'material-icons  indigo-text';
            } else {
                d.className = 'material-icons ';
            }
        }
        d = document.getElement('ico-m-mail-2');
        if (d && items.messages.unread > 0) {
            if (d.className == 'material-icons ') {
                d.className = 'material-icons  indigo-text';
            } else {
                d.className = 'material-icons ';
            }
        }
        
        ////contagens no menu lateral

        if (items.friends.request > 0) {
            new sliceContainer('ico-mf-friend').write('<span class="new badge indigo" data-badge-caption="' + (items.friends.request == 1 ? ' novo' : ' novos') + '">' + items.friends.request + '</span>');
        } else {
            new sliceContainer('ico-mf-friend').write('');
        }
         
        if (items.messages.unread > 0) {
            new sliceContainer('ico-mf-mail').write('<span class="new badge indigo" data-badge-caption="' + (items.messages.unread == 1 ? ' nova' : ' novas') + '">' + items.messages.unread + '</span>');
        } else {
            new sliceContainer('ico-mf-mail').write('');
        }

        ///***********


        ///faz a troca de stye
        ////setTimeout('new sliceUser()._alertMsg();', 2000);
    }
        
    this._adjustMsgs = function () {

        var items = this._getUserStatus();
        if (items == null || items == undefined) {
            return;
        }

        var d = null;

        if (items.friends.request > 0 || items.messages.unread > 0) {
            
            this._alertMsg();                        
        }


    }

  
    //#endregion 
    
    //#endregion
    //#region propriedades públicas

    //#region gets
    this.getId = function () {
        ///<summary>Retorna a id do usuário</summary>
        /// <returns type="Number">Returna a id do usuário ou 0 se ele não estiver logado</returns>
        return this._id;
    };
    this.getKey = function () {
        ///<summary>Se o usuário estiver logado, retorna a chave</summary>
        /// <returns type="String">A chave que identifica o usuário</returns>
        return this._key;
    };
    this.getName = function () {
        ///<summary>Retorna o nome do usuário</summary>
        /// <returns type="String">O nome do usuário</returns>
        return this._name;
    };
    this.getUserLogin = function(){
        return this._userlogin;
    }
    this.getURL = function () {
        ///<summary>Retorna a url do usuário</summary>
        /// <returns type="String">O url do usuário</returns>
        return this._url;
    };
    this.getAvatar = function () {
        ///<summary>Retorna o avatar do usuário</summary>
        /// <returns type="String">O avatar do usuário</returns>
        return this._avatar;
    };
    this.getEmail = function () {
        ///<summary>Retorna o email do usuário</summary>
        /// <returns type="String">O avatar do usuário</returns>
        return this._email;
    };
    this.isLogged = function () {
        ///<summary>Retorna se o usuário está ou não logado. Todavia não faz checagem da key.</summary>
        /// <returns type="Boolean"></returns>
        return this.getId() > 0;
    };
    this.isModerator = function () {
        ///<summary>Retorna se o usuário tem direitos de moderador.</summary>
        /// <returns type="Boolean"></returns>
        return this._moderator;
    };
    this.isAdmin = function () {
        ///<summary>Retorna se o usuário tem direitos administradivos.</summary>
        /// <returns type="Boolean"></returns>
        return this._admin;
    };
    this.logoff = function () {
        this._logoff();
    };
    //#endregion

    this.init = function () {
        if (this.isLogged()) {
            //opcoes para logados
            this._login_painel();
            //this._getUserLastStatus();
            //console.log("o usuario esta logado")
            return;
        }
        ///exibe as opções quando não está logado
        //this._blockContent();
        this._login_form();

    };

    this.initPerfil = function (idUserView, urlPerfil) {

        if (!this.isLogged()) {
            ///nao inicia se nao estiver logado
            return;
        }

        //user-options-container

        var s = '';
        s += '<a class="dropdown-trigger waves-effect waves-light btn-small indigo lighten-2" data-target="dropdown_opt_up"><i class="material-icons left">more_horiz</i>Options</a>';
        //s += '<a class="waves-effect waves-light btn-small"><i class="material-icons left">person_add</i>Adicionar como amigo</a>';
        //s += '<a class="waves-effect waves-light btn-small"><i class="material-icons left">info</i>Banir usuário</a>';

        s += '<ul id="dropdown_opt_up" class="dropdown-content btn-uperfil-options-menu">';

        if (idUserView != this.getId()) {

            if (!new sliceFriends().isFriend(idUserView)) {
                s += '<li><a href="javascript:void(0);" id="bt-friend-request"><i class="material-icons left green-text">person_add</i>Adicionar aos amigos</a></li>';
            } else {
                s += '<li><a href="javascript:void(0);" id="bt-friend-remove"><i class="material-icons left red-text">remove_circle</i>Desfazer amizade</a></li>';
            }
            s += '<li class="divider" tabindex="-1"></li>';

            s += '<li><a href="' + urlPerfil + '" ><i class="material-icons left">person_pin</i>Perfil</a></li>';
            s += '<li><a href="' + urlPerfil + 'sobre/" ><i class="material-icons left">help_outline</i>Sobre</a></li>';
            s += '<li><a href="' + urlPerfil + 'amigos/" ><i class="material-icons left">people</i>Amigos</a></li>';

            //s += '<li class="divider" tabindex="-1"></li>';

            s += '<li><a href="javascript:void(0);" id="bt-init-send-mail"><i class="material-icons left">mail</i>Enviar mensagem</a></li>';

            //s += '<li><a href="javascript:void(0);"><i class="material-icons left">do_not_disturb</i>Ignorar</a></li>';

            if (this.isAdmin() || this.isModerator()) {
                s += '<li class="divider" tabindex="-1"></li>';
                s += '<li><a href="javascript:void(0);" id="bt-init-ban-user"><i class="material-icons left red-text">info</i>Banir usuário</a></li>';
                s += '<li><a href="javascript:void(0);" id="bt-remove-avatar"><i class="material-icons left black-text">remove_circle_outline</i>Remover Avatar</a></li>';
            }

        } else {

            s += '<li><a href="' + urlPerfil + '" ><i class="material-icons left">person_pin</i>Perfil</a></li>';
            s += '<li><a href="' + urlPerfil + 'sobre/" ><i class="material-icons left">help_outline</i>Sobre</a></li>';
            s += '<li><a href="' + urlPerfil + 'amigos/" ><i class="material-icons left">people</i>Amigos</a></li>';

            //s += '<li class="divider" tabindex="-1"></li>';

            s += '<li><a href="' + this._getMessageHomeLink() + '" id="bt-msg-view"><i class="material-icons left">mail</i>Mensagem</a></li>';

            s += '<li class="divider" tabindex="-1"></li>';

            s += '<li><a href="' + this._getConfigLink('') + '" id="bt-msg-view"><i class="material-icons left">settings</i>Configurações</a></li>';
            //s += '<li><a href="javascript:void(0);"><i class="material-icons left">do_not_disturb</i>Ignorar</a></li>';

            //s += '<li><a href="javascript:void(0);" id="bt-remove-avatar"><i class="material-icons left">remove_circle_outline</i>Remover Avatar</a></li>';
        }


        s += '</ul>';

        var uName = 'Usuário #' + idUserView;
        var d = document.getElement('user-perfil-name');
        if (d) {
            uName = d.innerHTML;
        }
        var uAvatar = '';
        var d = document.getElement('user-perfil-avatar');
        if (d) {
            uAvatar = d.src;
        }

        new sliceContainer('user-perfil-options-container').write(s).show();

        var d = document.getElement('bt-init-send-mail');
        if (d) {
            d.obj = this;
            d.idUserView = idUserView;
            d.uName = uName;
            d.uAvatar = uAvatar;
            d.onclick = function () {
                new sliceMessages().initSendMail(this.idUserView, this.uName, this.uAvatar);
            }
        }

        var d = document.getElement('bt-init-ban-user');
        if (d) {
            d.obj = this;
            d.idUserView = idUserView;
            d.uName = uName;
            d.uAvatar = uAvatar;
            d.onclick = function () {
                this.obj._initBanUser(this.idUserView, this.uName, this.uAvatar);
            }
        }

        var d = document.getElement('bt-remove-avatar');
        if (d) {
            d.obj = this;
            d.idUserView = idUserView;
            d.onclick = function () {
                this.obj._removeUserAvatar(this.idUserView);
            }
        }
        var d = document.getElement('bt-friend-request');
        if (d) {
            d.obj = this;
            d.idUserView = idUserView;
            d.onclick = function () {
                new sliceFriends()._sendFriendRequest(this.idUserView);
            }
        }

        var d = document.getElement('bt-friend-remove');
        if (d) {
            d.obj = this;
            d.idUserView = idUserView;
            d.onclick = function () {
                new sliceFriends()._sendFriendRemove(0,this.idUserView);                 
            }
        }
                
        $('.dropdown-trigger').dropdown();

    }
    
    this.initConfig = function (type) {

        if (!this.isLogged()) {
            new sliceContainer('loading-div').write('You are not logged in to access this page!');
            //new sliceContainer('list-btn-div').hide('');
            return;
        }


        var s = '';


        switch (type) {

            case 0:
                this._getHomeConfigHTML();
                break;
            case 1:
                this._getConfigPerfilHTML();
                break;
            case 2:
                this._getConfigAvatarHTML();
                break;
            case 3:
                this._getConfigSenhaHTML();
                break;
            case 4:
                this._getConfigMailHTML();
                break;
            case 5:
                this._getConfigDelUserHTML();
                break;
            case 6:
                this._initFormSync();
                break;

            default:
                new sliceContainer('loading-div').write("Couldn't find settings.");
        }



        //new sliceContainer('list-btn-div').hide('');

    }
     
        //#endregion
        //#region construtor
        //this._setStoreMode(new sliceStorage(slice.list.storage.method.Local).isSupported() ? 'storage' : 'cookie');
        this._setStoreMode('both');
        this._load();
        this._store();
        //#endregion
}
 //#endregion
 
 
//#region sliceTags
function sliceTags(item,itemtype) {
    //#region proprieades privadas
    this._lengthLimit = 0;  //0 > sem limite
    this._item = 0;
    this._itemtype = 0;
    this._relatetLimit = 15;  
    this._setItem = function (item) {
        this._item = item;
    };
    this._getItem = function () {
        return this._item;
    };
    this._setItemType = function (item) {
        this._item = itemtype;
    };
    this._getItemType = function () {
        return this._itemtype;
    };        
    this._setRelatetLimit = function (i) {
        this._relatetLimit = i;
    };
    this._getRelatetLimit = function () {
        return this._relatetLimit;
    };
    this._MountRelatedItens = function () {
        var r = document.getElementById('cad').itens_list;
        var x = document.getElementById('itens_related');
        if (!x || !r) {
            return;
        }

        if (r.options.length < 1) {
            x.value = '';
            return;
        }
        if (r.options.length == 1) {
            x.value = '';
        }
        var s = '';
        var a = new Array;
        for (var i = 0; i < r.options.length; i++) {
            a.push(r.options[i].value);
        }
        x.value = a.toString();

    };

    
    //#endregion
    //#region propriedades públicas     
    this.Add = function () {
        var x = document.getElementById('cad').select_itens;
        var r = document.getElementById('cad').itens_list;      
        if (!x && !r) {
            return;
        }

        if (x.selectedIndex < 0) {
            alert('Selecione o item a ser relacionado');
            return;
        }

        var i = x.selectedIndex
        var v = x.options[i].value;
        var t = x.options[i].text;
        //Nao listado
        if (i < 0) {
            return;
        }

        if (r.options.length >= this._getRelatetLimit()) {
            alert('Você pode relacionar no máximo ' + this._getRelatetLimit() + ' itens');
            return;
        }

        var nV = v; //id da tag 

        for (var i = 0; i < r.options.length; i++) {
            if (r.options[i].value == nV) {
                alert('O item já foi relacionado');
                return;
            }
        }
        
        r.options[r.options.length] = new Option(t, nV, false, false);

        var bt = document.getElementById('cat_bt_item_' + nV);
        if (bt) {
            bt.className = 'admCatBT admCatBTSelect';
        }

        this._MountRelatedItens();

    };
    this.Remove = function () {
        var r = document.getElementById('cad').itens_list;
        if (!r && r.selectedIndex < 0) {
            return;
        }


        var bt = document.getElementById('cat_bt_item_' + r.options[r.selectedIndex].value);
        if (bt) {
            bt.className = 'admCatBT'; 
        }

        r.options[r.selectedIndex] = null;
        this._MountRelatedItens();
    };

    this.updateBT = function (id) {
        var bt = document.getElementById('cat_bt_item_' + id);
        if (!bt) {
            return;
        } 
        bt.className = 'admCatBT admCatBTSelect';
    }

    this.AddByBT = function (id, title) {
        var r = document.getElementById('cad').itens_list;
        var bt = document.getElementById('cat_bt_item_' + id);
        if (!r || !bt) {
            return;
        }

        if (bt.className == 'admCatBT admCatBTSelect') {
            console.log('aqui...');
            this.removeByBT(id);
            return;
        }

        if (r.options.length >= this._getRelatetLimit()) {
            alert('Você pode relacionar no máximo ' + this._getRelatetLimit() + ' itens');
            return;
        }

        var nV = id; //id da tag 

        for (var i = 0; i < r.options.length; i++) {
            if (r.options[i].value == nV) {
                alert('O item já foi relacionado');
                return;
            }
        }

        r.options[r.options.length] = new Option(title, id, false, false);

        if (bt.className == 'admCatBT') {
            bt.className = 'admCatBT admCatBTSelect';
        } else {
            bt.className = 'admCatBT'
        }




    };


    this.removeByBT = function (id) {
        var r = document.getElementById('cad').itens_list;
        var bt = document.getElementById('cat_bt_item_' + id);
        if (!r) {
            return;
        }

        var len1 = r.options.length;

        for (i = 0; i < len1; i++) {
            if (r.options[i].value == id) {
                r.options[i] = null;
                break;
            }
        }

        bt.className = 'admCatBT';
        this._MountRelatedItens();
    };

    //#endregion
    //#region construtor
     

    //#endregion
}
//#endregion sliceTags


//#region sliceTheme
function sliceTheme() {
    //#region slice que controla o menu
    this._style = '';
    this._theme = '';   

    this._setStyle = function (i) {
        this._style = i;
        return this;
    };
    this._getStyle = function () {
        return this._style;
    };

    this._setTheme = function (i) {
        this._theme = i;
        return this;
    };

    this._getTheme = function () {
        return this._theme;
    };

    this._store = function () {
        window._sliceTheme = this;
        
        var o = new Object();
        o = {
           theme: this._getTheme()            
        }
        var storage = new sliceStorage(slice.list.storage.method.Local);
        storage.setField('slice_theme', o);
    };

    this._load = function () {
        var storage = new sliceStorage(slice.list.storage.method.Local);
        if (storage.issetField('slice_theme')) {
            var o = storage.getField('slice_theme');
            this._setTheme(o.theme);
         }

        var o = window._sliceTheme;
        if (!o) {
            return;
        }
        this._setStyle(o._getStyle());
        this._setTheme(o._getTheme());
    };

    this._initThemeBt = function(){

    	var bt = document.getElement('menu-light');
        if (!bt) {             
        	return this;             
        }

        console.log('init toogle theme');

        var theme = this._getTheme();
        if (theme == '' || theme == 'clean_theme'){
        	bt.innerHTML = '<i class="material-icons">brightness_3</i>';
        }else{
        	bt.innerHTML = '<i class="material-icons">wb_sunny</i>';
        }

        if (bt) {
            bt.obj = this;
            bt.onclick = function () {
                this.obj.toogleTheme();
            }
        }
    }

    this.toogleTheme = function (){

    	var bt = document.getElement('menu-light');
        if (!bt) {             
        	return this;             
        }

    	var theme = this._getTheme();
    	console.log('toogle theme');
    	console.log(theme);

        if (theme == '' || theme == 'clean_theme'){
        	this.setTheme('dark_theme');
        	bt.innerHTML = '<i class="material-icons">wb_sunny</i>';        	
        }else{
        	this.setTheme('clean_theme');
           	bt.innerHTML = '<i class="material-icons">brightness_3</i>';
        }    	       
    }

    this.changeTheme = function () {

        var theme = this._getTheme(); 
        var body = document.getElement('body'); //navbar-fixed
        if (!body || !theme ) {
            return;
        }

        this._setTheme(theme);
        body.className = theme;  
        new sliceExternalScp().reloadDisqus(); 
    }

    this.clearTheme = function () {
        var body = document.getElement('body'); //navbar-fixed
        if (!body) {
            return;
        }
        this._setTheme('');        
        body.className = '';
        this._store(); 
    } 

    this.setTheme = function (theme) {
        if (!theme) {
            return this;
        }
        this._setTheme(theme);
        this._store();
        this.changeTheme();
    }

     this.init = function () {
        this._load();
        this._initThemeBt();
        this.changeTheme();
    }
    //#endregion
    
    //#region construtor
    this._load();
    this._store();
    //#endregion
};
//#endregion


//#region sliceLayout
function sliceLayout() {
    //#region proprieades privadas
    this._id = null;
       
    this._store = function () {
        window._sliceLayout = this;
    };
    this._load = function () {
        var o = window._sliceLayout;
        if (!o) {
            return;
        }
        this.setId(o.getId());
    };
    
    //#endregion
    //#region propriedades públicas
    this.setId = function (i) {
        this._id = i;
        //this._store();
        return this;
    };
    this.getId = function () {
        return this._id;
    };



    this.viewNav = function(nView){
        var navC = document.getElementsByClassName('nav-content');
        if (navC.length <= 0) {
            return;
        }
 
        //console.log("trocou o menu"); 

        var total = navC.length;
        for (var n = 0; n < total; n++) {
            if (navC[n] != undefined) {                 
                navC[n].className = "nav-content nav-ct-" + n +"" + ( n != nView ? " hide" : '');
            } 
        }

        var aURLs = document.getElementsByClassName('nav-item');        
        if (aURLs.length <= 0) {
            return;
        }
        var total = aURLs.length;
        for (var n = 0; n < total; n++) {             
            if (aURLs[n] != undefined) {

                //aURLs[n].className = "nav-item" + (nView==n ? " active" : '');

                if (aURLs[n].classList.contains('active')){
                    aURLs[n].classList.remove("active");
                }
                if (nView==n){
                    aURLs[n].classList.add("active");
                }
                ////*************
                /*if (aURLs[n].classList.contains('hide')){
                    aURLs[n].classList.remove("hide");
                    var sInput = document.getElementById("search-input");
                    if (sInput){
                        sInput.value = '';   
                        sInput.focus();
                    }
                }else{
                    aURLs[n].classList.add("hide");
                }*/

                ///*************
            }
        }

    }
    this.initNav = function () {
        var aURLs = document.getElementsByClassName('nav-item');        
        if (aURLs.length <= 0) {
            return;
        }

        /////deixa somente o primeiro item visivel
        this.viewNav(0);
        //////////////////////


        //console.log(aURLs); 

        var total = aURLs.length;
        for (var n = 0; n < total; n++) {             
            if (aURLs[n] != undefined || aURLs[n].hasAttribute('nav-content')) {

                //aURLs[n].href="javascript:void(0);";
                aURLs[n].obj = this;
                aURLs[n].onclick = function () {
                    this.obj.viewNav(this.getAttribute('nav-content'));
                }
            }
        }
    }

    /**
    metodo para fixar a navbar no topo ao rolar a página
    */
    this.initScrollMenu = function(){

        var navbar = document.getElementById("navbar");
        if (navbar){ 
            var sticky = navbar.offsetTop; 

            window.addEventListener("scroll", function(){
            
                if (window.pageYOffset >= sticky) {
                    navbar.classList.add("nav-sticky");                    
                  } else {
                    navbar.classList.remove("nav-sticky");                    
                  }

            });
        }
        var sticky = navbar.offsetTop;
    }

    this.initSearchBT = function(){

        var bt = document.getElementById("search-bt");
        if (!bt){
            return;
        }                

        bt.onclick = function () {
            var searchDiv = document.getElementById("nav-search");
            if (searchDiv){
                if (searchDiv.classList.contains('hide')){
                    searchDiv.classList.remove("hide");
                    var sInput = document.getElementById("search-input");
                    if (sInput){
                        sInput.value = '';   
                        sInput.focus();
                    }
                }else{
                    searchDiv.classList.add("hide");
                }
            }

            var div = document.getElementById("navbar");
            if (div){
                if (div.classList.contains('show-search')){
                    div.classList.remove("show-search");                    
                }else{
                    div.classList.add("show-search");
                }
            }
        };


         var inputEle = document.getElementById("search-input");
         if (inputEle){   
                    
            this.obj = this;          
            inputEle.addEventListener('keyup', function(e){
              var key = e.which || e.keyCode;
              if (key == 13) { // codigo da tecla enter                 
                //alert('Procurando por: ' +this.value);
                new sliceLayout().initSearch();
              }
            });
        };

        var btGo = document.getElementById("search-bt-go");
        if (btGo){
            btGo.obj = this;
            btGo.onclick = function () {
                new sliceLayout().initSearch();
            }
        }
    }

    this.initSearch = function(){
        var inputEle = document.getElementById("search-input");
        if (inputEle){  
            if (inputEle.value.length > 0){
                ///alert('Procurando por: ' +inputEle.value);    
                window.location = window.location.protocol + '//' + window.location.host + '/posts/?q='+inputEle.value;
            }
        }
    }
    //#metodo inicial
    this.init = function () {

        this.initScrollMenu();
        this.initSearchBT();
        this.initNav(); 

    }    

    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
//#endregion sliceTags


//#region sliceSharer
function sliceSharer() {
    //#region propriedades privadas

    /// https://ellisonleao.github.io/sharer.js/

    this._id = 0;
    this._title = '';
    this._url = '';
    this._keyworks = '';
    this._type = '';

    this._description = '';
    this._image = '';

    this._store = function () {
        window._sliceShare = this;
    };
    this._load = function () {
        var o = window._sliceShare;
        if (!o) {
            return;
        }
    };

    this.isMobile = function () {
        try { document.createEvent("TouchEvent"); return true; }
        catch (e) { return false; }
    }

    //#endregion
    //#region propriedades publicas

    this.init = function () {
        this.initSharerBig();
        this.initSharerHeader();
    }


    this.initSharerBig = function () {
        var d = document.getElement('sharer_content_box_'+this.getID());
        if (!d) {
            return;
        }

        var s = '';

        s += '<a  title="Share on your Social Networks" class="btn-sharer btn-sharer ">Share</a>';

        ///facebook
        s += '<a  title="Share on Facebook" class="btn-sharer btn-sharer-facebook " data-sharer="facebook" data-hashtag="' + this.getType() + '" data-url="' + this.getURL() + '">Facebook</a>';

        ///twitter
        s += '<a  title="Share on Twitter" class="btn-sharer btn-sharer-twitter " data-via="pganimesegames" data-sharer="twitter" data-title="' + this.getTitle() + '" data-hashtags="' + this.getKeyworks() + '" data-url="' + this.getURL() + '">Twitter</a>';


        ///whatsapp
        if (this.isMobile()) {
            s += '<a  title="Share on WhatsApp" class="btn-sharer btn-sharer-whatsapp " data-sharer="whatsapp" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '">Whatsapp</a>';
        } else {
            s += '<a  title="Share on WhatsApp" class="btn-sharer btn-sharer-whatsapp-web " data-sharer="whatsapp" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '" data-web="true">Whatsapp</a>';
        }

        //pinterest
        s += '<a  title="Share on Pinterest" class="btn-sharer btn-sharer-pinterest " data-sharer="pinterest" data-url="' + this.getURL() + '" data-image="' + this.getImage() + '" data-description="' + this.getTitle() + ' - ' + this.getDescription() + '">Pinterest</a>';

        //tumblr
        s += '<a  title="Share on Tumblr" class="btn-sharer btn-sharer-tumblr " data-sharer="tumblr" data-caption="' + this.getDescription() + '" data-title="' + this.getTitle() + '" data-tags="' + this.getKeyworks() + '" data-url="' + this.getURL() + '">Tumblr</a>';

        //flipboard
        s += '<a  title="Share on Flipboard" class="btn-sharer btn-sharer-flipboard " data-sharer="flipboard" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '">Flipboard</a>';

        //pocket
        s += '<a  title="Share on Pocket" class="btn-sharer btn-sharer-pocket " data-sharer="pocket" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '">Pocket</a>';

        //blogger
        //s += '<a  title="Share on Blogger" class="btn-sharer btn-sharer-blogger " data-sharer="blogger" data-url="' + this.getURL() + '" data-description="' + this.getTitle() + '">Blogger</a>';


        new sliceContainer('sharer_content_box_' + this.getID()).write(s);

        if (window.Sharer != undefined) {
            window.Sharer.init();
        }
    };

    this.initSharerHeader = function () {
        var d = document.getElement('social-button-header-content');
        if (!d) {
            return;
        }

        var s = '';

        s += '<a  title="Share on your Social Networks" class="social-bth social-bth-sharer ">Share</a>';

        ///facebook
        s += '<a  title="Share on Facebook" class="social-bth social-bth-facebook " data-sharer="facebook" data-hashtag="' + this.getType() + '" data-url="' + this.getURL() + '">Facebook</a>';

        ///twitter
        s += '<a  title="Share on Twitter" class="social-bth social-bth-twitter " data-via="pganimesegames" data-sharer="twitter" data-title="' + this.getTitle() + '" data-hashtags="' + this.getKeyworks() + '" data-url="' + this.getURL() + '">Twitter</a>';


        ///whatsapp
        if (this.isMobile()) {
            s += '<a  title="Share on WhatsApp" class="social-bth social-bth-whatsapp " data-sharer="whatsapp" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '">Whatsapp</a>';
        } else {
            s += '<a  title="Share on WhatsApp" class="social-bth social-bth-whatsapp-web " data-sharer="whatsapp" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '" data-web="true">Whatsapp</a>';
        }

        //pinterest
        s += '<a  title="Share on Pinterest" class="social-bth social-bth-pinterest " data-sharer="pinterest" data-url="' + this.getURL() + '" data-image="' + this.getImage() + '" data-description="' + this.getTitle() + ' - ' + this.getDescription() + '">Pinterest</a>';

        //tumblr
        s += '<a  title="Share on Tumblr" class="social-bth social-bth-tumblr " data-sharer="tumblr" data-caption="' + this.getDescription() + '" data-title="' + this.getTitle() + '" data-tags="' + this.getKeyworks() + '" data-url="' + this.getURL() + '">Tumblr</a>';

        //flipboard
        s += '<a  title="Share on Flipboard" class="social-bth social-bth-flipboard " data-sharer="flipboard" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '">Flipboard</a>';

        //pocket
        s += '<a  title="Share on Pocket" class="social-bth social-bth-pocket " data-sharer="pocket" data-title="' + this.getTitle() + '" data-url="' + this.getURL() + '">Pocket</a>';

        //blogger
        //s += '<a  title="Share on Blogger" class="social-bth social-bth-blogger " data-sharer="blogger" data-url="' + this.getURL() + '" data-description="' + this.getTitle() + '">Blogger</a>';


        new sliceContainer('social-button-header-content').write(s);

        if (window.Sharer != undefined) {
            window.Sharer.init();
        }
    };

    this.setID = function (i) {
        this._id = i;
        return this;
    };
    this.getID = function () {
        return this._id;
    };

    this.setTitle = function (i) {
        this._title = i;
        return this;
    };
    this.getTitle = function () {
        return this._title;
    };

    this.setURL = function (i) {
        this._url = i;
        return this;
    };
    this.getURL = function () {
        return this._url;
    };

    this.setKeyworks = function (i) {
        this._keyworks = i;
        return this;
    };
    this.getKeyworks = function () {
        return this._keyworks;
    };

    this.setDescription = function (i) {
        this._description = i;
        return this;
    };
    this.getDescription = function () {
        return this._description;
    };

    this.setType = function (i) {
        this._type = i;
        return this;
    };
    this.getType = function () {
        return this._type;
    };

    this.setImage = function (i) {
        this._image = i;
        return this;
    };
    this.getImage = function () {
        return this._image;
    };


    //#endregion 
    //#region construtor
    this._load();

    //#endregion
}
//#endregion
 

//#region sliceExternalScp
function sliceExternalScp() {
    //#region proprieades privadas
    this._status = slice.list.interation.status.None; //define se esta sendo enviado
    this._adult = null;
    this._format = null;
    this._containerId = null;

    this._countAd = 10;

    this._area = null;
    
    this._idPage = '';
    this._pageURL = '';

    this._setIdPage = function (i) {
        this._idPage = i;
        this._store();
        return this;
    };
    this._getIdPage = function () {
        return this._idPage;
    };
     this._setPageURL = function (i) {
        this._pageURL = i;
        this._store();
        return this;
    };
    this._getPageURL = function () {
        return this._pageURL;
    };
    

    this._setCountAd = function (i) {
        this._countAd = i;
        this._store();
        return this;
    };
    this._getCountAd = function () {
        return this._countAd;
    };

    this._setStatus = function (status) {
        this._status = status;
        return this;
    };
    this._getStatus = function () {
        return this._status;
    };

    this.setIsAdult = function (i) {
        this._adult = i;
        return this;
    };
    this._isAdult = function () {
        return this._adult;
    };

    this.setFormat = function (i) {
        this._format = i;
        return this;
    };
    this._getFormat = function () {
        return this._format;
    };

    this.setContainerId = function (i) {
        this._containerId = i;
        return this;
    };
    this._getContainerId = function () {
        return this._containerId;
    };

    this._store = function () {
        window._sliceExternalScp = this;
    };
    this._load = function () {
        var o = window._sliceExternalScp;
        if (!o) {
            return;
        }

        this.setArea(o.getArea());
        this._setCountAd(o._getCountAd());
        
        this._setIdPage(o._getIdPage());
        this._setPageURL(o._getPageURL());   
    };

    this._rand = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    
    this._initDivScript = function () {
        var div = document.getElement("body");
        if (!div) {
            return;
        }
        var d2 = document.getElement("external_script_itens");
        if (!d2) {
            var d = document.createElement('div');
            d.style.display = 'none';
            d.id = 'external_script_itens';
            div.appendChild(d);
        }
    }

    this._initAnalytics = function () {
        this._initDivScript();
        var div = document.getElement("external_script_itens");
        if (!div) {
            return;
        }

        new sliceContainer('google_analytics').remove();
        
        // analystic ****************         
        var scp = document.createElement('script');
        scp.src = "https://www.googletagmanager.com/gtag/js?id=UA-105587306-1";
        //scp.innerHTML = s;
        scp.id = 'google_analytics';
        div.appendChild(scp); 
                        
		window.dataLayer = window.dataLayer || []; 
        function gtag(){
            dataLayer.push(arguments);
        } 
        gtag('js', new Date()); 
        gtag('config', 'UA-105587306-1'); 
    }

    this._initAmung = function () {
        this._initDivScript();
        var div = document.getElement("external_script_itens");
        if (!div) {
            return;
        }

        new sliceContainer('_wau2ew').remove();

        ///  amung  ****************
        var s = '';
        s += 'var _wau = _wau || []; _wau.push(["dynamic", "fzf8orj2ctte", "2ew", "c4302bffffff", "small"]);';

        var scp = document.createElement('script');
        scp.type = 'text/javascript';
        scp.innerHTML = s;
        scp.id = '_wau2ew';
        div.appendChild(scp);


        var scp2 = document.createElement('script');
        scp2.src = "https://waust.at/d.js";
        div.appendChild(scp2);
    }
    
      
    this._initDisqusScript = function () {
        this._initDivScript();
        var div = document.getElement("external_script_itens");
        if (!div) {
            return;
        }

        new sliceContainer('dsq-count-scr').remove();
                         
        var scp = document.createElement('script');
        scp.type = 'text/javascript';
        scp.src = 'https://madinfinite.disqus.com/count.js';
        scp.id = 'dsq-count-scr';
        div.appendChild(scp);
         
        
    }
  
     
    this._initFacebookLikeBox = function () {
        var div = document.getElement("facebook_like_box_div");
        if (!div) {
            return;
        }
        var div2 = document.getElement("fb-root");
        if (div2) {
            return;
        }
         
        var elem = div;  
        
         /* metodo do navegador, que detecita se um elemento está visivel ou não  */
        // retorna um array, mas o elemento mais importante é =>   "isIntersecting: true"
        var io = new IntersectionObserver(
        entries => {   
            if (entries[0].isIntersecting){  
                 //console.log('div entrou na vista : ' + this.getId() );  
                 if (!document.getElement("fb-root")){

                    console.log("Inicia FaceLikeBox"); 
                    div.style.display = 'block';

                    var s = ''; 
                    s += '<div id="fb-root"></div><div class="fb-like-box" data-href="https://www.facebook.com/pgmadinfinite/" data-width="' + div.clientWidth + '" data-height="300" data-colorscheme="light" data-show-faces="true" ';
                    s += 'data-header="false" data-stream="false" data-show-border="true"></div>';

                    new sliceContainer('facebook_like_box_div').write(s);

                    var s = '';
                    s += '(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id;';
                    s += 'js.src = "//connect.facebook.net/pt_BR/sdk.js#xfbml=1&appId=503004783062693&version=v2.0"; fjs.parentNode.insertBefore(js, fjs); }(document, "script", "facebook-jssdk")); ';

                    var scp = document.createElement('script');
                    scp.type = 'text/javascript';
                    scp.innerHTML = s;
                    div.appendChild(scp);            
                    	    
                 	              
                } 
            } 
            //console.log(entries);
        },{
            /* valores default */
        });  
        // inicia 
        io.observe(elem); 




    }

    this._initPinterest = function (){
        this._initDivScript();
        var div = document.getElement("external_script_itens");
        if (!div) {
            return;
        }
        //s+='<script defer data-pin-hover="true" src="'.Core::PATH_EXTERN_CACHE.'https://assets.pinterest.com/js/pinit.js"></script>';
               
        var scp2 = document.createElement('script');
        scp2.src = "https://assets.pinterest.com/js/pinit.js";
        scp2.setAttribute('data-pin-hover','true');
        div.appendChild(scp2);     
    }

    this._checkDisqusAd = function (i) {

        if (i > 5) {
            return;
        }
        var d = document.getElement('disqus_thread');
        if (!d) {
            return;
        }
         
        var iframes = d.getElementsByTagName('iframe');
        //for (i = 1; i <= 4; i++) {
        if (iframes[0]) {
            iframes[0].style.display = "none";
            //d.removeChild(iframes[0]);
        }
        //}  

        /*var d2 = document.getElement('dsq-app12');
        if (!d2) {
        i++; 
        setTimeout('new sliceExternalScripts()._checkDisqusAd('+ i +');', 1000);
        return;
        }
        ///remove  
        //d.removeChild(d2);	
        d2.style.display = "none";	*/
    }

    this._initAdCheck = function () {

        var useAdB = false;

        var div = document.getElement("adversing_bk_1");
        if (!div) {
            useAdB = true;
        }

        if (useAdB) {
            console.log('adblock ativo');

            //this._getAdBlockMSGfix(); 

            for (i = 1; i <= 5; i++) {
                this._getAdBlockMsgSmall('dca300x250_' + i);
            }
            for (i = 1; i <= 5; i++) {
                this._getAdBlockMsgBig('dca728x90_' + i);
            }


        }
    }
    this._getAdBlockMSGfix = function () {
        var s = '';
        //s+= '<div class="dcaBoxFix" id="dcaBoxFix">';
        s += 'Please, if you like our site, we kindly ask you to add <strong> spaceero.com </strong> to the whitelist or disable your ad blocker. <br> ';
        s += 'The only way to maintain the site is through the banners served on the site. So we can pay the server and continue to bring free and quality content to everyone. Thank you!';
        //s+= '</div>';

        var div = document.getElement("body");
        if (div) {
            var d2 = document.getElement("dcaBoxFix");
            if (!d2) {
                var d1 = document.createElement('div');
                d1.className = 'dcaBoxFix';
                d1.id = 'dcaBoxFix';
                d1.innerHTML = s;
                div.appendChild(d1);
            }
        }
    }
    this._getAdBlockMsgBig = function (idBox) {
        var div = document.getElement(idBox);
        if (!div) {
            return;
        }

        var s = '';
        s += '<div class="dcaBox">';
        s += '<a href="javascript:void(0);" id="' + idBox + '_lk"><img src="' + window.location.protocol + '//' + window.location.host + '/misc/images/adB2.png"></a>';
        s += '</div>';

        div.innerHTML = s;

        var d = document.getElement(idBox + '_lk');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                new sliceExternalScp().showNoAdText();
            }
        }

    }
    this._getAdBlockMsgSmall = function (idBox) {
        var div = document.getElement(idBox);
        if (!div) {
            return;
        }

        var s = '';
        s += '<div class="dcaBox">';
        s += '<a href="javascript:void(0);" id="' + idBox + '_lk"><img src="' + window.location.protocol + '//' + window.location.host + '/misc/images/adB1.png"></a>';
        s += '</div>';

        div.innerHTML = s;

        var d = document.getElement(idBox + '_lk');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                new sliceExternalScp().showNoAdText();
            }
        }

    }
    this.showNoAdText = function () {

        var s = '';

        s += '<div style="padding:30px 20px 10px; font-size:0.9rem; line-height:1.2rem;">';
        s += '<span style="font-size:0.9rem;">';
        s+= '<strong> This text is a request to users who use ad blockers. <br> Read carefully: </strong> ';
        s+= '</span>';
        s+= '<br> <br>';
        s+= 'You who visit <strong> Space Ero </strong> must have already noticed that all of our material is available for free, with no requests or requirements from the site staff to users, anyone can access it. them. ';
        s+= '<br> <br>';
        s+= 'And to keep this website up and running with all its content, we need, in addition to the server, a minimal team to keep it organized, which demands spending, which unfortunately is rising every day. And the only way we have to cover expenses is through the ads we publish on the website. ';
        s+= '<br> <br>';
        s+= 'But unfortunately for some time now we have been having serious problems linking the ads, due to the vast majority of users (over 65%) who access us using ad blockers. This problem is common on all sites, but we know that blockers are used to improve performance and prevent malicious ads. ';
        s+= '<br> <br>';
        s+= 'We all know how annoying ads are that can hinder navigation on the site, so we are always trying to keep ads on pages to a minimum, we also use only known and safe ads, such as Google Adsense, which has strict rules about malicious advertisers, preventing advertisements from appearing that affect your user experience. ';
        s+= '<br> <br>';
        s+= 'Several other sites also suffer from this problem, and many ended up closing because they were unable to maintain themselves.';
        s+= '<br> <br>';
        s+= 'So that we can cover expenses, <strong> we just ask you to add <strong> Space Ero </strong> to your blocker\'s whitelist (or disable it on the website pages), </strong> to that we can at least cover the expenses we have with the website. We clarify that we will not, at any time, add abusive advertisements, ask for donations, or charge for the content available on the site. ';
        s+= '<br> <br>';
        s+= 'We count on the help of everyone who visits us to collaborate with this simple gesture.';
        s+= '</div>';


        new sliceBox().setViewClose(true).setWidth(650).setHeight(300).setForm('form_read')
            .setTitle('Do you use ad blockers? Read...')
            .setContent(s)
        //.appendButton('Registrar', slice.list.box.button.Button, function () { window.open(new sliceUser()._getUrlRegister()) })
        //   .appendButton('Logar', slice.list.box.button.Submit, function () { new sliceUser().login(); })
        .appendButton('Fechar', slice.list.box.button.Close)
            .show();


    }

    this.reloadCounters = function(){
        //this._initAmung();
        this._initAnalytics();
    }
    this.initDisqusScpBk = function(id,url){
        ///metodo para enganar o script
    }
         
    this.initDisqusScpSync = function (id,url) {
        this._setIdPage(id);
        this._setPageURL(url);
          
        var elem = document.getElement('disqus_thread_'+ id );
        if (!elem){
            return;   
        } 

        var spt = document.getElement("disqus_scp");
        if (spt) {
            return;
        }

        //console.log('aqui...');  
         
        /*
        new sliceExternalScp().initDisqusScpSync("'.$idPage.'","'.$url.'");
        */

        /* metodo do navegador, que detecita se um elemento está visivel ou não  */
        // retorna um array, mas o elemento mais importante é =>   "isIntersecting: true"
        var io = new IntersectionObserver(
        entries => {  
            if (entries[0].isIntersecting){  
                 //console.log('div entrou na vista : ' + this.getId() );  
                 if (!document.getElement("disqus_scp")){

                    console.log("Inicia Disqus"); 
                    this.initDisqusScp(id,url);                 	    
                 	              
                } 
            } 
            //console.log(entries);
        },{
            /* valores default */
        });  
        // inicia 
        io.observe(elem); 


    }

    this.reloadDisqus = function (){   
     
        var spt = document.getElement("disqus_scp");
        if (!spt) {
            return;
        }
        	
    	this.initDisqusScp(this._getIdPage(),this._getPageURL());    	
    }

    this.initDisqusScp = function(id,url){
    	
    	this._setIdPage(id);
        this._setPageURL(url);  
         
        this._initDivScript();

        var spt = document.getElement("disqus_scp");
        if (spt) {
            return;
        }

        var div = document.getElement("disqus_thread_"+id);
        if (!div) {
            return;
        }

        ///removo os containers que existir;
        new sliceContainer('disqus_thread').remove();
        new sliceContainer('disqus_scp').remove();

        //crio o container 
        new sliceContainer('disqus_thread').create("disqus_thread_"+id, '');

        //div.innerHTML = '<div id="disqus_thread"></div>';
       		
	    /* var disqus_config = function () {
	        this.page.url = url; 
	        this.page.identifier = id;   
	    }; */
	    
        //var scp = document.getElement("disqus_scp");
        // if (!scp) {
	        (function() {   
	            var d = document, s = d.createElement("script");        
	            s.src = "https://madinfinite.disqus.com/embed.js"; 
                s.id = 'disqus_scp';         
	            s.setAttribute("data-timestamp", +new Date());
	            (d.head || d.body).appendChild(s);  
	        })();
        //}  

        /*var div = document.getElement("disqus_thread");
        if (div) {
           //div.id = "disqus_thread_load_"+id;
        }*/

        ////
        setTimeout('new sliceExternalScp()._checkDisqusAdNew();',1500);  
    }
    
    this._checkDisqusAdNew = function (i) {

        if (i > 5) {
            return;
        }
        var d = document.getElement('disqus_thread');
        if (!d) {
            return;
        }

        if(d.innerHTML == ''){
             setTimeout('new sliceExternalScp()._checkDisqusAdNew();',500);
             return;
        }
         
        var iframes = d.getElementsByTagName('iframe');
         
        if (iframes[0]) {
            //iframes[0].style.display = "none";
            //d.removeChild(iframes[0]);            
            if (iframes[0].src.indexOf('/ads-iframe/') > 0){
            	iframes[0].style.display = "none";
            }
        }
        
        if (iframes[1]) {
            //iframes[1].style.display = "none";
            //d.removeChild(iframes[1]);            
            if (iframes[1].src.indexOf('/ads-iframe/') > 0){
            	iframes[1].style.display = "none";
            }
        }
        
        if (iframes[2]) {
            //iframes[2].style.display = "none";
            //d.removeChild(iframes[2]);            
            if (iframes[2].src.indexOf('/ads-iframe/') > 0){
            	iframes[2].style.display = "none";
            }
        }


        //d.id = 'disqus_thread_load';
     }
               
    //#endregion
    //#region propriedades públicas
    this.getAdsense = function () {
        this._getAdsense();
    }
    this.get = function () {

        var s = '';

        var n = this._rand(1, 5);

        switch (n) {
            case 1:
            case 3:
                this._getUolAds();
                break;
            case 2:
            case 4:
                this._getBooBox();
                break;
            case 5:
                this._getPlayAsia();
                break;
        }


        return;   ///#######


        //se for livre
        if (!this._isAdult()) {
            ///******************
            var n = this._rand(1, 4);

            switch (n) {
                case 1:
                case 2:
                case 3:
                    this._getUolAds();
                    break;
                case 4:
                    this._getBooBox();
                    break;
            }
            return;
            ///*****************
        }



        ///se for adulto 
        var n = this._rand(1, 4);

        switch (n) {
            case 1:
            case 2:
            case 4:
                this._getBooBox();
                break;
            case 3:
                this._getPlayAsia();
                break;
        }
        return;
        //new sliceContainer(this._getContainerId()).write(s);

    };

    this.setArea = function (area) {
        this._area = area;  
        this._store();
        return this;
    }
    this.getArea = function () {
        return this._area;
    };

    this.initExternalScripts = function () {
     
        this._initDivScript();
        //this._initAnalytics();
        //setTimeout('new sliceExternalScp()._initAnalytics();', 2000);
          
        ///this._initDisqusScript(); 

        /*this._initAmung();*/
        this._initFacebookLikeBox();
        
        ///this._initPinterest();
                
        //setTimeout('new sliceExternalScp()._checkDisqusAd(0);', 1000);
        //setTimeout("new sliceExternalScp()._initAdCheck();", 300);
        
        /*setTimeout('new sliceExternalScp()._initAnalytics();', 1000);
        setTimeout('new sliceExternalScp()._initAmung();', 1000);
        setTimeout('new sliceExternalScp()._initFacebookLikeBox();', 1000);
        setTimeout('new sliceExternalScp()._initPinterest();', 1000);*/


    }
    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
} 
//#endregion

 
//#region sliceNsfwContent
function sliceNsfwContent() {
    //#region proprieades privadas
    this._view = false; 
    this._status = slice.list.interation.status.None; //define se esta sendo enviado
   
   this._lang = 'br';
    this.setLang = function (i) {
        this._lang = i;
        this._store();
        return this;
    };
    this.getLang = function () {
        return this._lang;
    };

     this.setView = function (i) {
        this._view = i;
        this._store();
        return this;
    };
    this.getView = function () {
        return this._view;
    };

    this._setStatus = function (status) {
        this._status = status;
        return this;
    };
    this._getStatus = function () {
        return this._status;
    };

   

    this._store = function () {
        window._sliceNsfwContent = this;

        var o = new Object();
        o = {
            view: this.getView()            
        }
        var storage = new sliceStorage(slice.list.storage.method.Local);
        storage.setField('slice_nsfw_content', o);

    };
    this._load = function () {

        var storage = new sliceStorage(slice.list.storage.method.Local);
        if (storage.issetField('slice_nsfw_content')) {
            var o = storage.getField('slice_nsfw_content');
            this.setView(o.view);            
        }

        var o = window._sliceNsfwContent;
        if (!o) {
            return;
        }
        this.setView(o.getView()); 
        this.setLang(o.getLang());         
    };

      
    this._showContent = function (always) {
        var d1 = document.getElement("news_nswf_content");
        var d2 = document.getElement("news_nswf_msg");
        if (!d1 || !d2) {
            return;
        } 

        if (always){
            this.setView(true);
        }

        ///desencoda o texto e imagens
        var d1 = document.getElement("news_nswf_content");
        if (d1){
            var st = d1.innerHTML; 
            new sliceContainer('news_nswf_content').write( atob(st) );
        }

        ///se for video
        var d1 = document.getElement("news_nswf_content_video");
        if (d1){
            var st = d1.innerHTML; 
            new sliceContainer('news_nswf_content_video').write( atob(st) );
        }
        ///// 
        
        ////restaura o bbCode do conteudo
        new sliceProtectMedia().setProtect(true).init();
         
        new sliceContainer('news_nswf_content').show();
        new sliceContainer('news_nswf_msg').hide();

        ///se for video
        new sliceContainer('news_nswf_content_video').show();
        new sliceContainer('news_nswf_content_video_title').show();

         
    };
 

    this._initMsg = function (){
        var d1 = document.getElement("news_nswf_content");
        var d2 = document.getElement("news_nswf_msg");
        if (!d1 || !d2) {
            return;
        }

        var s = ''; 
        s+='<div class="news_nswf_msg">';

            console.log(this.getLang()); 

            if (this.getLang()=='eng'){

                 s+='<div class="n_nswf_ico"><i class="material-icons">report_problem</i></div>';
                 s+='<div class="n_nswf_title">+18 Content Warning</div>';
                 s+='<div class="n_nswf_text">';
                    s+='<div>Attention this page contains adult material (text or images).</div>';
                    s+='<div><strong>Only continue if you are over 18.</strong></div>';
                 s+='</div>';

                 s+='<div class="n_nswf_bts"><a id="bt_nsfw_1" class="bt-et-red">I\'m 18 and I always want to see that kind of content.</a></div>';
                 s+='<div class="n_nswf_bts"><a id="bt_nsfw_2" class="bt-et-orange">I\'m 18, but I just want to see it this time.</a></div>';
                 s+='<div class="n_nswf_bts"><a id="bt_nsfw_3" class="bt-et-grey">I am not 18 years old. <strong> TAKE ME OUT OF HERE!</strong></a></div>';

             }else{

                 s+='<div class="n_nswf_ico"><i class="material-icons">report_problem</i></div>';
                 s+='<div class="n_nswf_title">+18 Aviso de Conteúdo</div>';
                 s+='<div class="n_nswf_text">';
                    s+='<div>Atenção, esta página contém material adulto (texto ou imagens).</div>';
                    s+='<div><strong>Continue apenas se você tiver mais de 18 anos.</strong></div>';
                 s+='</div>';

                 s+='<div class="n_nswf_bts"><a id="bt_nsfw_1" class="bt-et-red">Tenho 18 anos e sempre quero ver esse tipo de conteúdo.</a></div>';
                 s+='<div class="n_nswf_bts"><a id="bt_nsfw_2" class="bt-et-orange">Tenho 18 anos, mas só quero ver desta vez.</a></div>';
                 s+='<div class="n_nswf_bts"><a id="bt_nsfw_3" class="bt-et-grey">Não tenho 18 anos. <strong>ME TIRE DAQUI!</strong></a></div>';

             }

        s+='</div>';

        new sliceContainer('news_nswf_msg').write(s);
        new sliceContainer('news_nswf_msg').show(); 
        
        var d = document.getElement('bt_nsfw_1');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj._showContent(true);
            }
        }

        var d = document.getElement('bt_nsfw_2');
        if (d) {
            d.obj = this;
            d.onclick = function () {
               this.obj._showContent(false);
            }
        }

        var d = document.getElement('bt_nsfw_3');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                 window.location = window.location.protocol + '//' + window.location.host + '/';
            }
        }                
    };    

    this.initCover = function(){
        
        var s = '';

        if (this.getLang()=='eng'){
            s+='<div>This image may be unsuitable for minors</div>';    
		    s+='<div><a href="javascript:void(0);" id="news_nswf_cover_3">I want to see the image</a></div>';
        }else{
            s+='<div>Esta imagem pode ser inadequada para menores</div>';    
		    s+='<div><a href="javascript:void(0);" id="news_nswf_cover_3">Eu quero ver a imagem</a></div>';
        }

        new sliceContainer('news_nswf_cover_div').write(s);
        new sliceContainer('news_nswf_cover_div').show(); 

        var d = document.getElement('news_nswf_cover_3');
        if (d) {
            d.obj = this;  
            d.onclick = function () {
                this.obj._showCover(); 
            }
        }

        if (this.getView()) { 
            this._showCover();
            return;
        } 
    }

    this._showCover = function(){

        var d1 = document.getElement('news_nswf_cover_0');
        var d2 = document.getElement('news_nswf_cover_1');
        if (!d1 || !d2) {
            return;
        }
        if (d2.innerHTML.length > 0){
            d1.src = d2.innerHTML;          
        } 
        new sliceContainer('news_nswf_cover_div').write('');
        new sliceContainer('news_nswf_cover_div').hide();
    }


    this.initListCover = function(){
        //
        var s = '';
        if (this.getLang()=='eng'){
            s+='The images of the inappropriate covers have been removed. <a href="javascript:void(0);" id="list_img_msg_bt">Click here to see the covers!</a></div>';
        }else{
            s+='As imagens inadequadas foram ocultadas.<a href="javascript:void(0);" id="list_img_msg_bt">Clique aqui para ver as capas!</a></div>';
        }
        new sliceContainer('news-content-msg-top-list').write(s);
        new sliceContainer('news-content-msg-top-list').show(); 

        var d = document.getElement('list_img_msg_bt');
        if (d) {
            d.obj = this;  
            d.onclick = function () {
                this.obj._showCoverList(); 
            }
        }

        if (this.getView()) { 
            this._showCoverList();
            return;
        } 
        
    }

    this._showCoverList = function(){

        var dList = document.getElementsByClassName('r18img');
        if (!dList || dList.length<=0){
            return; 
        }
         
        var total = dList.length;
                         
        for (var n = total; n >= 0; n--) {
            if (dList[n] != undefined) {

                var d1 = dList[n].getElementsByTagName('span')[0];
                var d2 = dList[n].getElementsByTagName('img')[0];
                 
                if (d1 && d2 && d1.innerHTML.length > 0){
                    d2.src = d1.innerHTML;
                }                 
                 
            }
        } 
        
        new sliceContainer('news-content-msg-top-list').write('');
        new sliceContainer('news-content-msg-top-list').hide();

    }
    

    //#endregion 
    //#region propriedades públicas

    this.init = function () {
        this._load();
                 
        if (this.getView()) { 
            this._showContent();
            return;
        }
      
        this._initMsg(); 
    };
        

    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
//#endregion


//#region sliceFeatured
function sliceFeatured() {
    //#region proprieades privadas
    this._pos = 0;
    this._id = 0;
    this._items = new Array();
    this._lastRequest = 0;
    this._status = slice.list.interation.status.None; //define se esta sendo enviado
    this._timeOutId = 0;
    this._itemsComment = new Array();

    this._lang = 'eng';
    this.setLang = function (i) {
        this._lang = i;
        return this;
    };
    this.getLang = function () {
        return this._lang;
    };

     this.setId = function (i) {
        this._id = i;
        this._store();
        return this;
    };
    this.getId = function () {
        return this._id;
    };

    this._setStatus = function (status) {
        this._status = status;
        return this;
    };
    this._getStatus = function () {
        return this._status;
    };

    this._setPos = function (i) {
        this._pos = i;
        return this;
    };
    this._getPos = function () {
        return this._pos;
    };

    this._setItensComment = function (i) {
        this._itemsComment = i;
        return this;
    };
    this._getItensComment = function () {
        return this._itemsComment;
    };


    this._setItens = function (i) {
        this._items = i;
        return this;
    };
    this._getItens = function () {
        return this._items;
    };

    this._setTimeOutId = function (i) {
        this._timeOutId = i;
        return this;
    };
    this._getTimeOutId = function () {
        return this._timeOutId;
    };


    this._setLastRequest = function (i) {
        this._lastRequest = i;
        return this;
    };
    this._getLastRequest = function () {
        return this._lastRequest;
    };

    this._store = function () {
        window._sliceFeaturedCine = this;

        var o = new Object();
        o = {
            pos: this._getPos(),
            itens: this._getItens(),
            itensComment: this._getItensComment(),
            lastRequest: this._getLastRequest(),
            idTimeOut: this._getTimeOutId()
        }
        var storage = new sliceStorage(slice.list.storage.method.Local);
        storage.setField('itens_cine_slice_featured', o);

    };
    this._load = function () {

        var storage = new sliceStorage(slice.list.storage.method.Local);
        if (storage.issetField('itens_cine_slice_featured')) {
            var o = storage.getField('itens_cine_slice_featured');
            this._setItens(o.itens);
            this._setItensComment(o.itensComment);
            this._setPos(o.pos);
            this._setLastRequest(o.lastRequest);
            this._setTimeOutId(o.idTimeOut);
        }

        var o = window._sliceFeaturedCine;
        if (!o) {
            return;
        }
        this._setPos(o._getPos());
        this._setStatus(o._getStatus());
        this._setItensComment(o._getItensComment());
        this._setItens(o._getItens());
        this._setLastRequest(o._getLastRequest());
        this._setTimeOutId(o._getTimeOutId());
        this.setLang(o.getLang());
    };


    this._requestNews = function () {

        ///console.log('Enviando');

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/request/news/menu');
        o.addPostVar('id_user', 0);
        o.addPostVar('is_eng', "true");
        o.obj = this;
        o.onReady = function () {
            if (!this.isValidResponse()) {
                new sliceLoader().show(this.getErrorDescription(), slice.list.loader.type.Info, 5);
                return;
            }

            //console.log(this.response.details.items);

            this.obj._setLastRequest(this.obj._getTime());
            this.obj._setItens(this.response.details.items);
            //console.log(this.response.details.itemsComment);
            this.obj._setItensComment(this.response.details.itemsComment);
            this.obj._store();
            //this.obj._initTransit();
            this.obj._initCommentFeatured();

            ///alert('Requisitou novas news para os destaques');

        };
        o.send();

    }


    this._initTransit = function () {

        //console.log('inicia transição...');
        var d = document.getElement('topo_destaque_title');
        if (!d) {
            return;
        }
        var pos = this._getPos();
        if (pos == undefined) {
            pos = 0;
        }
        pos++;

        var items = this._getItens();
        if (pos > (items.length - 1)) {
            pos = 0;
        }

        new sliceContainer('topo_destaque_title').write('<a href="' + items[pos].url + '" target="' + items[pos].target + '"  title="' + items[pos].title + '" class="">' + new sliceString(items[pos].title).truncate(40) + '</a>');
        new sliceContainer('topo_destaque_det_text').write(items[pos].subtitle);
        new sliceContainer('topo_destaque').className('topo_destaque');

        //console.log('Exibindo: ' + pos);

        this._setPos(pos);

        var iT = 0;
        var iT = setTimeout('new sliceFeatured()._next();', 10000);

        this._setTimeOutId(iT);

        this._store();

       


        ///clearTimeout
        ///setTimeout


    }

    this._hide = function () {
        new sliceContainer('topo_destaque').className('topo_destaque topo_destaque_hide');
    }
    this._next = function () {

        var iT = this._getTimeOutId();
        if (iT != undefined && iT > 0) {
            //console.log('cancelando: ' + iT);
            clearTimeout(iT);
        }

        this._hide();
        setTimeout('new sliceFeatured()._initTransit();', 500);

    }

    this._adjust = function () {
        var d = document.getElement("header-container");
        if (!d) {
            return;
        }
        if (d.clientWidth <= 900) {
            new sliceContainer('topo_destaque').hide();
            return;
        }
        new sliceContainer('topo_destaque').show();
    }

    this._rand = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    this._initCommentFeatured= function(){
            
        var elem = document.getElement('box_news_featured_'+this.getId() );
        if (!elem){
            return;   
        } 

        if (document.getElement("more-articles-content")){
            return;
        }


        /* metodo do navegador, que detecita se um elemento está visivel ou não  */
        // retorna um array, mas o elemento mais importante é =>   "isIntersecting: true"
        var io = new IntersectionObserver(
        entries => {  
            if (entries[0].isIntersecting){  
                 //console.log('div entrou na vista : ' + this.getId() );  
                 if (!document.getElement("more-articles-content")){
                  
                    console.log("Inicia Comment Featured"); 
                    this._initCommentFeaturedContent();                	    
                 	              
                } 
            } 
            //console.log(entries);
        },{
            /* valores default */
        });  
        // inicia 
        io.observe(elem); 


    }
    this._initCommentFeaturedContent = function () {

        var itensA = this._getItensComment();
        var n = this._rand(1, 2);

        var items = null;
        var title = '';
        var subTitle = '';
        if (n == 1) {
            items = itensA.last;
            if (this.getLang()=='eng'){
                title = 'Latest posts';
                subTitle = 'Recent news';
            }else{
                title = 'Últimas postagens';
                subTitle = 'Notícias recentes';
            }
        } else {
            items = itensA.mostView;  
            if (this.getLang()=='eng'){
                title = 'Latest posts';
                subTitle = 'Most viewed news of the day';
            }else{
                title = 'Últimas postagens';
                subTitle = 'Notícias mais vistas do dia';
            }
        }

        var s = '';


        s += '<div class="more-articles" id="more-articles-content">';
        s += '<div class="more-articles-title">' + title + '<br>...</div>';
        s += '<div class="more-articles-item-list">';   

        ////**********         
        for (var pos = 0; pos != items.length; pos++) {
          
            s += '<div class="more-articles-item more-articles-item-'+ (pos)+ '">';
            s += '<div class="more-articles-item-img">';
            s += '<a href="' + items[pos].url + '" alt="' + new sliceString(items[pos].title).truncate(50) + '" target="' + items[pos].target + '">';
            s += '<img title="' + new sliceString(items[pos].title).truncate(50) + '" class="media-shadow  img-lz-related-'+items[pos].id +'" slice-lz-src="' + items[pos].image + '"   title="' + new sliceString(items[pos].title).truncate(30) + '">';
            s += '</a>';
            s += '</div>';
            s += '<div class="more-articles-item-title">' + new sliceString(items[pos].title).truncate(35) + '</div>';
            s += '</div>';
             
            setTimeout('new sliceImageLazy().setId("img-lz-related-' + items[pos].id +' ").init();',300);

        }
        ////**********

        s += '</div>';
        
        s += '</div>';
        

        new sliceContainer('box_news_featured_'+this.getId()).write(s);
        new sliceContainer('box_news_featured_'+this.getId()).show();
        new sliceContainer('box_news_featured_'+this.getId()).className('');
                

    }

    this._getTime = function () {
        return Math.floor(new Date().getTime() / 1000);
    }
    //#endregion 
    //#region propriedades públicas

    this.init = function () {
        this._load();

        // setInterval('new sliceFeatured()._adjust();', 1000);

        /*var bt = document.getElement("topo_destaque_bt_next");
        if (bt) {
        bt.obj = this;
        bt.onclick = function () {
        this.obj._next();
        }
        }
        */
        //this._requestNews();
        //return;

        ///se nao for setado a hora
        if (this._getLastRequest() <= 0) {
            this._requestNews();
            return;
        }
        ///ou se a hora atual, for maior q o ultimo request + 2h 
        var nHours = 1;
        var nTime = this._getLastRequest() + (nHours * 60 * 60);

        if (this._getTime() > nTime) {
            this._requestNews();
            return;
        }

        this._initCommentFeatured();
        //this._initTransit();
    };





    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
//#endregion


//#region sliceNews
function sliceNews() {
    //#region proprieades privadas
    this._id = null;
    this._title = '';
    this._page = 0;
    this._query = new Array(0,'','');
    this._url = '';
    this._lang = 'br';
    this._userId = null;
    this._status = slice.list.interation.status.None; //define se esta sendo enviado

    this._setStatus = function (status) {
        this._status = status;
        return this;
    };
    this._getStatus = function () {
        return this._status;
    };

    this._store = function () {
        window._sliceNews = this;
    };
    this._load = function () {
        var o = window._sliceNews;
        if (!o) {
            return;
        }
        this.setId(o.getId());
        this.setLang(o.getLang());
        this.setPage(o.getPage());
        this.setQuery(o.getQuery());
        this.setUserId(o.getUserId());
        this._setStatus(o._getStatus());
    }; 

    this.setLang = function (i) {
        this._lang = i;
        return this;
    };
    this.getLang = function () {
        return this._lang;
    };

    this._code = function () {
        var container = new sliceContainer('news_content');
        var c = new sliceCode(new sliceString(container.read()).replaceNewLine()).setNewLineChar("\n").setMaxFlashWidth(715).setMaxFlashHeight(450).setMaxImageWidth(715).setMaxImageHeight(450).setAllowSize(false).setAllowSmileys(true).replace().get();
        container.write(c);

        var container = new sliceContainer('news_screens_content');
        var c = new sliceCode(new sliceString(container.read()).replaceNewLine()).setNewLineChar("\n").setMaxFlashWidth(715).setMaxFlashHeight(450).setMaxImageWidth(715).setMaxImageHeight(450).setAllowSize(false).setAllowSmileys(true).replace().get();
        container.write(c);

        var container = new sliceContainer('news_trailer_content');
        var c = new sliceCode(new sliceString(container.read()).replaceNewLine()).setNewLineChar("\n").setMaxFlashWidth(715).setMaxFlashHeight(450).setMaxImageWidth(715).setMaxImageHeight(450).setAllowSize(false).setAllowSmileys(true).replace().get();
        container.write(c);

        var container = new sliceContainer('news_links_content');
        container.write(window.atob(container.read()));
        container.show();

        this._adjustUrl();

        new sliceContainer('news_links_content_t').show();



        return this;
    }

    this._adjustUrl = function () {

        var d = document.getElementsByClassName('postlink');
        if (!d) {
            return;
        }

        var total = d.length;
        for (var n = 0; n != total; n++) {

            d[n].target = "";

            var str = d[n].href;
            var str2 = d[n].innerHTML;
            if (str.indexOf("hiding.in") <= 0 && str.indexOf("spaceero.com") <= 0) {

                if (str.indexOf("drive.google") > 0) {
                    d[n].href = "https://hiding.in/redirect/" + str.split("").reverse().join("");
                } else {
                    d[n].href = "https://hiding.in/redirect/" + window.btoa(d[n].href);
                }


            }
            if (str.indexOf("spaceero.com") <= 0) {
                d[n].target = "_blank";
            }
            var st3 = '...';
            str2 = str2.replace("a.nz/#!", st3);
            str2 = str2.replace("oogle.com/file", st3);
            str2 = str2.replace(".com", st3);
            str2 = str2.replace(".net", st3);
            str2 = str2.replace(".org", st3);
            str2 = str2.replace(".me", st3);
            str2 = str2.replace(".in", st3);
            str2 = str2.replace(".cr/", st3);
            str2 = str2.replace(".com.br", st3);
            str2 = str2.replace(".../", st3);
            d[n].innerHTML = str2;
        }
    }


    this._requestNewsList = function (){
        
        if (this._getStatus() != slice.list.interation.status.None) {
            console.log("ainda está requisitando as mensagens");
            return;
        }
        
        var query = this.getQuery();

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/news/get/list');         
        o.addPostVar('page', this.getPage());

         o.addPostVar('id_user', query[0]);
         o.addPostVar('t_busca', query[1]);
         o.addPostVar('search', query[2]);
         o.addPostVar('is_eng', 'true');

         if (this.getLang()=='br'){
            o.addPostVar('is_eng', 'false');
         }else{
            o.addPostVar('is_eng', 'true');
         }


       /// o.addPostVar('type_list', this._getType());
        o.obj = this;
        o.onSubmit = function () {
            this.obj._setStatus(slice.list.interation.status.Sending);
            new sliceToasts().setText('Looking for publications. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {

                new sliceToasts().setText('' + this.getErrorDescription()).setStyle('red').show();
                //console.log('Ocorreu um erro ao buscar mensagens: ' + this.getErrorDescription() );
                this.obj._setStatus(slice.list.interation.status.None);
                return;
            }

            console.log('novas mensagens obtidas');
            //new sliceToasts().setText('Login efetuado com sucesso.').setStyle('green').show();
            new sliceToasts().close();

            this.obj._mountHtmlList(this.response);

            var d = document.getElement('news-list-total');            
            if (d){
                d.innerHTML = parseInt(d.innerHTML) + this.response.summary.partial.items;                
            } 
            var d2 = document.getElement('news-list-total-2');
            if (d2){
                d2.innerHTML = parseInt(d2.innerHTML) + this.response.summary.partial.items;
            }

           
            if (this.obj.getPage() == this.response.summary.total.pages) {
                new sliceContainer('news-list-bt-bt').remove();
                new sliceContainer('news-list-bt-div').write('You are already viewing all publications of this search! '+ this.response.summary.total.items+' in total.');
            }

            this.obj._setStatus(slice.list.interation.status.None);
            this.obj.setPage(this.obj.getPage() + 1);
            this.obj._store();
        }
        o.send();
    }

    this._mountHtmlList = function(response){            
        if (response == null) {
            return;
        }

        //new sliceContainer('loading-div').remove();

        var aItems = new Array();
        for (var n = 0; n != response.summary.partial.items; n++) {
            ////********************************************
            //var obj = response.details.item[n];
            this._getItemsHTML(response.details.item[n]);  
            ////********************************************
        }

        //atualiza os timers
        new sliceTime().update();


    }
    
    this._getItemsHTML = function (obj){

        var div_content = document.getElement('news-list');
        if (!div_content) {
            div_content = document.getElementsByClassName('news-list')[0];
            if (!div_content){
                console.log('div base nao existe');
                return;
            } 
            //console.log('div base não existe');
            //return;
        }

        var divID = 'item-list-' + obj.id;

        //se existe nem faz nada
        if (document.getElement(divID)) { 
            if( document.getElementsByClassName(divID)[0] ){
                return;
            }
        }

       
		var imgCss = ' ';   
		if ( obj.width < 665 ){  
			imgCss = ' item-list-p';
		}   


        ////cria o separador
        var div = document.createElement('div');
        div.setAttribute('class', 'news-list-div');
        div_content.appendChild(div);

         ////cria o div da news
        var div = document.createElement('div');
        div.setAttribute('id', divID); 
        div.setAttribute('class', 'item-list' + imgCss);
                   

        var s = '';
                         		
        var alt = obj.alt;
	
        ///s.='<div class="item-list '.$cssP.' item-list-'.$obj->id.'">';				
			s+='<div class="item-list-image ">';
			s+='<div class="il-image-type">';
				s+='<a class="il-image-type-item" href="'+ obj.type.url +'" title="'+ obj.type.title +'">&#35;'+ obj.type.title +'</a>';
				//s+='<a href="#" class="il-image-type-item">Indie</a>';
			s+='</div>'; 
			s+='<a href="' + obj.url + '" alt="' + alt + '" title="' + alt + '">';
				s+='<img alt="' + alt + '" title="' + alt + '" src="'+ obj.image +'" >';
			s+='</a>';
		s+='</div>';				
		s+='<div class="item-list-content">';
			s+='<div class="ilc-title"><h3><a href="' + obj.url + '" title="' + alt + '">' + new sliceString(obj.title).str_replace('.,,.','"') + '</a></h3></div>';
			s+='<div class="ilc-message">';
				if (obj.message != ''){
					s+='<a href="' + obj.url + '" alt="' + alt + '" title="' + alt + '">' + new sliceString(obj.message).str_replace('.,,.','"') + '</a>';
				}
			s+='</div>';
			s+='<div class="ilc-details">';							  
				s+='<div class="ilc-chip">By <strong>' + obj.user.name + '</strong>, <time datetime="'+ obj.time.rfc +'">'+ obj.time.rfc +' [Full]</time></div>';
				//s+='<div class="ilc-chip ilc-chip-comment hide-on-low"><a href="' + obj.url + '#disqus_thread" identifier="post_' + obj.id + '">0</a> <span class="material-icons">chat_bubble</span></div>';
			s+='</div>';
		s+='</div>';				
		//s+='</div>'; 

       
        div.innerHTML = s;
        //adiciona abaixo do anterior
        div_content.appendChild(div);

    }
  

    this.initItem = function (isSmall){

         var divID = 'item-list-js-' + this.getId();

        //se existe nem faz nada
        div = document.getElement(divID);
        if (!div) { 
            return;
        }  

        var s = ''; 

        s+='{"id":'+ this.getId() +',';		 
				
		s+='"title":"'+ div.getAttribute('data-news-title') +'",'; 
		s+='"message":"'+ div.getAttribute('data-news-message') +'",';
		s+='"alt":"'+div.getAttribute('data-news-alt')+'",'; 
		s+='"url":"'+div.getAttribute('data-news-url')+'",';
		s+='"image":"'+div.getAttribute('data-news-image')+'",';
		s+='"width":"'+div.getAttribute('data-news-image-width')+'",';
		
		s+='"type":{'; 
			s+='"title":"'+div.getAttribute('data-news-type')+'",';
			s+='"url":"'+div.getAttribute('data-news-type-url')+'"';
		s+='},'; //time
		
		s+='"time":{';
			s+='"time":"'+div.getAttribute('data-news-time')+'",';
			s+='"rfc":"'+div.getAttribute('data-news-time')+'"';
		s+='},'; //time
		
		s+='"user":{'; 
			s+='"name":"'+div.getAttribute('data-news-user')+'"';			
		s+='} '; 
        s+='}';//user 
         
        //console.log(s); 
        var obj = JSON.parse(s); 
        //console.log(obj);

       
        imgCss = ' img-item ';   
		if (obj.width == 665){             	
			imgCss = ' img-item-ret center-image ';
		}
		   
        var s = ''; 
		//s+='<div class="item-list-new  ' +divID + '" >';  //id="item-list-' + obj.id + '"
   
		/// item-list-img-div-new
		s+='<div class="item-list-img-div-new">';
			s+='<a href="' + obj.url + '" title="' + obj.alt + '" >';    	 
				s+='<img alt="' + obj.alt + '" title="' + obj.alt + '"  src="' + obj.image + '" class="' + imgCss +'" >';	
			s+='</a>';
			s+='<a class="item-list-type-new" href="' + obj.type.url + '" title="' + obj.type.title + '">&#35;' + obj.type.title + '</a>';
		s+='</div>';
  
		s+='<div class="item-list-content-new">';
	
		s+='<div class="item-list-content-box-new">';
		///************
			
			s+='<div class="item-list-title-new"><a href="' + obj.url + '"  title="' + obj.alt + '">' + new sliceString(obj.title).str_replace('.,,.','"') + '</a></div>';
			if ( obj.message.length > 0 ){
				s+='<div class="item-list-message-new"><a href="' + obj.url + '"  title="' + obj.alt + '">' + new sliceString(obj.message).str_replace('.,,.','"') + '</a></div>';
			} 
			s+='<div class="item-list-user-new truncate">By <strong>' + obj.user.name + '</strong>, <time datetime="' + obj.time.rfc + '">' + obj.time.rfc + ' [OnlyText]</time></div>'; //Full
			
			s+='<div class="item-list-comment-new"><a href="' + obj.url + '#disqus_thread" identifier="post_' + obj.id + '">0</a> <i class="tiny material-icons">chat_bubble</i></div>';  
			 			
		///************ 
		s+='</div>'; //item-list-content-box
		s+='</div>'; //item-list-content

		//s+='</div>';


        div.innerHTML = s; 
        div.setAttribute('class', 'item-list-new ' + (isSmall ? 'item-list-new-small' : '') + ' item-list-' + this.getId());  

        new sliceTime().update();

    }

    this.onViewItem = function(isSmall){

        var elem = document.getElement('item-list-js-' + this.getId());
        if (!elem){
            return;            
        }
        elem.idItem = this.getId();

        /* metodo do navegador, que detecita se um elemento está visivel ou não  */
        // retorna um array, mas o elemento mais importante é =>   "isIntersecting: true"
        var io = new IntersectionObserver(
        entries => {  
            if (entries[0].isIntersecting){  
                //console.log('div entrou na vista : ' + this.getId() );  
                 if (document.getElement('item-list-js-' + elem.idItem )){
                     new sliceNews().setId(elem.idItem).initItem(isSmall);             
                 } 
            } 
            //console.log(entries);
        },{
            /* valores default */
        });  
        // inicia 
        io.observe(elem); 

    }

 

    //#endregion
    //#region propriedades públicas

    this.setId = function (i) {
        this._id = i;
        this._store();
        return this;
    };
    this.getId = function () {
        return this._id;
    };
    this.setUserId = function (i) {
        this._userId = i;
        this._store();
        return this;
    };
    this.getUserId = function () {
        return this._userId;
    };

    this.setPage = function (i) {
        this._page = i;
        this._store();
        return this;
    };
    this.getPage = function () {
        return this._page;
    };

    this.setQuery = function (idUser,tag,search) {
        this._query = new Array(idUser,tag,search);
        this._store();
        return this;
    };
    this.getQuery = function () {
        return this._query;
    };
         
    this.addView = function () {
        if (this.getId() <= 0) {
           return this;
        }

        var o = new sliceRequest(slice.list.request.method.Get, 'sys/news/add/view/' + this.getId());
        o.obj = this;
        o.onSubmit = function () {
            //this.obj._setStatus(slice.list.interation.status.Sending)._store();
        };
        o.onReady = function () {
            //this.obj._setStatus(slice.list.interation.status.None)._store();
            if (!this.isValidResponse()) {
                //new sliceLoader().show(this.getErrorDescription(), slice.list.loader.type.Info, 5);
                return this;
            }
        };
        o.send();
        return this;
    };

    this.onInViewPort = function (el){ 
        const rect = el.getBoundingClientRect();
        // DOMRect { x: 8, y: 8, width: 100, height: 100, top: 8, right: 108, bottom: 108, left: 8 }
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
        const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

        // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

        return (vertInView && horInView); 
    }

    this.onNewInViewPort = function(){
        var div = document.getElement('news_content_view_' + this.getId());
        if (!div) {
            return this;
        }

        ////***************
        var iD = document.getElement('news-title-image-div-' + this.getId());
        var iMg = document.getElement('news-title-image-' + this.getId());
        if (iD && iMg){
            var wImg = iMg.clientWidth;
            var wDiv = iD.clientWidth;

            var iMr = ( (wDiv - wImg) / 2 ) + 'px';
                                
            if (iMr != iMg.style.marginLeft){
                iMg.style.marginLeft = iMr;
            }
        }
        ////***************

        if (this.onInViewPort(div)){
                    
            var a = document.getElement('news-href-h1-' + this.getId());
            if (a) {
                if( document.title != a.getAttribute("title") ){
                    document.title = a.getAttribute("title");                     
                    window.history.pushState({"html":div.innherHTML,"pageTitle":a.getAttribute("title")},"", a.href);

                    new sliceExternalScp().reloadCounters();  

                    new sliceExternalScp().initDisqusScp('post_' + this.getId(),a.href);
                }
            }
        } 

        setTimeout('new sliceNews().setId('+ this.getId() +').onNewInViewPort();',3000);
        return this;
    }

    this.initView = function () {
        var div = document.getElement('news_content_' + this.getId());
        if (!div) {
            return this;
        }
        setTimeout('new sliceNews().setId(' + this.getId() + ').addView();', (10 * 1000));
        this._code();


        var d3 = document.getElement('news-href-h1-' + this.getId());
        if (d3) {
            ///setTimeout('new sliceNews().setId('+ this.getId() +').onNewInViewPort();',3000);
        }
                
        var user = new sliceUser();
        if (!user.isLogged()) {
            return this;
        }

        var div = document.getElement('edit_bt_' + this.getId());
        if (!div) {
            return this;
        }

        if (!user.isAdmin()) {
         ///   return this;
        }

        var d2 = document.getElement('active_bt_' + this.getId());
        if (d2) {
            var s = ''; 
            if (this.getLang()=="eng"){
                s = '<strong>This post has not yet been validated</strong>. Being able to undergo changes and alterations until someone from the team validates.';
            }else{
                s = '<strong>Esta postagem ainda não foi validada</strong>. Poder sofrer mudanças e alterações até que alguém da equipe valide.';
            }
            new sliceContainer('news-content-msg-top').write(s);
            new sliceContainer('news-content-msg-top').show();
        }
        
         if (user.isAdmin()) {

         //// metosos para usuário ADMIN
            //var s = '<a href="javascript:void(0);" id="btEdit_' + this.getId() + '">Editar Post</a>';
            var s = '';
            
           

            var d2 = document.getElement('active_bt_' + this.getId());
            if (d2) {
                //s += ' | <a href="javascript:void(0);" id="btActive_' + this.getId() + '">Ativar Post</a>';
                s+= '<a class="bt-edit-item bt-et-green" id="btActive_' + this.getId() + '">Ativar</a>';
            } 

             s+= '<a class="bt-edit-item bt-et-red" id="btDel_' + this.getId() + '">Remover</a>';
             s+= '<a class="bt-edit-item bt-et-blue" id="btEdit_' + this.getId() + '">Editar</a>';
           


            new sliceContainer('edit_bt_' + this.getId()).write(s);
            new sliceContainer('edit_bt_' + this.getId()).show();

            var d = document.getElement('edit_bt_' + this.getId());
	        if (d) {
	           ///div.style.marginBottom = "-3em";  
	        }
        
            var d = document.getElement('btEdit_' + this.getId());
            if (d) {
                d.obj = this;
                d.onclick = function () {
                    window.location = 'https://painel.madinfinite.com/editar-post/' + this.obj.getId() + '/';
                }
            }

            var d = document.getElement('btActive_' + this.getId());
            if (d) {
                d.obj = this;
                d.onclick = function () {
                    var confirma = confirm('Tem certeza que deseja ALTERAR o STATUS da publicação?')
                    if (confirma) {
                        window.location = 'https://painel.madinfinite.com/control.php?area=news.active&id=' + this.obj.getId() + '&active=1';
                    }
                }
            }
            
            var d = document.getElement('btDel_' + this.getId());
            if (d) {
            	d.obj = this;
                d.onclick = function () {
                	this.obj.onBtDelClick();
            	}
            }

        }else{
            ///metodos para nào ADMs ///se for o user da news
            if (user.getId() == this.getUserId()){
                ///so exibe o editar se nao estiver ativado
               /* var d2 = document.getElement('active_bt_' + this.getId());
                if (d2) {*/

                    var s = ''; 

                    var d2 = document.getElement('active_bt_' + this.getId());
		            if (d2 && user.getIdStatus() >=3 ) {
		                //s += ' | <a href="javascript:void(0);" id="btActive_' + this.getId() + '">Ativar Post</a>';
		                //s+= '<a class="waves-effect waves-light btn-small orange darken-4" id="btActive_' + this.getId() + '">Active</a>';
                        s+= '<a class="bt-edit-item bt-et-green" id="btActive_' + this.getId() + '">Ativar</a>';
		            }

                    s+= '<a class="bt-edit-item bt-et-red" id="btDel_' + this.getId() + '">Remover</a>';
                    s+= '<a class="bt-edit-item bt-et-blue" id="btEdit_' + this.getId() + '">Editar</a>';
                                                 
            
                    new sliceContainer('edit_bt_' + this.getId()).write(s);
                    new sliceContainer('edit_bt_' + this.getId()).show();

                    var d = document.getElement('btEdit_' + this.getId());
                    if (d) {
                        d.obj = this;
                        d.onclick = function () {
                            window.location = 'https://www.madinfinite.com/share/edit-news/' + this.obj.getId() + '/';
                        }
                    }
                    
                    var d = document.getElement('btDel_' + this.getId());
                    if (d) {
                        d.obj = this;
                        d.onclick = function () {
                            this.obj.onBtDelClick();
                        }
                    }
                    
                    var d = document.getElement('btActive_' + this.getId());
                    if (d) {
                        d.obj = this;
                        d.onclick = function () {
                            this.obj.onBtActiveClick();
                        }
                    }
               /* }else{
                    var s ='';
                    s+='<div class="active-news-msg">';
                    s+='<div class="active-news-msg-title"><em>A notícia foi validada.</em></div>';
                    s+='<div><em>Para editar ou remover, fale com a staff.</em></div>';
                    s+='</div>';
                    new sliceContainer('edit_bt_' + this.getId()).write(s);
                    new sliceContainer('edit_bt_' + this.getId()).show();
                }*/

            }
        }

        return this;
    };
    
    this.onBtDelClick = function(){
    	
    	//console.log('remove');
    	var div = document.getElement('edit_del_div_' + this.getId());
        if (!div) {
            return this;
        }
        div.className = 'item-remove-div';

        var s = '';
        s+='<div class="item-rd-title">Informe o motivo para remover:</div>';
        s+='<div class="item-rd-input"><input type="text" name="reason" id="reason" class="inputText" /></div>'    
        s+='<div class="item-rd-options">'; 
        	s+='<a class="item-rd-bt bt-et-red" id="btRemove">Remove</a>';
        	s+='<a class="item-rd-bt bt-et-grey" id="btCancel">Cancel</a>';
        s+='</div>';        
        
        new sliceContainer('edit_del_div_' + this.getId()).write(s);
        new sliceContainer('edit_del_div_' + this.getId()).show();
        
        
        var d = document.getElement('btCancel');
        if (d) { 
        	d.obj = this;
            d.onclick = function () { 
            	div.className = "hide";
            	new sliceContainer('edit_del_div_' + this.obj.getId()).write('');
            }
        }
        
        
        var d = document.getElement('btRemove');
        if (d) { 
        	d.obj = this;
            d.onclick = function () { 
            	  
		        this.obj._requestRemove(); 
        
            }
        }
    	
    }
	
    this._requestRemove = function (){
           
       	var f = document.getElement('reason');
		if (f.value.length <= 15) {
			new sliceToasts().setText('Insira o motivo corretamente, com pelo menos 15 caracteres!').setStyle('red').setTimeOut(30).show();
		    return;
		}
		
		var confirma = confirm('Tem certeza que deseja REMOVER a publicação?')
        if (!confirma) {
        	return;
        }
       	 
        if (this._getStatus() != slice.list.interation.status.None) {
            console.log("ainda está tentando remover");
            return;
        }
        var user = new sliceUser();
        if (!user.isLogged()) {
        	new sliceToasts().setText('Parece que você não está logado corretamente!').setStyle('red').setTimeOut(30).show();
            return this;
        }
                
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/news/send/remove');         
        o.addPostVar('id', this.getId()); 
        o.addPostVar('reason', f.value);
        o.addPostVar('iduser',user.getId());   
         
       /// o.addPostVar('type_list', this._getType());
        o.obj = this;
        o.onSubmit = function () {
            this.obj._setStatus(slice.list.interation.status.Sending);
            new sliceToasts().setText('Enviando pedido de remoção. Espere!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {

                new sliceToasts().setText('' + this.getErrorDescription()).setStyle('red').show();
                //console.log('Ocorreu um erro ao buscar mensagens: ' + this.getErrorDescription() );
                this.obj._setStatus(slice.list.interation.status.None);
                return;  
            }

            console.log('item removido corretamente');
            //new sliceToasts().setText('Login efetuado com sucesso.').setStyle('green').show();
            new sliceToasts().close();
          
            this.obj._setStatus(slice.list.interation.status.None);
            //this.obj._store();
              
            window.location = window.location['origin'];
        }
        o.send();
    } 
        
    this.onBtActiveClick = function (){
	              			
		var confirma = confirm('Tem certeza que deseja ATIVAR a publicação?')
        if (!confirma) {
        	return;
        }
       	 
        if (this._getStatus() != slice.list.interation.status.None) {
            console.log("ainda está tentando remover");
            return;
        }
        var user = new sliceUser();
        if (!user.isLogged()) {
        	new sliceToasts().setText('It looks like you are not logged in correctly!').setStyle('red').setTimeOut(30).show();
            return this;
        }
                
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/news/send/active');         
        o.addPostVar('id', this.getId()); 
        o.addPostVar('iduser',user.getId());   
         
        
        o.obj = this;
        o.onSubmit = function () {
            this.obj._setStatus(slice.list.interation.status.Sending);
            new sliceToasts().setText('Sending activation request. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {

                new sliceToasts().setText('' + this.getErrorDescription()).setStyle('red').show();
                //console.log('Ocorreu um erro ao buscar mensagens: ' + this.getErrorDescription() );
                this.obj._setStatus(slice.list.interation.status.None);
                return;  
            }

            console.log('item ativado corretamente');
            //new sliceToasts().setText('Login efetuado com sucesso.').setStyle('green').show();
            new sliceToasts().close();
          
            this.obj._setStatus(slice.list.interation.status.None);
            //this.obj._store();  
               
            window.location = new sliceString(window.location.href).str_replace('temporario/','');
        }
        o.send();
    } 
    
    this.prepareLoadNext = function(id, urlLoad){

        var d1 = document.getElement('load_news_content_' + id);
        if (!d1) {
            return this;
        }
        var d2 = document.getElement('news-end-' + this.getId());
        if (!d2) {
            return this;
        }
        
        
        if (this.onInViewPort(d2)){
            ///carrega  
            //console.log('carregando novo conteudo ' + this.getId());
            new sliceContainer('news-end-' + this.getId()).remove();
            this.loadNext(id, urlLoad);

        }else{
            ///aguarda
            //console.log('aguardando novo conteudo ' + this.getId());
            setTimeout('new sliceNews().setId('+ this.getId() +').prepareLoadNext('+ id +',"'+ urlLoad +'");',1500);
        }
        //new sliceNews().onInViewPort(document.getElement('news-end-1394'));                
    }

    this.loadNext = function (id, urlLoad) {

        if (!urlLoad || !id) {
            return this;
        }

        var div = document.getElement('load_news_content_' + id);
        if (!div) {
            return this;
        }
        if (div.innerHTML != '') {
            return this;
        }

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/request/prior/news');
        o.loadID = id;
        o.addPostVar('id', id);
        //o.addPostVar('title', 0);
        o.addPostVar('urlLoad', urlLoad);
        o.obj = this;
        o.onReady = function () {
            if (!this.isValidResponse()) {
                //new sliceLoader().show(this.getErrorDescription(), slice.list.loader.type.Info, 5);
                return this;
            }

            //console.log(this.response.details);
            ///alert('Requisitou novas news para os destaques');

            var div = document.getElement('load_news_content_' + this.loadID);
            if (!div) {
               return this;
            } 
            div.innerHTML = atob(this.response.details.html);
            eval(atob(this.response.details.js));

            //document.title = atob(this.response.details.title); 
            //window.history.pushState({"html":atob(this.response.details.html),"pageTitle":atob(this.response.details.title)},"", atob(this.response.details.url));


        };
        o.send();


    }
    
    this.initList = function (){
   

        var d = document.getElement('news-list-bt');
        if (d) {
            d.obj = this;
            d.onclick = function () {                
                this.obj._requestNewsList();
            }
        }


    }
    
    this.initListByUser = function (){
   

    	var user = new sliceUser();
        if (!user.isLogged()) {
            new sliceContainer('news-list').write('<div class="center"><strong>Log in so we can list what you\'ve already uploaded to the site.</strong></div>');
            return;
        } 
        
    	this.setQuery(user.getId(),"","list-all");
    	
    	new sliceContainer('news-list').write(''); 
    	this._requestNewsList();
    	
        var d = document.getElement('news-list-bt');
        if (d) {
            d.obj = this;
            d.onclick = function () {                
                this.obj._requestNewsList();
            }
        }


    }
        
    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}
//#endregion

//#region sliceVideos
function sliceVideos() {
    //#region proprieades privadas
    this._id = null;
    this._userId = null;
    this._lang = 'br';
    this._page = 0;
    this._query = new Array(0,'','');

    this._status = slice.list.interation.status.None; //define se esta sendo enviado

    this._setStatus = function (status) {
        this._status = status;
        return this;
    };
    this._getStatus = function () {
        return this._status;
    };

    this.setLang = function (i) {
        this._lang = i;
        return this;
    };
    this.getLang = function () {
        return this._lang;
    };

    this._store = function () {
        window._sliceVideos = this;
    };
    this._load = function () {
        var o = window._sliceVideos;
        if (!o) {
            return;
        }
        this.setId(o.getId());
        this.setUserId(o.getUserId());
        this._setStatus(o._getStatus());
        this.setPage(o.getPage());
        this.setQuery(o.getQuery());
        this.setLang(o.getLang());
    };

    this._code = function () {
        var container = new sliceContainer('news_content');
        var c = new sliceCode(new sliceString(container.read()).replaceNewLine()).setNewLineChar("\n").setMaxFlashWidth(715).setMaxFlashHeight(450).setMaxImageWidth(715).setMaxImageHeight(450).setAllowSize(false).setAllowSmileys(true).replace().get();
        container.write(c);
     
        this._adjustUrl();
        
        new sliceContainer('news_links_content_t').show();
         				
        return this;
    }
    
    this._adjustUrl = function(){
    
    	var d = document.getElementsByClassName('postlink');
    	if(!d){
    		return;
    	}
    	
    	var total = d.length;
		for (var n = 0; n != total; n++) {
		
			d[n].target="";	 
			
			var str = d[n].href;
			var str2 = d[n].innerHTML;
			if(str.indexOf("hiding.in") <= 0 && str.indexOf("spaceero.com") <= 0){
			     
				if(str.indexOf("drive.google") > 0 ){
					d[n].href="https://hiding.in/redirect/" + str.split("").reverse().join("");	
				}else{ 
					d[n].href="https://hiding.in/redirect/" + window.btoa(d[n].href); 
				}
				 
							 
			} 
			if(str.indexOf("spaceero.com") <= 0){
				d[n].target="_blank";
			}	 
			var st3 = '...';			
			str2 = str2.replace("a.nz/#!", st3); 
			str2 = str2.replace("oogle.com/file", st3); 
			str2 = str2.replace(".com", st3); 
			str2 = str2.replace(".net", st3); 
			str2 = str2.replace(".org", st3); 
			str2 = str2.replace(".me", st3); 
			str2 = str2.replace(".in", st3); 
			str2 = str2.replace(".cr/", st3); 
			str2 = str2.replace(".com.br", st3); 
			str2 = str2.replace(".../", st3); 
			d[n].innerHTML= str2;
		}    
    }

   this._requestNewsList = function (){
        
        if (this._getStatus() != slice.list.interation.status.None) {
            console.log("ainda está requisitando as mensagens");
            return;
        }
        
        var query = this.getQuery();

        var o = new sliceRequest(slice.list.request.method.Post, 'sys/video/get/list');         
        o.addPostVar('page', this.getPage());

         o.addPostVar('id_user', query[0]);
         o.addPostVar('t_busca', query[1]);
         o.addPostVar('search', query[2]);
         if (this.getLang()=='br'){
            o.addPostVar('is_eng', 'false');
         }else{
            o.addPostVar('is_eng', 'true');
         }


       /// o.addPostVar('type_list', this._getType());
        o.obj = this;
        o.onSubmit = function () {
            this.obj._setStatus(slice.list.interation.status.Sending);
            new sliceToasts().setText('Looking for videos. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {

                new sliceToasts().setText('' + this.getErrorDescription()).setStyle('red').show();
                //console.log('Ocorreu um erro ao buscar mensagens: ' + this.getErrorDescription() );
                this.obj._setStatus(slice.list.interation.status.None);
                return;
            }

            console.log('novos videos obtidas');
            //new sliceToasts().setText('Login efetuado com sucesso.').setStyle('green').show();
            new sliceToasts().close();

            this.obj._mountHtmlList(this.response);

            var d = document.getElement('news-list-total');            
            if (d){
                d.innerHTML = parseInt(d.innerHTML) + this.response.summary.partial.items;                
            } 
            var d2 = document.getElement('news-list-total-2');
            if (d2){
                d2.innerHTML = parseInt(d2.innerHTML) + this.response.summary.partial.items;
            }

           
            if (this.obj.getPage() == this.response.summary.total.pages) {
                new sliceContainer('news-list-bt-bt').remove();
                new sliceContainer('news-list-bt-div').write('You are already watching all videos of this search! '+ this.response.summary.total.items+' in total.');
            }

            this.obj._setStatus(slice.list.interation.status.None);
            this.obj.setPage(this.obj.getPage() + 1);
            this.obj._store();
        }
        o.send();
    }

    this._mountHtmlList = function(response){            
        if (response == null) {
            return;
        }

        //new sliceContainer('loading-div').remove();

        var aItems = new Array();
        for (var n = 0; n != response.summary.partial.items; n++) {
            ////********************************************
            //var obj = response.details.item[n];
            this._getItemsHTML(response.details.item[n]);  
            ////********************************************
        }

        //atualiza os timers
        new sliceTime().update();


    }
    
    this._getItemsHTML = function (obj){

        var div_content = document.getElement('news-list');
        if (!div_content) {
            div_content = document.getElementsByClassName('news-list')[0];
            if (!div_content){
                console.log('div base nao existe');
                return;
            } 
            //console.log('div base não existe');
            //return;
        }

        var divID = 'item-list-' + obj.id;

        //se existe nem faz nada
        if (document.getElement(divID)) { 
            if( document.getElementsByClassName(divID)[0] ){
                return;
            }
        }

       
		var imgCss = ' ';   
		if ( obj.width < 665 ){  
			imgCss = ' item-list-p';
		}   


        ////cria o separador
        var div = document.createElement('div');
        div.setAttribute('class', 'news-list-div');
        div_content.appendChild(div);

         ////cria o div da news
        var div = document.createElement('div');
        div.setAttribute('id', divID); 
        div.setAttribute('class', 'item-list' + imgCss);
                   

        var s = '';
                         		
        var alt = obj.alt;
	
        ///s.='<div class="item-list '.$cssP.' item-list-'.$obj->id.'">';				
			s+='<div class="item-list-image ">';
			s+='<div class="il-image-type">';
				s+='<a class="il-image-type-item" href="'+ obj.type.url +'" title="'+ obj.type.title +'">&#35;'+ obj.type.title +'</a>';
				//s+='<a href="#" class="il-image-type-item">Indie</a>';
			s+='</div>'; 
			s+='<a href="' + obj.url + '" alt="' + alt + '" title="' + alt + '">';
				s+='<img alt="' + alt + '" title="' + alt + '" src="'+ obj.image +'" >';
			s+='</a>';
		s+='</div>';				
		s+='<div class="item-list-content">';
			s+='<div class="ilc-title"><h3><a href="' + obj.url + '" title="' + alt + '">' + new sliceString(obj.title).str_replace('.,,.','"') + '</a></h3></div>';
			s+='<div class="ilc-message">';
				if (obj.tags != ''){
					s+='<a href="' + obj.url + '" alt="' + alt + '" title="' + alt + '">' + obj.tags + '</a>';
				}
			s+='</div>';
			s+='<div class="ilc-details">';							  
				s+='<div class="ilc-chip">By <strong>' + obj.user.name + '</strong>, <time datetime="'+ obj.time.rfc +'">'+ obj.time.rfc +' [Full]</time></div>';
				//s+='<div class="ilc-chip ilc-chip-comment hide-on-low"><a href="' + obj.url + '#disqus_thread" identifier="post_' + obj.id + '">0</a> <span class="material-icons">chat_bubble</span></div>';
			s+='</div>';
		s+='</div>';				
		//s+='</div>'; 

       
        div.innerHTML = s;
        //adiciona abaixo do anterior
        div_content.appendChild(div);

    }
 
    //#endregion
    //#region propriedades públicas

    this.setId = function (i) {
        this._id = i;
        this._store();
        return this;
    };
    this.getId = function () {
        return this._id;
    };
    this.setUserId = function (i) {
        this._userId = i;
        this._store();
        return this;
    };
    this.getUserId = function () {
        return this._userId;
    };

    this.setPage = function (i) {
        this._page = i;
        this._store();
        return this;
    };
    this.getPage = function () {
        return this._page;
    };

    this.setQuery = function (idUser,tag,search) {
        this._query = new Array(idUser,tag,search);
        this._store();
        return this;
    };
    this.getQuery = function () {
        return this._query;
    };
         
    this.addView = function () {
        if (this.getId() <= 0) {
            return;
        }

        var o = new sliceRequest(slice.list.request.method.Get, 'sys/video/add/view/' + this.getId());
        o.obj = this;
        o.onSubmit = function () {
            //this.obj._setStatus(slice.list.interation.status.Sending)._store();
        };
        o.onReady = function () {
            //this.obj._setStatus(slice.list.interation.status.None)._store();
            if (!this.isValidResponse()) {
                //new sliceLoader().show(this.getErrorDescription(), slice.list.loader.type.Info, 5);
                return;
            }
        };
        o.send();
        return;
    };
        
    this.initList = function (){
        var d = document.getElement('news-list-bt');
        if (d) {
            d.obj = this;
            d.onclick = function () {                
                this.obj._requestNewsList();
            }
        }
    }
    
    this.initListByUser = function (){   

    	var user = new sliceUser();
        if (!user.isLogged()) {
            new sliceContainer('news-list').write('<div class="center"><strong>Log in so we can list what you\'ve already uploaded to the site.</strong></div>');
            return;
        } 
        
    	this.setQuery(user.getId(),"","list-all");
    	
    	new sliceContainer('news-list').write(''); 
    	this._requestNewsList();
    	
        var d = document.getElement('news-list-bt');
        if (d) {
            d.obj = this;
            d.onclick = function () {                
                this.obj._requestNewsList();
            }
        }
    }
             
    this.initView = function () {
        var div = document.getElement('news_content_' + this.getId());
        if (!div) {
           return this;
        }
        setTimeout('new sliceVideos().addView();', (10 * 1000));
        this._code();

        var user = new sliceUser();
        if (!user.isLogged()) {
           return this;
        }

        var div = document.getElement('edit_bt_' + this.getId());
        if (!div) {
            return this;
        }

        if (!user.isAdmin()) {
            ///return this;
        }
        
        var d2 = document.getElement('active_bt_' + this.getId());
        if (d2) {
            var s = '<strong>This video has not yet been validated</strong>. Being able to undergo changes and alterations until someone from the team validates it.';
            new sliceContainer('news-content-msg-top').write(s);
            new sliceContainer('news-content-msg-top').show();
        }


        if (user.isAdmin()) {

         //// metosos para usuário ADMIN
            var s = '';

            var d2 = document.getElement('active_bt_' + this.getId());
            if (d2) {
                //s += ' | <a href="javascript:void(0);" id="btActive_' + this.getId() + '">Ativar Post</a>';
                s+= '<a class="bt-edit-item bt-et-green" id="btActive_' + this.getId() + '">Ativar</a>';
            } 

             s+= '<a class="bt-edit-item bt-et-red" id="btDel_' + this.getId() + '">Remover</a>';
             s+= '<a class="bt-edit-item bt-et-blue" id="btEdit_' + this.getId() + '">Editar</a>';
           
           
            
            new sliceContainer('edit_bt_' + this.getId()).write(s);
            new sliceContainer('edit_bt_' + this.getId()).show();

            var d = document.getElement('btEdit');
            if (d) {
                d.obj = this;
                d.onclick = function () {
                    window.location = 'https://painel.madinfinite.com/editar-video/' + this.obj.getId() + '/';
                }
            }

            var d = document.getElement('btActive_' + this.getId());
            if (d) {
                d.obj = this;
                d.onclick = function () {
                    var confirma = confirm('Are you sure to CHANGE THE STATUS of the video?')
                    if (confirma) {
                        window.location = 'https://painel.madinfinite.com/control.php?area=video.active&id=' + this.obj.getId() + '&active=1';
                    }
                }
            }
            
            var d = document.getElement('btDel_' + this.getId());
            if (d) {
            	d.obj = this;
                d.onclick = function () {
                	this.obj.onBtDelClick();
            	}
            }
             
                        
        }else{
            ///metodos para nào ADMs ///se for o user da news
            if (user.getId() == this.getUserId()){
                ///so exibe o editar se nao estiver ativado
                /*var d2 = document.getElement('active_bt_' + this.getId());
                if (d2) {*/

                     var s = ''; 

                    var d2 = document.getElement('active_bt_' + this.getId());
		            if (d2 && user.getIdStatus() >=3 ) {
		                //s += ' | <a href="javascript:void(0);" id="btActive_' + this.getId() + '">Ativar Post</a>';
		                //s+= '<a class="waves-effect waves-light btn-small orange darken-4" id="btActive_' + this.getId() + '">Active</a>';
                        s+= '<a class="bt-edit-item bt-et-green" id="btActive_' + this.getId() + '">Ativar</a>';
		            }

                    s+= '<a class="bt-edit-item bt-et-red" id="btDel_' + this.getId() + '">Remover</a>';
                    s+= '<a class="bt-edit-item bt-et-blue" id="btEdit_' + this.getId() + '">Editar</a>';
                    
                                        		            
                    new sliceContainer('edit_bt_' + this.getId()).write(s);
                    new sliceContainer('edit_bt_' + this.getId()).show();

                    var d = document.getElement('btEdit_' + this.getId());
                    if (d) {
                        d.obj = this;
                        d.onclick = function () {
                            window.location = 'https://www.madinfinite.com/share/edit-video/' + this.obj.getId() + '/';
                        }
                    }
                    
                    var d = document.getElement('btDel_' + this.getId());
		            if (d) {
		            	d.obj = this;
		                d.onclick = function () {
		                	this.obj.onBtDelClick();
		            	}
		            }
		            
		            var d = document.getElement('btActive_' + this.getId());
                    if (d) {
                        d.obj = this;
                        d.onclick = function () {
                            this.obj.onBtActiveClick();
                        }
                    }
                /*}else{
                    var s ='';
                    s+='<div class="active-news-msg">';
                    s+='<div class="active-news-msg-title"><em>O vídeo foi validado.</em></div>';
                    s+='<div><em>Para editar ou remover, fale com a staff.</em></div>';
                    s+='</div>';
                    new sliceContainer('edit_bt_' + this.getId()).write(s);
                    new sliceContainer('edit_bt_' + this.getId()).show();
                }*/

            }
        }
                        
        return this;          
    };
        
    this.onBtDelClick = function(){
    	
    	//console.log('remove');
    	var div = document.getElement('edit_del_div_' + this.getId());
        if (!div) {
            return this;
        }
        div.className = 'item-remove-div';

        var s = '';
        s+='<div class="item-rd-title">Informe o motivo para remover:</div>';
        s+='<div class="item-rd-input"><input type="text" name="reason" id="reason" class="inputText" /></div>'    
        s+='<div class="item-rd-options">'; 
        	s+='<a class="item-rd-bt bt-et-red" id="btRemove">Remove</a>';
        	s+='<a class="item-rd-bt bt-et-grey" id="btCancel">Cancel</a>';
        s+='</div>';        
        
        new sliceContainer('edit_del_div_' + this.getId()).write(s);
        new sliceContainer('edit_del_div_' + this.getId()).show();
        
        
        var d = document.getElement('btCancel');
        if (d) { 
        	d.obj = this;
            d.onclick = function () { 
            	div.className = "hide";
            	new sliceContainer('edit_del_div_' + this.obj.getId()).write('');
            }
        }
        
        
        var d = document.getElement('btRemove');
        if (d) { 
        	d.obj = this;
            d.onclick = function () { 
            	  
		        this.obj._requestRemove(); 
        
            }
        }
    	
    }
	this._requestRemove = function (){
        
       	var f = document.getElement('reason');
		if (f.value.length <= 15) {
			new sliceToasts().setText('Enter the reason correctly, with at least 15 characters!').setStyle('red').setTimeOut(30).show();
		    return;
		}
		
		var confirma = confirm('Are you sure to REMOVE the video?')
        if (!confirma) {
        	return;
        }
       	 
        if (this._getStatus() != slice.list.interation.status.None) {
            console.log("ainda está tentando remover");
            return;
        }
        var user = new sliceUser();
        if (!user.isLogged()) {
        	new sliceToasts().setText('It looks like you are not logged in correctly!').setStyle('red').setTimeOut(30).show();
            return this;
        }
                
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/video/send/remove');         
        o.addPostVar('id', this.getId()); 
        o.addPostVar('reason', f.value);
        o.addPostVar('iduser',user.getId());   
         
       /// o.addPostVar('type_list', this._getType());
        o.obj = this;
        o.onSubmit = function () {
            this.obj._setStatus(slice.list.interation.status.Sending);
            new sliceToasts().setText('Submitting removal request. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {

                new sliceToasts().setText('' + this.getErrorDescription()).setStyle('red').show();
                //console.log('Ocorreu um erro ao buscar mensagens: ' + this.getErrorDescription() );
                this.obj._setStatus(slice.list.interation.status.None);
                return;  
            }

            console.log('item removido corretamente');
            //new sliceToasts().setText('Login efetuado com sucesso.').setStyle('green').show();
            new sliceToasts().close();
          
            this.obj._setStatus(slice.list.interation.status.None);
            //this.obj._store();
              
            window.location = window.location['origin'];
        }
        o.send();
    } 
        
    this.onBtActiveClick = function (){
	              			
		var confirma = confirm('Are you sure to turn the publication ON?')
        if (!confirma) {
        	return;
        }
       	 
        if (this._getStatus() != slice.list.interation.status.None) {
            console.log("ainda está tentando remover");
            return;
        }
        var user = new sliceUser();
        if (!user.isLogged()) {
        	new sliceToasts().setText('It looks like you are not logged in correctly!').setStyle('red').setTimeOut(30).show();
            return this;
        }
                
        var o = new sliceRequest(slice.list.request.method.Post, 'sys/video/send/active');         
        o.addPostVar('id', this.getId()); 
        o.addPostVar('iduser',user.getId());   
         
        
        o.obj = this;
        o.onSubmit = function () {
            this.obj._setStatus(slice.list.interation.status.Sending);
            new sliceToasts().setText('Sending activation request. Wait!').setStyle('normal').setTimeOut(30).show();
        };
        o.onReady = function () {
            if (!this.isValidResponse()) {

                new sliceToasts().setText('' + this.getErrorDescription()).setStyle('red').show();
                //console.log('Ocorreu um erro ao buscar mensagens: ' + this.getErrorDescription() );
                this.obj._setStatus(slice.list.interation.status.None);
                return;  
            }

            console.log('item ativado corretamente');
            //new sliceToasts().setText('Login efetuado com sucesso.').setStyle('green').show();
            new sliceToasts().close();
          
            this.obj._setStatus(slice.list.interation.status.None);
            //this.obj._store();  
               
            window.location = new sliceString(window.location.href).str_replace('temporario/','');
        }
        o.send();
    } 
 
                 
     //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}

//#endregion

//#region sliceSlide
function sliceSlide() {
    //#region proprieades privadas
    this._status = 0; // slice.list.interation.status.None; //define se esta sendo enviado
    this._total = 0;
    this._id = 0;
    this._atual = 0;
    this._setStatus = function (status) {
        this._status = status;
        return this;
    };
    this._getStatus = function () {
        return this._status;
    };

    this._setTotal = function (i) {
        this._total = i;
        this._store();
        return this;
    };
    this._getTotal = function () {
        return this._total;
    };

    this._getId = function () {
        return this._id;
    };
    this._setId = function (i) {
        this._id = i;
        this._store();
        return this;
    };

    this._getAtual = function () {
        return this._atual;
    };
    this._setAtual = function (i) {
        this._atual = i;
        this._store();
        return this;
    };


    this._store = function () {
        window._sliceSlide = this;
    };
    this._load = function () {
        var o = window._sliceSlide;
        if (!o) {
            return;
        }
        this._setId(o._getId());
        this._setAtual(o._getAtual());
        this._setTotal(o._getTotal());
        this._setStatus(o._getStatus());
    };

    this._flip = function (atualDiv) {
        var d = document.getElement('slide-home');
        if (!d) {
            return;
        }
        for (i = 1; i <= this._getTotal(); i++) {
            var d = document.getElement('slide-item-' + i);
            if (d) {
                d.style.display = "none";
                //d.className = 'slide-home-item slide-item-'+i;
            }
            var d1 = document.getElement('slice-tab-'+i);
            if (d1){
            	d1.className = 'slice-tab-item truncate slice-tab-'+i;
            }
             
        }
        if (atualDiv > this._getTotal()) {
            atualDiv = 1;
        }

        var d = document.getElement('slide-item-' + atualDiv);
        if (d) {
            d.style.display = "block";
            //d.className = 'slide-home-item hide slide-item-'+atualDiv;
        }
        var d1 = document.getElement('slice-tab-'+ atualDiv);
        if (d1){
          	d1.className = 'slice-tab-item slice-tab-item-active truncate slice-tab-'+atualDiv+'';
        }

        this._setAtual(atualDiv);


        atualDiv++;
        var id = setTimeout('new sliceSlide()._flip(' + atualDiv + ');', 5000);
        this._setId(id);
    };

    //#endregion
    //#region propriedades públicas
    this.init = function () {
        var d = document.getElement('slide-home');
        if (!d) {
            return;
        }

        for (i = 1; i <= this._getTotal(); i++) {
            var d = document.getElement('slice-tab-'+i);
            if (d){
            	d.obj = this;
            	d.nView = i;
	            d.onclick = function () {
	                this.obj.view(this.nView);
	            } 
                d.onmouseover = function () {
	                //this.obj.view(this.nView);
	            } 
            }
             
        }
        
        /*var d = document.getElement('bt-slide-next');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj.next();
            }
        }
        var d = document.getElement('bt-slide-last');
        if (d) {
            d.obj = this;
            d.onclick = function () {
                this.obj.last();
            }
        }*/

        this._flip(1);
    }
    this.setTotal = function (i) {
        this._total = i;
        return this;
    };
   
    this.view = function (id) {
        this._load();
        clearTimeout(this._getId());
        this._flip(id);
    }

    this.next = function () {
        var i = this._getAtual();
        i++;
        if (i > this._getTotal()) {
            i = 1;
        }
        this._load();
        clearTimeout(this._getId());
        this._flip(i);
    }
    this.last = function () {
        var i = this._getAtual();
        i--;
        if (i <= 0) {
            i = this._getTotal();
        }
        this._load();
        clearTimeout(this._getId());
        this._flip(i);
    }

    //#endregion
    //#region construtor
    this._load();

    this._store();
    //#endregion
}

//#endregion


//#region list
//1=>disponível,2=>ocupado,3=>ausente,4=>invisível
if (!slice) {
    var slice = new Object();
    slice.list = {}
}

slice.list.modal = {
    style: {
        normal: 'modal_style_normal',
        mini: 'modal_style_mini',
        small: 'modal_style_small',
        medium: 'modal_style_medium',
        big: 'modal_style_big'
    }
}



slice.list.search = {
    type: {
        News: 1
    }
}
slice.list.comment = {
    area: {
        None: 0,
        News: 1
    }
}


//#endregion



//#region slide
  
function slider(set) {
	const sliderContainer = document.querySelector(set.name),
		slider = sliderContainer.querySelector('.slider'),
		sliderItem = slider.querySelectorAll('.slider__item'),
    sliderArrows = sliderContainer.querySelectorAll('.arrows__item');

    var objTimeOut = null;
    var timeOut = 6000;
    
	let dotsCreate,
		dotsClass,
		dotsFunk,
		numberSlider,
		numberSliderWork,
		sliderExecutionLine,
    sliderExecutionLineWork;
    
	// calculate the maximum width of all slides
	function forSliderItem(t) {
		t = 0;
		for(let i = 0; i < sliderItem.length - 1; i++) {
			t += sliderItem[i].clientWidth;
		}
		return t;
  }
  
	let maxWidth = forSliderItem(sliderItem), // maximum width of all slides
		slidWidth = 0, // main variable for calculating the movement of the slider
    count = 0; // counter
    
	//===== flip left
	function flipLeft(){        
		if(count !== 0) {
			count--;
			slidWidth -= sliderItem[count].clientWidth;
			slider.style.transform = `translateX(-${slidWidth}px)`;
		} else {
			count = sliderItem.length - 1;
			slidWidth = maxWidth;
			slider.style.transform = `translateX(-${slidWidth}px)`;
    	}
    
		if(set.dots) {
			dotsFunk();
		}
		if(set.numberSlid) {
			numberSliderWork(count);
		}
		if(set.line) {
			sliderExecutionLineWork(count);
		}		
	}
	
	sliderArrows[0].addEventListener('click', function(){
        flipLeft();
        clearInterval(objTimeOut); 
        objTimeOut = setInterval(flipRight,timeOut); 
    });
  
	//===== flip right  
	function flipRight(){
        if(count < sliderItem.length - 1) {
			count++;
			slidWidth += sliderItem[count].clientWidth;
			slider.style.transform = `translateX(-${slidWidth}px)`;
		} else {
			count = 0;
			slidWidth = 0;
			slider.style.transform = `translateX(-${slidWidth}px)`;
    	}
    
		if(set.dots) {
			dotsFunk();
		}
		if(set.numberSlid) {
			numberSliderWork(count);
		}
		if(set.line) {
			sliderExecutionLineWork(count);
		}		
	}
	
    objTimeOut = setInterval(flipRight,timeOut);  

	sliderArrows[1].addEventListener('click', function(){
        flipRight();
        clearInterval(objTimeOut); 
        objTimeOut = setInterval(flipRight,timeOut); 

    }); 
		  
	//===== dots
	if(set.dots) {
		dotsCreate = function() {
			const dotContainer = document.createElement('div'); // create dots container
			dotContainer.classList.add('dots');
			// create the required number of dots and insert a container into the dots
			sliderItem.forEach(() => {
				let dotsItem = document.createElement('span');
				dotContainer.append(dotsItem);
			});
			sliderContainer.append(dotContainer);
		};
    dotsCreate();
    
		// add the class to the desired dots, and remove from the rest
		dotsClass = function(remove, add) {
			remove.classList.remove('dots_active');
			add.classList.add('dots_active');
    };
    
		// move slides by clicking on the dot
		dotsFunk = function() {
			const dotsWork = sliderContainer.querySelectorAll('.dots span'); // we get dots
			dotsWork.forEach((item, i) => {
				dotsClass(dotsWork[i], dotsWork[count]);
				item.addEventListener('click', function() {
					count = i;
					// multiply the slide size by the number of the dots, and get the number by which you need to move the slider
					slidWidth = sliderItem[0].clientWidth * i;
					slider.style.transform = `translateX(-${slidWidth}px)`;
					for(let j = 0; j < dotsWork.length; j++) {
						dotsClass(dotsWork[j], dotsWork[count]);
					}
					if(set.dots && set.numberSlid) {
						numberSliderWork(count);
					}
					if(set.line) {
						sliderExecutionLineWork(count);
					}
				});
			});
		};
		dotsFunk();
  }
  
	//=====  count slider
	if(set.numberSlid) {
		numberSlider = function(item) {
			const countContainer = document.createElement('div'),
				sliderNumber = document.createElement('span'),
				slash = document.createElement('span'),
				allSliderNumber = document.createElement('span');
			sliderNumber.innerHTML = item + 1;
			slash.innerHTML = '/';
			allSliderNumber.innerHTML = sliderItem.length;
			countContainer.classList.add('count-slides');
			countContainer.append(sliderNumber, slash, allSliderNumber);
			sliderContainer.append(countContainer);
		};
    numberSlider(0);
    
		numberSliderWork = function(item) {
			const sliderNumberNow = sliderContainer.querySelector('.count-slides span');
			sliderNumberNow.innerHTML = item + 1;
			if(set.line) {
				sliderExecutionLineWork(item);
			}
		};
  }
  
	//=====  slider execution line
	if(set.line) {
		sliderExecutionLine = function() {
			const sliderLine = document.createElement('div'),
				sliderLineProgress = document.createElement('div');
			sliderLine.classList.add('slider-execution-line');
			sliderLineProgress.classList.add('slider-execution-line__progress');
			sliderLine.append(sliderLineProgress);
			slider.after(sliderLine);
		};
    sliderExecutionLine();
    
		sliderExecutionLineWork = function(itemCount) {
			const sliderLineProgress = sliderContainer.querySelector('.slider-execution-line__progress');
			let t = 100 / sliderItem.length; // how much % each slide takes
			t *= (itemCount + 1);
			sliderLineProgress.style.width = `${t}%`;
		};
		sliderExecutionLineWork(0);
	}
}

//#endregion



/***
carrega metodos ao completar o load da pagina
*** */
function init() {
    //so inicia se ja tiver carregado a pagina
    if (document.readyState == "complete") {
        ///*********
        console.log("INICOU SLICE SCRIPT");

        new sliceLayout().init();
        new sliceTheme().init(); 


        new sliceUser().init();
        new sliceProtectMedia().setProtect(true).init();
        //new sliceTime().update();

        ///*********
    } else {
        setTimeout('init();', 100);
    }
}
init();
