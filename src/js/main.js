(function($){
    
    var paginate = {
        startPos: function(pageNumber, perPage) {
            // determine what array position to start from
            // based on current page and # per page
            return pageNumber * perPage;
        },

        getPage: function(items, startPos, perPage) {
            // declare an empty array to hold our page items
            var page = [];

            // only get items after the starting position
            items = items.slice(startPos, items.length);

            // loop remaining items until max per page
            for (var i=0; i < perPage; i++) {
                page.push(items[i]); }

            return page;
        },

        totalPages: function(items, perPage) {
            // determine total number of pages
            return Math.ceil(items.length / perPage);
        },

        createBtns: function(totalPages, currentPage) {
            // create buttons to manipulate current page
            var pagination = $('<div class="pagination" />');

            // add a "first" button
            pagination.append('<span class="pagination-button">&laquo;</span>');

            // add pages inbetween
            for (var i=1; i <= totalPages; i++) {
                // truncate list when too large
                if (totalPages > 5 && currentPage !== i) {
                    // if on first two pages
                    if (currentPage === 1 || currentPage === 2) {
                        // show first 5 pages
                        if (i > 5) continue;
                    // if on last two pages
                    } else if (currentPage === totalPages || currentPage === totalPages - 1) {
                        // show last 5 pages
                        if (i < totalPages - 4) continue;
                    // otherwise show 5 pages w/ current in middle
                    } else {
                        if (i < currentPage - 2 || i > currentPage + 2) {
                            continue; }
                    }
                }

                // markup for page button
                var pageBtn = $('<span class="pagination-button page-num" />');

                // add active class for current page
                if (i == currentPage) {
                    pageBtn.addClass('active'); }

                // set text to the page number
                pageBtn.text(i);

                // add button to the container
                pagination.append(pageBtn);
            }

            // add a "last" button
            pagination.append($('<span class="pagination-button">&raquo;</span>'));

            return pagination;
        },

        createPage: function(items, currentPage, perPage) {
            // remove pagination from the page
            $('.pagination').remove();

            // set context for the items
            var container = items.parent(),
                // detach items from the page and cast as array
                items = items.detach().toArray(),
                // get start position and select items for page
                startPos = this.startPos(currentPage - 1, perPage),
                page = this.getPage(items, startPos, perPage);

            // loop items and readd to page
            $.each(page, function(){
                // prevent empty items that return as Window
                if (this.window === undefined) {
                    container.append($(this)); }
            });

            // prep pagination buttons and add to page
            var totalPages = this.totalPages(items, perPage),
                pageButtons = this.createBtns(totalPages, currentPage);

            container.after(pageButtons);
        }
    };

    $.fn.paginate = function(perPage) {
        var items = $(this);

        if (isNaN(perPage) || perPage === undefined) {
            perPage = 5; }

        if (items.length <= perPage) {
            return true; }

        if (items.length !== items.parent()[0].children.length) {
            items.wrapAll('<div class="pagination-items" />');
        }

        paginate.createPage(items, 1, perPage);

        $(document).on('click', '.pagination-button', function(e) {

            var currentPage = parseInt($('.pagination-button.active').text(), 10),
                newPage = currentPage,
                totalPages = paginate.totalPages(items, perPage),
                target = $(e.target);

            newPage = parseInt(target.text(), 10);
            if (target.text() == '«') newPage = 1;
            if (target.text() == '»') newPage = totalPages;

            if (newPage > 0 && newPage <= totalPages) {
                paginate.createPage(items, newPage, perPage); }
        });
    };

})($);

$( document ).ready(function() {

    $('#gt_btn').click(function(){
        $('#github_search').html('');
        $('#not-found').hide();
        var gt_keyword = $('#github_keyword').val();
        github_search(gt_keyword);
        return false;
    });
});			

// search github repository function
function github_search(gt_keyword) {
    $.ajax({
        url: 'https://api.github.com/search/repositories?q='+gt_keyword+'&sort=stars',
        client_id : '1c3ffa27a30ef6e46b4',
        client_secret: '4297094458360742ec348742ecc2112d8eeadb75',
    }).done(function (data) {
        console.log(data);
        var html = '';
        $.each(data.items, function(i, item) {
            html += '<div class="card-body"><div class="body-header"><h5 class="card-title"><a href="'+data.items[i].svn_url+'" target="_BLANK">'+data.items[i].full_name+'</a></h5>';
            html += '<div class="gt-stat"><ul><li><i class="fas fa-circle"></i> '+data.items[i].language+'</li><li> <i class="fas fa-star"></i> <a href="'+data.items[i].svn_url+'/stargazers" target="_BLANK">'+addCommas(data.items[i].stargazers_count)+'</a></li></ul>';
            if(data.items[i].description != ''){
                html += '</div></div><p class="card-text">'+htmlEntities(data.items[i].description)+'</p>';
            }else{
                html += '</div>';
            }
            html += '<p class="card-text"><small class="text-muted"> Last updated '+relative_time(data.items[i].updated_at)+'</small></p></div>';
        });
        // html += '<p align="center" class="github_more_rep"><input type="submit" value="More" class="gt_more"></p>';
        // html += '<nav aria-label="Page navigation example"><ul class="pagination">'
        // +'<li class="page-item"><a class="page-link" href="#">Previous</a></li>'
        // +'<li class="page-item"><a class="page-link" href="#">1</a></li>'
        // +'<li class="page-item"><a class="page-link" href="#">2</a></li>'
        // +'<li class="page-item"><a class="page-link" href="#">3</a></li>'
        // +'<li class="page-item"><a class="page-link" href="#">Next</a></li></ul></nav>';

        $('#github_search').append(html);
        // console.log(data.items.length);
        if(data.items.length == 0) {
            $('#gt_keywoard').val('');
            $('#not-found').show();
            
        }
        if(data.items.length < 10){
            $('.card-body').paginate(false);
        }

        // $('.gt_more').click(function(){
        //     github_search(gt_keyword,gt_page + 1);
        //     $( ".github_more_rep" ).css( "display", "none" );
        //     return false;
        // });
    });
}
    
// htmlEntities function
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
        
// relative_time function
function relative_time(date_str) {
    if (!date_str) {return;}
    date_str = $.trim(date_str);
    date_str = date_str.replace(/\.\d\d\d+/,"");
    date_str = date_str.replace(/-/,"/").replace(/-/,"/");
    date_str = date_str.replace(/T/," ").replace(/Z/," UTC");
    date_str = date_str.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2");
    var parsed_date = new Date(date_str);
    var relative_to = (arguments.length > 1) ? arguments[1] : new Date(); 
    var delta = parseInt((relative_to.getTime()-parsed_date)/1000);
    delta=(delta<2)?2:delta;
    var r = '';
    if (delta < 60) {
        r = 'Just now';
    } else if(delta < 120) {
        r = 'a minute';
    } else if(delta < (45*60)) {
        r = (parseInt(delta / 60, 10)).toString() + ' minutes ago';
    } else if(delta < (2*60*60)) {
        r = 'a hour';
    } else if(delta < (24*60*60)) {
        r = (parseInt(delta / 3600, 10)).toString() + ' hours ago';
    } else if(delta < (48*60*60)) {
        r = 'a day';
    } else {
        r = (parseInt(delta / 86400, 10)).toString() + ' days ago';
    }
    return r;
};

// number_format function
function addCommas(nStr)
{
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

